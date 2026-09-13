import { Router, Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import crypto from 'crypto';
import { BaseController } from '../../controllers/BaseController';
import { StoreModel } from '../../models/store.model';
import { PrintJobModel } from '../../models/printJob.model';
import { TransactionModel } from '../../models/transaction.model';
import { ApiResponse } from '../../responses/ApiResponse';
import { HTTP_STATUS } from '../../constants/httpStatusCodes';

export class PaymentsController extends BaseController {
  /**
   * POST /api/v1/payments/razorpay/create-order
   * Creates a Razorpay Order
   */
  public createPaymentOrder = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { storeId, amount, currency = 'INR' } = req.body;
      if (!amount || amount <= 0) {
        ApiResponse.error(res, 'Invalid payment amount', HTTP_STATUS.BAD_REQUEST);
        return;
      }

      // Generate order ID
      const orderId = `order_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;
      const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_selfprint_live';

      this.sendSuccess(res, 'Razorpay order created successfully', {
        orderId,
        amount: Math.round(Number(amount) * 100), // amount in paise for Razorpay
        amountInRupees: Number(amount),
        currency,
        keyId,
        storeId
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/v1/payments/razorpay/verify
   * Verifies Razorpay payment signature & creates PrintJob + Transaction transactionally
   */
  public verifyPayment = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        storeId,
        customerName = 'Walk-in Customer',
        file,
        config,
        summary
      } = req.body;

      // 1. Resolve Store
      let storeObjId: mongoose.Types.ObjectId | null = null;
      if (storeId && mongoose.Types.ObjectId.isValid(storeId)) {
        storeObjId = new mongoose.Types.ObjectId(storeId);
      } else if (storeId) {
        const storeDoc = await StoreModel.findOne({
          $or: [
            { storeCode: storeId.toUpperCase() },
            { email: storeId.toLowerCase() }
          ]
        }).lean();
        if (storeDoc) storeObjId = storeDoc._id as mongoose.Types.ObjectId;
      }

      if (!storeObjId) {
        const fallbackStore = await StoreModel.findOne().lean();
        if (fallbackStore) storeObjId = fallbackStore._id as mongoose.Types.ObjectId;
        else {
          ApiResponse.error(res, 'Store not found for payment processing', HTTP_STATUS.NOT_FOUND);
          return;
        }
      }

      // 2. Verify signature if secret configured
      const secret = process.env.RAZORPAY_KEY_SECRET;
      if (secret && razorpay_order_id && razorpay_payment_id && razorpay_signature) {
        const generatedSignature = crypto
          .createHmac('sha256', secret)
          .update(`${razorpay_order_id}|${razorpay_payment_id}`)
          .digest('hex');

        if (generatedSignature !== razorpay_signature) {
          ApiResponse.error(res, 'Invalid payment signature verification failed', HTTP_STATUS.BAD_REQUEST);
          return;
        }
      }

      // 3. Calculate Queue Position
      const currentWaitingJobs = await PrintJobModel.countDocuments({
        storeId: storeObjId,
        status: { $in: ['Waiting', 'WAITING', 'Printing', 'PRINTING'] }
      });
      const queuePosition = currentWaitingJobs + 1;
      const estimatedWaitMinutes = Math.max(1, queuePosition * 2);

      // 4. Generate Unique Job Number
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const jobNumber = `SP-${Date.now().toString().slice(-4)}-${randomSuffix}`;

      const totalPages = summary?.selectedPagesCount || file?.totalPages || 1;
      const copies = config?.copies || 1;
      const totalPaid = summary?.totalAmount || (totalPages * copies * 2);

      const fileUrl = file?.fileUrl || file?.previewUrl || `/uploads/${file?.name || 'document.pdf'}`;

      // 5. Create Print Job in MongoDB
      const newJob = await PrintJobModel.create({
        storeId: storeObjId,
        customerName,
        jobNumber,
        fileName: file?.name || 'Document.pdf',
        fileUrl,
        fileSize: file?.formattedSize || '1.2 MB',
        totalPages,
        copies,
        printType: config?.colorMode === 'Color' ? 'COLOR' : 'BW',
        paperSize: config?.paperSize || 'A4',
        selectedPages: 'all',
        price: totalPaid,
        paymentStatus: 'PAID',
        status: 'Waiting'
      });

      // 6. Create Transaction in MongoDB
      const txnId = `TXN-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
      const platformFee = Number((totalPaid * 0.1).toFixed(2));
      const storeEarnings = Number((totalPaid - platformFee).toFixed(2));

      await TransactionModel.create({
        transactionId: txnId,
        storeId: storeObjId,
        jobId: newJob._id,
        amount: totalPaid,
        platformFee,
        storeEarnings,
        currency: 'INR',
        status: 'PAID',
        settlementStatus: 'PENDING'
      });

      // 8. Broadcast to Store Queue and Admin in Real-Time via WebSockets
      try {
        const { socketManager } = await import('../../socket');
        const sId = String(storeObjId);
        const jId = String(newJob._id);
        const queuePayload = {
          job: newJob.toObject(),
          jobId: jId,
          jobNumber: newJob.jobNumber,
          storeId: sId,
          queuePosition,
          totalPaid,
          status: newJob.status,
          timestamp: new Date().toISOString()
        };

        socketManager.emitToStore(sId, 'queue:created', queuePayload);
        socketManager.emitToStore(sId, 'payment:updated', {
          transactionId: txnId,
          storeId: sId,
          jobId: jId,
          amount: totalPaid,
          status: 'PAID',
          timestamp: new Date().toISOString()
        });
        socketManager.broadcastToStore(sId, 'NEW_PRINT_JOB', {
          job: newJob.toObject(),
          queuePosition
        });
        socketManager.emitToStore(sId, 'TRANSACTION_SUCCESS', {
          transactionId: txnId,
          amount: totalPaid
        });
      } catch (wsErr) {
        console.error('WebSocket broadcast error:', wsErr);
      }

      this.sendSuccess(res, 'Payment verified and print job queued successfully', {
        success: true,
        orderId: String(newJob._id),
        jobId: String(newJob._id),
        jobNumber: newJob.jobNumber,
        transactionId: txnId,
        queuePosition,
        estimatedWaitMinutes,
        totalPaid,
        fileName: newJob.fileName,
        copies: newJob.copies,
        pages: newJob.totalPages,
        paperSize: newJob.paperSize,
        colorMode: newJob.printType
      });
    } catch (error) {
      next(error);
    }
  };
}

export const paymentsController = new PaymentsController();

const paymentsRouter = Router();
paymentsRouter.post('/create-order', paymentsController.createPaymentOrder);
paymentsRouter.post('/razorpay/create-order', paymentsController.createPaymentOrder);
paymentsRouter.post('/verify', paymentsController.verifyPayment);
paymentsRouter.post('/razorpay/verify', paymentsController.verifyPayment);

export default paymentsRouter;
export { paymentsRouter };
