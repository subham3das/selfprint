import mongoose from 'mongoose';
import { PrintJobModel, IPrintJob } from '../../../models/printJob.model';
import { StoreModel, IStore } from '../../../models/store.model';
import { PrinterModel, IPrinter } from '../../../models/printer.model';
import {
  TransactionDto,
  FinancialSummaryDto,
  DailyIncomePointDto,
  PaymentBreakdownItemDto
} from './history.types';

export class HistoryRepository {
  /**
   * Resolve Store ObjectId from storeId param or user context
   */
  public async getStore(storeIdParam?: string): Promise<IStore | null> {
    if (storeIdParam && mongoose.Types.ObjectId.isValid(storeIdParam)) {
      const byId = await StoreModel.findById(storeIdParam).lean();
      if (byId) return byId as unknown as IStore;
    }
    if (storeIdParam) {
      const byCode = await StoreModel.findOne({
        $or: [
          { storeCode: storeIdParam.toUpperCase() },
          { email: storeIdParam.toLowerCase() }
        ]
      }).lean();
      if (byCode) return byCode as unknown as IStore;
    }
    return (await StoreModel.findOne().sort({ createdAt: 1 }).lean()) as unknown as IStore | null;
  }

  /**
   * Convert preset string to Date range bounds
   */
  public getDateRangeFilter(dateRange?: string): { $gte?: Date; $lte?: Date } {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    switch (dateRange) {
      case 'today':
        return { $gte: startOfToday, $lte: endOfToday };
      case 'yesterday': {
        const startOfYesterday = new Date(startOfToday.getTime() - 24 * 60 * 60 * 1000);
        const endOfYesterday = new Date(endOfToday.getTime() - 24 * 60 * 60 * 1000);
        return { $gte: startOfYesterday, $lte: endOfYesterday };
      }
      case 'last_7_days': {
        const sevenDaysAgo = new Date(startOfToday.getTime() - 6 * 24 * 60 * 60 * 1000);
        return { $gte: sevenDaysAgo, $lte: endOfToday };
      }
      case 'last_30_days': {
        const thirtyDaysAgo = new Date(startOfToday.getTime() - 29 * 24 * 60 * 60 * 1000);
        return { $gte: thirtyDaysAgo, $lte: endOfToday };
      }
      case 'this_month': {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
        return { $gte: startOfMonth, $lte: endOfToday };
      }
      case 'all':
      default:
        return {};
    }
  }

  /**
   * Fetch paginated and filtered transactions
   */
  public async getTransactions(
    storeId: mongoose.Types.ObjectId,
    options: {
      search?: string;
      dateRange?: string;
      paymentStatus?: string;
      paymentMethod?: string;
      colorMode?: string;
      paperSize?: string;
      sortBy?: string;
      page?: number;
      limit?: number;
    }
  ): Promise<{ jobs: IPrintJob[]; total: number }> {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const skip = (page - 1) * limit;

    const query: any = { storeId };

    // 1. Date Range
    const dateBounds = this.getDateRangeFilter(options.dateRange);
    if (dateBounds.$gte || dateBounds.$lte) {
      query.createdAt = dateBounds;
    }

    // 2. Payment Status
    if (options.paymentStatus && options.paymentStatus !== 'All') {
      query.paymentStatus = { $regex: new RegExp(`^${options.paymentStatus}$`, 'i') };
    }

    // 3. Color Mode
    if (options.colorMode && options.colorMode !== 'All') {
      const modeRegex = options.colorMode.toLowerCase().includes('color') ? /color/i : /bw|b&w/i;
      query.printType = { $regex: modeRegex };
    }

    // 4. Paper Size
    if (options.paperSize && options.paperSize !== 'All') {
      query.paperSize = { $regex: new RegExp(`^${options.paperSize}$`, 'i') };
    }

    // 5. Search
    if (options.search && options.search.trim()) {
      const s = options.search.trim();
      query.$or = [
        { jobNumber: { $regex: s, $options: 'i' } },
        { fileName: { $regex: s, $options: 'i' } },
        { customerName: { $regex: s, $options: 'i' } }
      ];
    }

    // 6. Sorting
    let sortQuery: any = { createdAt: -1 };
    switch (options.sortBy) {
      case 'oldest':
        sortQuery = { createdAt: 1 };
        break;
      case 'amount_high':
        sortQuery = { price: -1 };
        break;
      case 'amount_low':
        sortQuery = { price: 1 };
        break;
      case 'pages_high':
        sortQuery = { totalPages: -1 };
        break;
      case 'pages_low':
        sortQuery = { totalPages: 1 };
        break;
      case 'newest':
      default:
        sortQuery = { createdAt: -1 };
        break;
    }

    const [jobs, total] = await Promise.all([
      PrintJobModel.find(query)
        .sort(sortQuery)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      PrintJobModel.countDocuments(query).exec()
    ]);

    return {
      jobs: (jobs || []) as unknown as IPrintJob[],
      total: total || 0
    };
  }

  /**
   * Compute live financial summary using aggregation
   */
  public async getFinancialSummary(
    storeId: mongoose.Types.ObjectId,
    dateRange?: string
  ): Promise<FinancialSummaryDto> {
    const matchQuery: any = { storeId };
    const dateBounds = this.getDateRangeFilter(dateRange);
    if (dateBounds.$gte || dateBounds.$lte) {
      matchQuery.createdAt = dateBounds;
    }

    const results = await PrintJobModel.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalTransactions: { $sum: 1 },
          totalRevenue: {
            $sum: {
              $cond: [
                {
                  $in: [
                    { $toUpper: '$paymentStatus' },
                    ['PAID', 'COMPLETED']
                  ]
                },
                '$price',
                0
              ]
            }
          },
          cashReceived: {
            $sum: {
              $cond: [
                { $regexMatch: { input: { $ifNull: ['$customerName', ''] }, regex: /cash/i } },
                '$price',
                0
              ]
            }
          },
          refundsTotal: {
            $sum: {
              $cond: [
                { $eq: [{ $toUpper: '$paymentStatus' }, 'REFUNDED'] },
                '$price',
                0
              ]
            }
          },
          pendingPaymentsTotal: {
            $sum: {
              $cond: [
                { $eq: [{ $toUpper: '$paymentStatus' }, 'PENDING'] },
                '$price',
                0
              ]
            }
          }
        }
      }
    ]);

    const stat = results[0] || {
      totalTransactions: 0,
      totalRevenue: 0,
      cashReceived: 0,
      refundsTotal: 0,
      pendingPaymentsTotal: 0
    };

    const totalRevenue = stat.totalRevenue || 0;
    const totalTransactions = stat.totalTransactions || 0;
    const cashReceived = stat.cashReceived || 0;
    const upiReceived = Math.max(0, totalRevenue - cashReceived);
    const avgOrderValue = totalTransactions > 0 ? Number((totalRevenue / totalTransactions).toFixed(2)) : 0;

    return {
      totalTransactions,
      totalTransactionsChangePercent: 0,
      totalRevenue,
      totalRevenueChangePercent: 0,
      cashReceived,
      upiReceived,
      cardReceived: 0,
      avgOrderValue,
      refundsTotal: stat.refundsTotal || 0,
      pendingPaymentsTotal: stat.pendingPaymentsTotal || 0,
      period: dateRange ? dateRange.replace(/_/g, ' ') : 'Today'
    };
  }

  /**
   * Daily Income Overview points for Charts
   */
  public async getIncomeChartData(
    storeId: mongoose.Types.ObjectId,
    period = 'Last 7 Days'
  ): Promise<DailyIncomePointDto[]> {
    const days = period.includes('30') ? 30 : 7;
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (days - 1), 0, 0, 0);

    const matchQuery = {
      storeId,
      createdAt: { $gte: startDate, $lte: now }
    };

    const results = await PrintJobModel.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          revenue: {
            $sum: {
              $cond: [
                {
                  $in: [
                    { $toUpper: '$paymentStatus' },
                    ['PAID', 'COMPLETED']
                  ]
                },
                '$price',
                0
              ]
            }
          },
          transactionsCount: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const dateMap = new Map<string, { revenue: number; count: number }>();
    results.forEach((r) => {
      dateMap.set(r._id, { revenue: r.revenue, count: r.transactionsCount });
    });

    // Populate all days in range
    const points: DailyIncomePointDto[] = [];
    for (let i = 0; i < days; i++) {
      const d = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      const isoDate = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
      const fullDate = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

      const found = dateMap.get(isoDate);
      points.push({
        date: dayName,
        fullDate,
        revenue: found ? found.revenue : 0,
        transactionsCount: found ? found.count : 0
      });
    }

    return points;
  }

  /**
   * Payment method breakdown
   */
  public async getPaymentBreakdown(
    storeId: mongoose.Types.ObjectId,
    dateRange?: string
  ): Promise<PaymentBreakdownItemDto[]> {
    const matchQuery: any = { storeId };
    const dateBounds = this.getDateRangeFilter(dateRange);
    if (dateBounds.$gte || dateBounds.$lte) {
      matchQuery.createdAt = dateBounds;
    }

    const results = await PrintJobModel.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$paymentStatus',
          totalAmount: { $sum: '$price' },
          count: { $sum: 1 }
        }
      }
    ]);

    let totalRevenue = 0;
    let totalCount = 0;
    results.forEach((r) => {
      totalRevenue += r.totalAmount || 0;
      totalCount += r.count || 0;
    });

    if (totalRevenue === 0 && totalCount === 0) {
      return [];
    }

    // Standard breakdown
    const upiAmount = totalRevenue;
    const upiCount = totalCount;

    return [
      {
        method: 'UPI',
        amount: upiAmount,
        percentage: 100,
        count: upiCount,
        color: '#4F46E5'
      }
    ];
  }
}

export const historyRepository = new HistoryRepository();
export default historyRepository;
