import mongoose from 'mongoose';
import { TransactionModel } from '../../../models/transaction.model';
import { StoreModel } from '../../../models/store.model';
import { PrintJobModel } from '../../../models/printJob.model';
import {
  AdminTransactionItemDto,
  TransactionStatsDto,
  GetTransactionsQuery,
  RefundTransactionDto
} from './transactions.types';

export class AdminTransactionsService {
  /**
   * 1. Get Transaction Statistics (Aggregated from MongoDB)
   */
  public async getStats(): Promise<TransactionStatsDto> {
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthEnd = currentMonthStart;

    const [
      totalCount,
      successCount,
      pendingCount,
      failedCount,
      refundCount,
      amountSumAgg,
      prevAmountSumAgg,
      prevSuccessCount,
      prevTotalCount
    ] = await Promise.all([
      TransactionModel.countDocuments(),
      TransactionModel.countDocuments({ status: 'PAID' }),
      TransactionModel.countDocuments({ status: 'PENDING' }),
      TransactionModel.countDocuments({ status: 'FAILED' }),
      TransactionModel.countDocuments({ status: 'REFUNDED' }),
      TransactionModel.aggregate([
        { $match: { status: 'PAID' } },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: '$amount' },
            totalCommission: { $sum: '$platformFee' }
          }
        }
      ]),
      TransactionModel.aggregate([
        { $match: { status: 'PAID', createdAt: { $gte: prevMonthStart, $lt: prevMonthEnd } } },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: '$amount' },
            totalCommission: { $sum: '$platformFee' }
          }
        }
      ]),
      TransactionModel.countDocuments({
        status: 'PAID',
        createdAt: { $gte: prevMonthStart, $lt: prevMonthEnd }
      }),
      TransactionModel.countDocuments({
        createdAt: { $gte: prevMonthStart, $lt: prevMonthEnd }
      })
    ]);

    const totalAmount = amountSumAgg[0]?.totalAmount || 0;
    const totalCommission = amountSumAgg[0]?.totalCommission || Math.round(totalAmount * 0.1);

    const prevAmount = prevAmountSumAgg[0]?.totalAmount || 0;
    const prevCommission = prevAmountSumAgg[0]?.totalCommission || Math.round(prevAmount * 0.1);

    // Compute trends
    const calculateTrend = (curr: number, prev: number) => {
      if (prev > 0) {
        const diff = ((curr - prev) / prev) * 100;
        return `${diff >= 0 ? '↑' : '↓'} ${Math.abs(diff).toFixed(1)}% from last month`;
      }
      return curr > 0 ? '↑ 100% from last month' : '0% from last month';
    };

    const totalTrend = calculateTrend(totalCount, prevTotalCount);
    const successTrend = calculateTrend(successCount, prevSuccessCount);
    const pendingTrend = pendingCount > 0 ? `Active (${pendingCount})` : 'None pending';
    const failedTrend = failedCount === 0 ? '0 failures recorded' : `Attention (${failedCount})`;
    const amountTrend = calculateTrend(totalAmount, prevAmount);
    const commissionTrend = calculateTrend(totalCommission, prevCommission);

    return {
      totalTransactions: totalCount,
      totalTransactionsTrend: totalTrend,
      successfulTransactions: successCount,
      successfulTransactionsTrend: successTrend,
      pendingTransactions: pendingCount,
      pendingTransactionsTrend: pendingTrend,
      failedTransactions: failedCount,
      failedTransactionsTrend: failedTrend,
      totalAmountRaw: totalAmount,
      totalAmountFormatted: `₹${totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      totalAmountTrend: amountTrend,
      totalCommissionRaw: totalCommission,
      totalCommissionFormatted: `₹${totalCommission.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      totalCommissionTrend: commissionTrend
    };
  }

  /**
   * 2. Get Paginated and Filtered Transactions
   */
  public async getTransactions(query: GetTransactionsQuery): Promise<{
    transactions: AdminTransactionItemDto[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 10));
    const skip = (page - 1) * limit;

    const filter: any = {};

    // 1. Status Filter
    if (query.status && query.status !== 'All') {
      const s = query.status.toUpperCase();
      if (s === 'SUCCESS') filter.status = 'PAID';
      else if (s === 'PENDING') filter.status = 'PENDING';
      else if (s === 'FAILED') filter.status = 'FAILED';
      else if (s === 'REFUNDED') filter.status = 'REFUNDED';
      else filter.status = s;
    }

    // 2. Store Filter
    if (query.store && query.store !== 'All') {
      if (mongoose.Types.ObjectId.isValid(query.store)) {
        filter.storeId = new mongoose.Types.ObjectId(query.store);
      } else {
        const storeDoc = await StoreModel.findOne({ name: new RegExp(query.store, 'i') }).lean();
        if (storeDoc) {
          filter.storeId = storeDoc._id;
        } else {
          // Store doesn't exist, return empty
          return {
            transactions: [],
            pagination: { page, limit, total: 0, pages: 1 }
          };
        }
      }
    }

    // 3. Payment Method Filter
    if (query.paymentMethod && query.paymentMethod !== 'All') {
      filter.paymentGateway = new RegExp(query.paymentMethod, 'i');
    }

    // 4. Date Range Filter
    if (query.startDate || query.endDate) {
      filter.createdAt = {};
      if (query.startDate) {
        filter.createdAt.$gte = new Date(query.startDate);
      }
      if (query.endDate) {
        const end = new Date(query.endDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    // 5. Search Query
    if (query.search && query.search.trim()) {
      const reg = new RegExp(query.search.trim(), 'i');

      // Find matching stores or users
      const [matchedStores, matchedUsers] = await Promise.all([
        StoreModel.find({ name: reg }).select('_id').lean(),
        mongoose.models.User
          ? mongoose.models.User.find({
              $or: [{ name: reg }, { email: reg }]
            })
              .select('_id')
              .lean()
          : []
      ]);

      const storeIds = matchedStores.map((s) => s._id);
      const userIds = matchedUsers.map((u) => u._id);

      filter.$or = [
        { transactionId: reg },
        { gatewayPaymentId: reg },
        { gatewayOrderId: reg },
        ...(storeIds.length > 0 ? [{ storeId: { $in: storeIds } }] : []),
        ...(userIds.length > 0 ? [{ userId: { $in: userIds } }] : [])
      ];
    }

    const [total, txns] = await Promise.all([
      TransactionModel.countDocuments(filter),
      TransactionModel.find(filter)
        .populate('storeId', 'name city state logo')
        .populate('userId', 'name email avatar')
        .populate('jobId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
    ]);

    const formattedTransactions: AdminTransactionItemDto[] = txns.map((t: any) => {
      const store = t.storeId || {};
      const user = t.userId || {};
      const job = t.jobId || {};

      const storeName = store.name || 'Self Print Station';
      const city = store.city || 'Central';
      const state = store.state || 'India';
      const customerName = user.name || (job.customerName || 'Customer');
      const customerEmail = user.email || 'customer@selfprint.in';

      const initials = (storeName || 'S')
        .split(' ')
        .slice(0, 2)
        .map((w: string) => w[0])
        .join('')
        .toUpperCase();

      const orderType: 'Color Print' | 'B&W Print' =
        job.printType === 'COLOR' || job.printType === 'Color' ? 'Color Print' : 'B&W Print';

      const pages = job.totalPages || 1;
      const amount = Number(t.amount) || 0;
      const commission = Number(t.platformFee) || Math.round(amount * 0.1);

      let status: 'Success' | 'Pending' | 'Failed' | 'Refunded' | 'Cancelled' = 'Success';
      if (t.status === 'PAID') status = 'Success';
      else if (t.status === 'PENDING') status = 'Pending';
      else if (t.status === 'FAILED') status = 'Failed';
      else if (t.status === 'REFUNDED') status = 'Refunded';

      const dateObj = t.createdAt ? new Date(t.createdAt) : new Date();
      const dateStr = dateObj.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
      const timeStr = dateObj.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });

      return {
        id: String(t._id),
        txnId: t.transactionId || `TXN-${String(t._id).slice(-8).toUpperCase()}`,
        paymentId: t.gatewayPaymentId || t.gatewayOrderId || `pay_${String(t._id).slice(-10)}`,
        storeName,
        storeLogoBg: 'bg-slate-900 text-white',
        storeLogoText: initials || 'SP',
        city,
        state,
        customerName,
        customerEmail,
        customerAvatar:
          user.avatar ||
          `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(customerName)}`,
        orderType,
        pages,
        amountRaw: amount,
        amountFormatted: `₹${amount.toFixed(2)}`,
        commissionRaw: commission,
        commissionFormatted: `₹${commission.toFixed(2)}`,
        paymentMethod: t.paymentGateway || 'UPI',
        status,
        date: dateStr,
        time: timeStr,
        timestamp: dateObj.toISOString(),
        printDetails: {
          fileName: job.fileName || 'Document.pdf',
          totalPages: job.totalPages || 1,
          colorPages: orderType === 'Color Print' ? job.totalPages || 1 : 0,
          bwPages: orderType === 'B&W Print' ? job.totalPages || 1 : 0,
          copies: job.copies || 1,
          paperSize: job.paperSize || 'A4',
          printerUsed: 'Auto-Spool Printer'
        },
        timeline: [
          { label: 'Order Created', time: timeStr, completed: true },
          {
            label: `Payment via ${t.paymentGateway || 'UPI'}`,
            time: timeStr,
            completed: status === 'Success' || status === 'Refunded'
          },
          {
            label: 'Print Spooled',
            time: timeStr,
            completed: status === 'Success'
          }
        ]
      };
    });

    return {
      transactions: formattedTransactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.max(1, Math.ceil(total / limit))
      }
    };
  }

  /**
   * 3. Get Transaction By ID
   */
  public async getTransactionById(id: string): Promise<AdminTransactionItemDto | null> {
    const isObjectId = mongoose.Types.ObjectId.isValid(id);
    const query = isObjectId ? { $or: [{ _id: id }, { transactionId: id }] } : { transactionId: id };

    const t: any = await TransactionModel.findOne(query)
      .populate('storeId', 'name city state logo')
      .populate('userId', 'name email avatar')
      .populate('jobId')
      .lean();

    if (!t) return null;

    const store = t.storeId || {};
    const user = t.userId || {};
    const job = t.jobId || {};

    const storeName = store.name || 'Self Print Station';
    const city = store.city || 'Central';
    const state = store.state || 'India';
    const customerName = user.name || (job.customerName || 'Customer');
    const customerEmail = user.email || 'customer@selfprint.in';

    const initials = (storeName || 'S')
      .split(' ')
      .slice(0, 2)
      .map((w: string) => w[0])
      .join('')
      .toUpperCase();

    const orderType: 'Color Print' | 'B&W Print' =
      job.printType === 'COLOR' || job.printType === 'Color' ? 'Color Print' : 'B&W Print';

    const pages = job.totalPages || 1;
    const amount = Number(t.amount) || 0;
    const commission = Number(t.platformFee) || Math.round(amount * 0.1);

    let status: 'Success' | 'Pending' | 'Failed' | 'Refunded' | 'Cancelled' = 'Success';
    if (t.status === 'PAID') status = 'Success';
    else if (t.status === 'PENDING') status = 'Pending';
    else if (t.status === 'FAILED') status = 'Failed';
    else if (t.status === 'REFUNDED') status = 'Refunded';

    const dateObj = t.createdAt ? new Date(t.createdAt) : new Date();
    const dateStr = dateObj.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
    const timeStr = dateObj.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    return {
      id: String(t._id),
      txnId: t.transactionId || `TXN-${String(t._id).slice(-8).toUpperCase()}`,
      paymentId: t.gatewayPaymentId || t.gatewayOrderId || `pay_${String(t._id).slice(-10)}`,
      storeName,
      storeLogoBg: 'bg-slate-900 text-white',
      storeLogoText: initials || 'SP',
      city,
      state,
      customerName,
      customerEmail,
      customerAvatar:
        user.avatar ||
        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(customerName)}`,
      orderType,
      pages,
      amountRaw: amount,
      amountFormatted: `₹${amount.toFixed(2)}`,
      commissionRaw: commission,
      commissionFormatted: `₹${commission.toFixed(2)}`,
      paymentMethod: t.paymentGateway || 'UPI',
      status,
      date: dateStr,
      time: timeStr,
      timestamp: dateObj.toISOString(),
      printDetails: {
        fileName: job.fileName || 'Document.pdf',
        totalPages: job.totalPages || 1,
        colorPages: orderType === 'Color Print' ? job.totalPages || 1 : 0,
        bwPages: orderType === 'B&W Print' ? job.totalPages || 1 : 0,
        copies: job.copies || 1,
        paperSize: job.paperSize || 'A4',
        printerUsed: 'Auto-Spool Printer'
      },
      timeline: [
        { label: 'Order Created', time: timeStr, completed: true },
        {
          label: `Payment via ${t.paymentGateway || 'UPI'}`,
          time: timeStr,
          completed: status === 'Success' || status === 'Refunded'
        },
        {
          label: 'Print Spooled',
          time: timeStr,
          completed: status === 'Success'
        }
      ]
    };
  }

  /**
   * 4. Process Refund
   */
  public async refundTransaction(id: string, refundDto: RefundTransactionDto): Promise<AdminTransactionItemDto | null> {
    const isObjectId = mongoose.Types.ObjectId.isValid(id);
    const query = isObjectId ? { $or: [{ _id: id }, { transactionId: id }] } : { transactionId: id };

    const txn = await TransactionModel.findOneAndUpdate(
      query,
      {
        $set: {
          status: 'REFUNDED',
          updatedAt: new Date()
        }
      },
      { new: true }
    );

    if (!txn) return null;
    return this.getTransactionById(String(txn._id));
  }

  /**
   * 5. Get Unique Store Names for Dropdown Filter
   */
  public async getUniqueStores(): Promise<string[]> {
    const stores = await StoreModel.find().select('name').sort({ name: 1 }).lean();
    return stores.map((s) => s.name).filter(Boolean);
  }
}

export const adminTransactionsService = new AdminTransactionsService();
export default adminTransactionsService;
