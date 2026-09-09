import { Router, Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { BaseController } from '../../controllers/BaseController';
import { PrintJobModel } from '../../models/printJob.model';
import { StoreModel } from '../../models/store.model';
import { TransactionModel } from '../../models/transaction.model';
import { PrinterModel } from '../../models/printer.model';
import { authenticate } from '../../middlewares/auth.middleware';
import { ApiResponse } from '../../responses/ApiResponse';
import { HTTP_STATUS } from '../../constants/httpStatusCodes';

export class OrdersController extends BaseController {
  /**
   * Create print order
   */
  public createPrintOrder = async (_req: Request, res: Response): Promise<void> => {
    this.sendSuccess(res, 'Order creation endpoint ready', {
      orderId: 'ORD-PENDING-INIT',
      status: 'WAITING'
    });
  };

  /**
   * Get single order status / details
   */
  public getOrderStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { orderId } = req.params;
      const isObjectId = mongoose.Types.ObjectId.isValid(orderId);
      const query = isObjectId
        ? { _id: new mongoose.Types.ObjectId(orderId) }
        : { jobNumber: orderId };

      const job = await PrintJobModel.findOne(query).lean();
      if (!job) {
        ApiResponse.error(res, 'Print job not found', HTTP_STATUS.NOT_FOUND);
        return;
      }

      this.sendSuccess(res, 'Order details retrieved', { job });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/orders/:id/track
   * Live queue tracking for customer progress page
   */
  public trackOrder = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const isObjectId = mongoose.Types.ObjectId.isValid(id);
      const query = isObjectId
        ? { _id: new mongoose.Types.ObjectId(id) }
        : { jobNumber: id };

      const job = await PrintJobModel.findOne(query).lean();
      if (!job) {
        ApiResponse.error(res, 'Print job not found', HTTP_STATUS.NOT_FOUND);
        return;
      }

      const store = await StoreModel.findById(job.storeId).lean();
      const printer = await PrinterModel.findOne({ storeId: job.storeId, isDefault: true }).lean();

      // Calculate real Queue Position: Count uncompleted jobs created before this one
      const jobsAhead = await PrintJobModel.countDocuments({
        storeId: job.storeId,
        status: { $in: ['Waiting', 'WAITING', 'Printing', 'PRINTING'] },
        createdAt: { $lt: job.createdAt }
      });

      const isCompleted = job.status === 'Completed' || job.status === 'COMPLETED';
      const queuePosition = isCompleted ? 0 : jobsAhead + 1;
      const estimatedWaitMinutes = Math.max(1, queuePosition * 2);

      const isPrinterOnline = printer?.status === 'ONLINE' || printer?.status === 'PRINTING';

      this.sendSuccess(res, 'Order tracking details retrieved', {
        job: {
          id: String(job._id),
          jobNumber: job.jobNumber,
          fileName: job.fileName,
          pages: job.totalPages,
          copies: job.copies,
          totalBillablePages: (job.totalPages || 1) * (job.copies || 1),
          paperSize: job.paperSize,
          colorMode: job.printType === 'COLOR' || job.printType === 'Color' ? 'Color' : 'Black & White',
          totalPaid: job.price,
          status: job.status,
          createdAt: job.createdAt,
          startedAt: job.startedAt,
          completedAt: job.completedAt
        },
        queue: {
          queuePosition,
          estimatedWaitMinutes,
          totalQueuedJobs: jobsAhead + 1
        },
        store: {
          name: store?.name || 'SelfPrint Kiosk',
          branchName: store?.city || 'Main Branch',
          location: `${store?.city || ''}, ${store?.state || ''}`.trim()
        },
        printer: {
          name: printer?.printerName || 'LaserJet Pro',
          model: printer?.model || 'LaserJet',
          status: printer?.status || 'ONLINE',
          isOnline: isPrinterOnline
        }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/orders/:id/receipt
   * Full transactional receipt payload
   */
  public getOrderReceipt = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const isObjectId = mongoose.Types.ObjectId.isValid(id);
      const query = isObjectId
        ? { _id: new mongoose.Types.ObjectId(id) }
        : { jobNumber: id };

      const job = await PrintJobModel.findOne(query).lean();
      if (!job) {
        ApiResponse.error(res, 'Print job not found', HTTP_STATUS.NOT_FOUND);
        return;
      }

      const store = await StoreModel.findById(job.storeId).lean();
      const transaction = await TransactionModel.findOne({ jobId: job._id }).lean();

      this.sendSuccess(res, 'Receipt details retrieved', {
        receipt: {
          receiptNumber: `REC-${Date.now().toString(36).toUpperCase()}-${String(job._id).slice(-4).toUpperCase()}`,
          storeName: store?.name || 'SelfPrint Store',
          storeAddress: store?.address || 'Main Market Road',
          storeCity: `${store?.city || ''}, ${store?.state || ''}`.trim(),
          gstin: (store as any)?.gstin || '29AAAAA0000A1Z5',
          jobNumber: job.jobNumber,
          transactionId: transaction?.transactionId || `TXN-${String(job._id).slice(-6).toUpperCase()}`,
          fileName: job.fileName,
          pages: job.totalPages,
          copies: job.copies,
          totalBillablePages: (job.totalPages || 1) * (job.copies || 1),
          colorMode: job.printType === 'COLOR' || job.printType === 'Color' ? 'Color' : 'Black & White',
          paperSize: job.paperSize,
          paymentMethod: transaction?.paymentGateway || 'UPI',
          subtotal: job.price,
          gstAmount: 0,
          totalAmount: job.price,
          date: job.createdAt
        }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /api/v1/orders/:id/status
   * Update print job status
   */
  public updateJobStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const storeId = (req as any).user?.storeId || (req as any).user?.id;

      const isObjectId = mongoose.Types.ObjectId.isValid(id);
      const query: any = isObjectId
        ? { _id: new mongoose.Types.ObjectId(id) }
        : { jobNumber: id };

      if (storeId && mongoose.Types.ObjectId.isValid(storeId)) {
        query.storeId = new mongoose.Types.ObjectId(storeId);
      }

      const updates: any = { status };
      if (status === 'Printing' || status === 'PRINTING') {
        updates.startedAt = new Date();
      } else if (status === 'Completed' || status === 'COMPLETED') {
        updates.completedAt = new Date();
      }

      const updated = await PrintJobModel.findOneAndUpdate(
        query,
        { $set: updates },
        { new: true }
      ).lean();

      if (!updated) {
        ApiResponse.error(res, 'Print job not found or unauthorized', HTTP_STATUS.NOT_FOUND);
        return;
      }

      this.sendSuccess(res, `Job status updated to ${status}`, { job: updated });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /api/v1/orders/:id
   */
  public deleteJob = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const storeId = (req as any).user?.storeId || (req as any).user?.id;

      const isObjectId = mongoose.Types.ObjectId.isValid(id);
      const query: any = isObjectId
        ? { _id: new mongoose.Types.ObjectId(id) }
        : { jobNumber: id };

      if (storeId && mongoose.Types.ObjectId.isValid(storeId)) {
        query.storeId = new mongoose.Types.ObjectId(storeId);
      }

      const deleted = await PrintJobModel.findOneAndDelete(query);
      if (!deleted) {
        ApiResponse.error(res, 'Print job not found or unauthorized', HTTP_STATUS.NOT_FOUND);
        return;
      }

      this.sendSuccess(res, 'Print job removed from queue successfully');
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/v1/orders/clear-completed
   */
  public clearCompleted = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const storeId = (req as any).user?.storeId || (req as any).user?.id;
      if (!storeId || !mongoose.Types.ObjectId.isValid(storeId)) {
        ApiResponse.error(res, 'Store context required', HTTP_STATUS.BAD_REQUEST);
        return;
      }

      const result = await PrintJobModel.deleteMany({
        storeId: new mongoose.Types.ObjectId(storeId),
        status: { $in: ['Completed', 'COMPLETED', 'Cancelled', 'CANCELLED'] }
      });

      this.sendSuccess(res, `Cleared ${result.deletedCount} completed jobs from queue`);
    } catch (error) {
      next(error);
    }
  };
}

export const ordersController = new OrdersController();

const ordersRouter = Router();
ordersRouter.post('/', ordersController.createPrintOrder);
ordersRouter.get('/:id/track', ordersController.trackOrder);
ordersRouter.get('/:id/receipt', ordersController.getOrderReceipt);
ordersRouter.get('/:orderId', ordersController.getOrderStatus);
ordersRouter.patch('/:id/status', authenticate, ordersController.updateJobStatus);
ordersRouter.delete('/:id', authenticate, ordersController.deleteJob);
ordersRouter.post('/clear-completed', authenticate, ordersController.clearCompleted);

export default ordersRouter;
export { ordersRouter };
