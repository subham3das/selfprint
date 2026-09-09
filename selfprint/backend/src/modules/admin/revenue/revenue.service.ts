import mongoose from 'mongoose';
import { TransactionModel } from '../../../models/transaction.model';
import { StoreModel } from '../../../models/store.model';
import { PrintJobModel } from '../../../models/printJob.model';
import {
  RevenueAnalyticsOverviewResponse,
  RevenueStatsResponse,
  RevenueChartPoint,
  CategoryRevenueSegment,
  PaymentMethodRevenueSegment,
  TopStoreRevenueItem,
  TopCityRevenueItem,
  RecentRevenueTransactionItem,
  RevenueFilterOptions,
  GetRevenueQuery
} from './revenue.types';

export class AdminRevenueService {
  /**
   * 1. Complete Unified Revenue Overview Endpoint
   */
  public async getOverview(query: GetRevenueQuery): Promise<RevenueAnalyticsOverviewResponse> {
    const period = query.period || 'daily';

    const [
      stats,
      chart,
      paymentMethods,
      revenueCategories,
      topStores,
      topCities,
      recentTransactions,
      filters
    ] = await Promise.all([
      this.getStats(query),
      this.getChart(period, query),
      this.getPaymentMethodsSplit(query),
      this.getRevenueCategoriesSplit(query),
      this.getTopStores(query),
      this.getTopCities(query),
      this.getRecentTransactions(query),
      this.getFilterOptions()
    ]);

    return {
      stats,
      chart,
      paymentMethods,
      revenueCategories,
      topStores,
      topCities,
      recentTransactions,
      filters
    };
  }

  /**
   * 2. 6 KPI Metric Cards & Trends (Current vs Previous Equivalent Period)
   */
  public async getStats(query: GetRevenueQuery): Promise<RevenueStatsResponse> {
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthEnd = currentMonthStart;

    const baseFilter: any = {};
    if (query.store && query.store !== 'All' && query.store !== 'All Stores') {
      const storeDoc = await StoreModel.findOne({ name: new RegExp(query.store, 'i') }).lean();
      if (storeDoc) baseFilter.storeId = storeDoc._id;
    }

    const [
      allTimePaidAgg,
      refundsAgg,
      totalCount,
      prevMonthPaidAgg,
      prevMonthRefundsAgg,
      prevMonthCount
    ] = await Promise.all([
      TransactionModel.aggregate([
        { $match: { ...baseFilter, status: 'PAID' } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$amount' },
            platformCommission: { $sum: '$platformFee' }
          }
        }
      ]),
      TransactionModel.aggregate([
        { $match: { ...baseFilter, status: 'REFUNDED' } },
        {
          $group: {
            _id: null,
            totalRefunds: { $sum: '$amount' }
          }
        }
      ]),
      TransactionModel.countDocuments({ ...baseFilter, status: 'PAID' }),
      TransactionModel.aggregate([
        {
          $match: {
            ...baseFilter,
            status: 'PAID',
            createdAt: { $gte: prevMonthStart, $lt: prevMonthEnd }
          }
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$amount' },
            platformCommission: { $sum: '$platformFee' }
          }
        }
      ]),
      TransactionModel.aggregate([
        {
          $match: {
            ...baseFilter,
            status: 'REFUNDED',
            createdAt: { $gte: prevMonthStart, $lt: prevMonthEnd }
          }
        },
        {
          $group: {
            _id: null,
            totalRefunds: { $sum: '$amount' }
          }
        }
      ]),
      TransactionModel.countDocuments({
        ...baseFilter,
        status: 'PAID',
        createdAt: { $gte: prevMonthStart, $lt: prevMonthEnd }
      })
    ]);

    const totalRevenue = allTimePaidAgg[0]?.totalRevenue || 0;
    const platformCommission = allTimePaidAgg[0]?.platformCommission || Math.round(totalRevenue * 0.1);
    const refundsAdjustments = refundsAgg[0]?.totalRefunds || 0;
    const netRevenue = Math.max(0, totalRevenue - refundsAdjustments);
    const averageOrderValue = totalCount > 0 ? totalRevenue / totalCount : 0;

    const prevRevenue = prevMonthPaidAgg[0]?.totalRevenue || 0;
    const prevCommission = prevMonthPaidAgg[0]?.platformCommission || Math.round(prevRevenue * 0.1);
    const prevRefunds = prevMonthRefundsAgg[0]?.totalRefunds || 0;
    const prevNetRevenue = Math.max(0, prevRevenue - prevRefunds);
    const prevAOV = prevMonthCount > 0 ? prevRevenue / prevMonthCount : 0;

    const calculateTrend = (curr: number, prev: number) => {
      if (prev > 0) {
        const diff = ((curr - prev) / prev) * 100;
        return `${diff >= 0 ? '↑' : '↓'} ${Math.abs(diff).toFixed(1)}% from last month`;
      }
      return curr > 0 ? '↑ 100% from last month' : '0% from last month';
    };

    return {
      totalRevenue: `₹${totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      totalRevenueRaw: totalRevenue,
      totalRevenueTrend: calculateTrend(totalRevenue, prevRevenue),
      platformCommission: `₹${platformCommission.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      platformCommissionRaw: platformCommission,
      platformCommissionTrend: calculateTrend(platformCommission, prevCommission),
      totalTransactions: totalCount,
      totalTransactionsTrend: calculateTrend(totalCount, prevMonthCount),
      averageOrderValue: `₹${averageOrderValue.toFixed(2)}`,
      averageOrderValueRaw: averageOrderValue,
      averageOrderValueTrend: calculateTrend(averageOrderValue, prevAOV),
      refundsAdjustments: `₹${refundsAdjustments.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      refundsAdjustmentsRaw: refundsAdjustments,
      refundsTrend: calculateTrend(refundsAdjustments, prevRefunds),
      netRevenue: `₹${netRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      netRevenueRaw: netRevenue,
      netRevenueTrend: calculateTrend(netRevenue, prevNetRevenue)
    };
  }

  /**
   * 3. Revenue Overview Time-Series Curve Chart
   */
  public async getChart(
    period: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'daily',
    query: GetRevenueQuery = {}
  ): Promise<RevenueChartPoint[]> {
    const now = new Date();
    let startDate = new Date();

    const baseFilter: any = { status: 'PAID' };
    if (query.store && query.store !== 'All' && query.store !== 'All Stores') {
      const storeDoc = await StoreModel.findOne({ name: new RegExp(query.store, 'i') }).lean();
      if (storeDoc) baseFilter.storeId = storeDoc._id;
    }

    if (period === 'monthly' || period === 'yearly') {
      // Past 12 Months
      startDate = new Date(now.getFullYear(), 0, 1);
      baseFilter.createdAt = { $gte: startDate };

      const txns = await TransactionModel.aggregate([
        { $match: baseFilter },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
            revenue: { $sum: '$amount' },
            orders: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      const map = new Map<string, { revenue: number; orders: number }>();
      txns.forEach((t) => map.set(t._id, { revenue: t.revenue, orders: t.orders }));

      const points: RevenueChartPoint[] = [];
      for (let m = 0; m < 12; m++) {
        const d = new Date(now.getFullYear(), m, 1);
        const key = d.toISOString().slice(0, 7);
        const label = d.toLocaleDateString('en-GB', { month: 'short' });
        const val = map.get(key) || { revenue: 0, orders: 0 };

        points.push({
          date: key,
          label,
          revenue: val.revenue,
          revenueFormatted: `₹${val.revenue.toLocaleString('en-IN')}`,
          orders: val.orders
        });
      }
      return points;
    } else if (period === 'weekly') {
      // Past 4 Weeks
      startDate = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000);
      baseFilter.createdAt = { $gte: startDate };

      const txns = await TransactionModel.aggregate([
        { $match: baseFilter },
        {
          $group: {
            _id: {
              $concat: [
                'Week ',
                { $toString: { $isoWeek: '$createdAt' } }
              ]
            },
            revenue: { $sum: '$amount' },
            orders: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      if (txns.length === 0) {
        return [
          { date: 'W1', label: 'Week 1', revenue: 0, revenueFormatted: '₹0', orders: 0 },
          { date: 'W2', label: 'Week 2', revenue: 0, revenueFormatted: '₹0', orders: 0 },
          { date: 'W3', label: 'Week 3', revenue: 0, revenueFormatted: '₹0', orders: 0 },
          { date: 'W4', label: 'Week 4', revenue: 0, revenueFormatted: '₹0', orders: 0 }
        ];
      }

      return txns.map((t, idx) => ({
        date: String(t._id),
        label: `Week ${idx + 1}`,
        revenue: t.revenue,
        revenueFormatted: `₹${t.revenue.toLocaleString('en-IN')}`,
        orders: t.orders
      }));
    } else {
      // Daily (Past 14 Days)
      startDate = new Date(now.getTime() - 13 * 24 * 60 * 60 * 1000);
      startDate.setHours(0, 0, 0, 0);
      baseFilter.createdAt = { $gte: startDate };

      const txns = await TransactionModel.aggregate([
        { $match: baseFilter },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            revenue: { $sum: '$amount' },
            orders: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      const map = new Map<string, { revenue: number; orders: number }>();
      txns.forEach((t) => map.set(t._id, { revenue: t.revenue, orders: t.orders }));

      const points: RevenueChartPoint[] = [];
      for (let i = 0; i < 14; i++) {
        const d = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
        const key = d.toISOString().slice(0, 10);
        const label = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
        const val = map.get(key) || { revenue: 0, orders: 0 };

        points.push({
          date: key,
          label,
          revenue: val.revenue,
          revenueFormatted: `₹${val.revenue.toLocaleString('en-IN')}`,
          orders: val.orders
        });
      }
      return points;
    }
  }

  /**
   * 4. Revenue by Category Donut Chart
   */
  public async getRevenueCategoriesSplit(query: GetRevenueQuery): Promise<CategoryRevenueSegment[]> {
    const baseFilter: any = { status: 'PAID' };
    if (query.store && query.store !== 'All' && query.store !== 'All Stores') {
      const storeDoc = await StoreModel.findOne({ name: new RegExp(query.store, 'i') }).lean();
      if (storeDoc) baseFilter.storeId = storeDoc._id;
    }

    const [totalAgg, jobTypeAgg] = await Promise.all([
      TransactionModel.aggregate([
        { $match: baseFilter },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      PrintJobModel.aggregate([
        {
          $group: {
            _id: { $toUpper: '$printType' },
            totalAmount: { $sum: '$price' },
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    const totalRevenue = totalAgg[0]?.total || 0;
    if (totalRevenue === 0 || jobTypeAgg.length === 0) {
      return [];
    }

    const palette: Record<string, string> = {
      'COLOR': '#6366F1',
      'BW': '#3B82F6',
      'B&W': '#3B82F6',
      'DOCUMENT': '#10B981',
      'OTHER': '#F59E0B'
    };

    let allocatedAmount = 0;
    const segments: CategoryRevenueSegment[] = [];

    jobTypeAgg.forEach((item) => {
      const isColor = item._id === 'COLOR';
      const name = isColor ? 'Color Print' : 'B&W Print';
      const amount = Math.min(item.totalAmount || 0, totalRevenue);
      allocatedAmount += amount;
      const percentage = Number(((amount / totalRevenue) * 100).toFixed(1));

      segments.push({
        name,
        amountRaw: amount,
        amountFormatted: `₹${amount.toLocaleString('en-IN')}`,
        percentage,
        color: palette[item._id] || (isColor ? '#6366F1' : '#3B82F6')
      });
    });

    // Remainder as Platform Services
    const remainder = Math.max(0, totalRevenue - allocatedAmount);
    if (remainder > 0) {
      const percentage = Number(((remainder / totalRevenue) * 100).toFixed(1));
      segments.push({
        name: 'Platform Services',
        amountRaw: remainder,
        amountFormatted: `₹${remainder.toLocaleString('en-IN')}`,
        percentage,
        color: '#10B981'
      });
    }

    return segments;
  }

  /**
   * 5. Revenue by Payment Method Donut Chart
   */
  public async getPaymentMethodsSplit(query: GetRevenueQuery): Promise<PaymentMethodRevenueSegment[]> {
    const baseFilter: any = { status: 'PAID' };
    if (query.store && query.store !== 'All' && query.store !== 'All Stores') {
      const storeDoc = await StoreModel.findOne({ name: new RegExp(query.store, 'i') }).lean();
      if (storeDoc) baseFilter.storeId = storeDoc._id;
    }

    const [totalAgg, gatewaysAgg] = await Promise.all([
      TransactionModel.aggregate([
        { $match: baseFilter },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      TransactionModel.aggregate([
        { $match: baseFilter },
        {
          $group: {
            _id: '$paymentGateway',
            amount: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        },
        { $sort: { amount: -1 } }
      ])
    ]);

    const totalRevenue = totalAgg[0]?.total || 0;
    if (totalRevenue === 0 || gatewaysAgg.length === 0) {
      return [];
    }

    const palette = ['#6366F1', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

    return gatewaysAgg.map((g, idx) => {
      const percentage = Number(((g.amount / totalRevenue) * 100).toFixed(1));
      return {
        name: g._id || 'UPI / Gateway',
        amountRaw: g.amount,
        amountFormatted: `₹${g.amount.toLocaleString('en-IN')}`,
        percentage,
        color: palette[idx % palette.length]
      };
    });
  }

  /**
   * 6. Top Performing Stores by Revenue
   */
  public async getTopStores(_query: GetRevenueQuery): Promise<TopStoreRevenueItem[]> {
    const agg = await TransactionModel.aggregate([
      { $match: { status: 'PAID' } },
      {
        $group: {
          _id: '$storeId',
          totalRevenue: { $sum: '$amount' },
          totalCommission: { $sum: '$platformFee' },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'stores',
          localField: '_id',
          foreignField: '_id',
          as: 'store'
        }
      },
      { $unwind: '$store' }
    ]);

    if (agg.length === 0) {
      const stores = await StoreModel.find({ status: 'ACTIVE' }).limit(5).lean();
      return stores.map((s) => ({
        id: String(s._id),
        storeName: s.name,
        logoBg: 'bg-slate-900',
        logoText: (s.name || 'S')[0].toUpperCase(),
        city: s.city || 'Central',
        state: s.state || 'India',
        revenue: '₹0',
        revenueRaw: 0,
        transactions: 0,
        commission: '₹0',
        status: 'Online'
      }));
    }

    return agg.map((item) => {
      const s = item.store;
      const initials = (s.name || 'S')
        .split(' ')
        .slice(0, 2)
        .map((w: string) => w[0])
        .join('')
        .toUpperCase();

      return {
        id: String(s._id),
        storeName: s.name,
        logoBg: 'bg-slate-900',
        logoText: initials,
        city: s.city || 'Central',
        state: s.state || 'India',
        revenue: `₹${item.totalRevenue.toLocaleString('en-IN')}`,
        revenueRaw: item.totalRevenue,
        transactions: item.orderCount,
        commission: `₹${(item.totalCommission || Math.round(item.totalRevenue * 0.1)).toLocaleString('en-IN')}`,
        status: s.status === 'ACTIVE' ? 'Online' : 'Offline'
      };
    });
  }

  /**
   * 7. Top Cities by Revenue (Dynamic from Store.city)
   */
  public async getTopCities(_query: GetRevenueQuery): Promise<TopCityRevenueItem[]> {
    const agg = await TransactionModel.aggregate([
      { $match: { status: 'PAID' } },
      {
        $lookup: {
          from: 'stores',
          localField: 'storeId',
          foreignField: '_id',
          as: 'store'
        }
      },
      { $unwind: '$store' },
      {
        $group: {
          _id: { city: '$store.city', state: '$store.state' },
          totalRevenue: { $sum: '$amount' },
          transactions: { $sum: 1 }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 10 }
    ]);

    if (agg.length === 0) {
      return [];
    }

    const maxCityRevenue = agg[0]?.totalRevenue || 1;

    return agg.map((c, idx) => {
      const city = c._id.city || 'Central Region';
      const state = c._id.state || 'India';
      const progressPercent = Math.min(100, Math.round((c.totalRevenue / maxCityRevenue) * 100));

      return {
        id: `city-${idx}`,
        city,
        state,
        revenueRaw: c.totalRevenue,
        revenueFormatted: `₹${c.totalRevenue.toLocaleString('en-IN')}`,
        transactions: c.transactions,
        progressPercent
      };
    });
  }

  /**
   * 8. Recent Revenue Transactions Table
   */
  public async getRecentTransactions(query: GetRevenueQuery): Promise<RecentRevenueTransactionItem[]> {
    const baseFilter: any = { status: 'PAID' };
    if (query.store && query.store !== 'All' && query.store !== 'All Stores') {
      const storeDoc = await StoreModel.findOne({ name: new RegExp(query.store, 'i') }).lean();
      if (storeDoc) baseFilter.storeId = storeDoc._id;
    }

    const txns = await TransactionModel.find(baseFilter)
      .populate('storeId', 'name')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    return txns.map((t: any) => {
      const storeName = t.storeId?.name || 'Self Print Station';
      const dateObj = t.createdAt ? new Date(t.createdAt) : new Date();

      return {
        id: String(t._id),
        txnId: t.transactionId || `TXN-${String(t._id).slice(-8).toUpperCase()}`,
        storeName,
        amountFormatted: `₹${Number(t.amount || 0).toFixed(2)}`,
        commissionFormatted: `₹${Number(t.platformFee || t.amount * 0.1).toFixed(2)}`,
        paymentMethod: t.paymentGateway || 'UPI',
        status: 'Success',
        date: dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        time: dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
        timestamp: dateObj.toISOString()
      };
    });
  }

  /**
   * 9. Dynamic Filter Options Discovered from Database
   */
  public async getFilterOptions(): Promise<RevenueFilterOptions> {
    const [stores, cities, gateways] = await Promise.all([
      StoreModel.distinct('name'),
      StoreModel.distinct('city'),
      TransactionModel.distinct('paymentGateway')
    ]);

    return {
      stores: ['All Stores', ...stores.filter(Boolean).sort()],
      cities: ['All Cities', ...cities.filter(Boolean).sort()],
      paymentMethods: ['All Payment Methods', ...gateways.filter(Boolean).sort()],
      revenueTypes: ['All Revenue Types', 'Print Services', 'Subscription Plans', 'Platform Take'],
      periods: ['Today', 'This Week', 'This Month', 'This Year', 'All Time']
    };
  }
}

export const adminRevenueService = new AdminRevenueService();
export default adminRevenueService;
