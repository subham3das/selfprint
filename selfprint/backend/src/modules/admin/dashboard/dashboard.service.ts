import { StoreModel } from '../../../models/store.model';
import { UserModel } from '../../../models/user.model';
import { PrintJobModel } from '../../../models/printJob.model';
import { TransactionModel } from '../../../models/transaction.model';
import { PrinterModel } from '../../../models/printer.model';
import {
  AdminDashboardStatCard,
  DashboardOverviewResponse,
  DashboardTransactionItem,
  LivePrintActivityItem,
  PlatformAnalyticsResponse,
  RevenueOverviewResponse,
  SystemAlertItem,
  TopPerformingStoreItem,
  RecentUserItem
} from './dashboard.types';

export class AdminDashboardService {
  /**
   * 1. 12 Global Platform KPI Metric Cards
   */
  public async getStats(): Promise<AdminDashboardStatCard[]> {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterdayStart = new Date(todayStart.getTime() - 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalStores,
      activeStores,
      offlineStores,
      totalUsers,
      todayOrders,
      yesterdayOrders,
      ordersInProgress,
      completedOrders,
      failedOrders,
      todayRevenueAgg,
      yesterdayRevenueAgg,
      monthRevenueAgg
    ] = await Promise.all([
      StoreModel.countDocuments(),
      StoreModel.countDocuments({ status: 'ACTIVE' }),
      StoreModel.countDocuments({ status: { $in: ['INACTIVE', 'SUSPENDED'] } }),
      UserModel.countDocuments({ isDeleted: { $ne: true } }),
      PrintJobModel.countDocuments({ createdAt: { $gte: todayStart } }),
      PrintJobModel.countDocuments({ createdAt: { $gte: yesterdayStart, $lt: todayStart } }),
      PrintJobModel.countDocuments({
        status: { $in: ['Printing', 'PRINTING', 'Waiting', 'WAITING'] }
      }),
      PrintJobModel.countDocuments({
        status: { $in: ['Completed', 'COMPLETED'] },
        createdAt: { $gte: todayStart }
      }),
      PrintJobModel.countDocuments({
        status: { $in: ['Failed', 'FAILED'] },
        createdAt: { $gte: todayStart }
      }),
      TransactionModel.aggregate([
        { $match: { status: 'PAID', createdAt: { $gte: todayStart } } },
        { $group: { _id: null, total: { $sum: '$amount' }, fee: { $sum: '$platformFee' } } }
      ]),
      TransactionModel.aggregate([
        { $match: { status: 'PAID', createdAt: { $gte: yesterdayStart, $lt: todayStart } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      TransactionModel.aggregate([
        { $match: { status: 'PAID', createdAt: { $gte: monthStart } } },
        { $group: { _id: null, total: { $sum: '$amount' }, fee: { $sum: '$platformFee' } } }
      ])
    ]);

    const todayRev = todayRevenueAgg[0]?.total || 0;
    const yesterdayRev = yesterdayRevenueAgg[0]?.total || 0;
    const monthRev = monthRevenueAgg[0]?.total || 0;
    const platformFeeMonth = monthRevenueAgg[0]?.fee || Math.round(monthRev * 0.1);

    const totalOrdersMonth = await PrintJobModel.countDocuments({ createdAt: { $gte: monthStart } });
    const aov = totalOrdersMonth > 0 ? (monthRev / totalOrdersMonth).toFixed(2) : '0.00';

    const orderChangePercent =
      yesterdayOrders > 0
        ? `${(((todayOrders - yesterdayOrders) / yesterdayOrders) * 100).toFixed(1)}%`
        : todayOrders > 0
        ? '+100%'
        : '0%';

    const revChangePercent =
      yesterdayRev > 0
        ? `${(((todayRev - yesterdayRev) / yesterdayRev) * 100).toFixed(1)}%`
        : todayRev > 0
        ? '+100%'
        : '0%';

    return [
      // Row 1
      {
        id: 'total-stores',
        title: 'Total Stores',
        value: totalStores.toLocaleString(),
        change: 'Live',
        isPositive: true,
        comparisonText: 'in system',
        iconName: 'store',
        colorScheme: 'blue'
      },
      {
        id: 'active-stores',
        title: 'Active Stores',
        value: activeStores.toLocaleString(),
        change: totalStores > 0 ? `${((activeStores / totalStores) * 100).toFixed(0)}%` : '0%',
        isPositive: true,
        comparisonText: 'operational',
        iconName: 'active-store',
        colorScheme: 'emerald'
      },
      {
        id: 'offline-stores',
        title: 'Offline Stores',
        value: offlineStores.toLocaleString(),
        change: totalStores > 0 ? `${((offlineStores / totalStores) * 100).toFixed(0)}%` : '0%',
        isPositive: offlineStores === 0,
        comparisonText: 'attention needed',
        iconName: 'offline-store',
        colorScheme: 'red'
      },
      {
        id: 'total-users',
        title: 'Total Users',
        value: totalUsers.toLocaleString(),
        change: 'Active',
        isPositive: true,
        comparisonText: 'registered accounts',
        iconName: 'users',
        colorScheme: 'indigo'
      },
      {
        id: 'today-orders',
        title: "Today's Orders",
        value: todayOrders.toLocaleString(),
        change: orderChangePercent,
        isPositive: todayOrders >= yesterdayOrders,
        comparisonText: 'from yesterday',
        iconName: 'orders',
        colorScheme: 'amber'
      },
      {
        id: 'orders-in-progress',
        title: 'Orders in Progress',
        value: ordersInProgress.toLocaleString(),
        change: '',
        isPositive: true,
        comparisonText: 'Live',
        iconName: 'live-orders',
        colorScheme: 'blue',
        isLive: true
      },
      // Row 2
      {
        id: 'completed-orders',
        title: 'Completed Orders',
        value: completedOrders.toLocaleString(),
        change: 'Today',
        isPositive: true,
        comparisonText: 'dispatched successfully',
        iconName: 'completed-orders',
        colorScheme: 'emerald'
      },
      {
        id: 'failed-orders',
        title: 'Failed Orders',
        value: failedOrders.toLocaleString(),
        change: 'Today',
        isPositive: failedOrders === 0,
        comparisonText: 'investigate errors',
        iconName: 'failed-orders',
        colorScheme: 'red'
      },
      {
        id: 'today-revenue',
        title: "Today's Revenue",
        value: `₹${todayRev.toLocaleString()}`,
        change: revChangePercent,
        isPositive: todayRev >= yesterdayRev,
        comparisonText: 'from yesterday',
        iconName: 'today-revenue',
        colorScheme: 'purple'
      },
      {
        id: 'monthly-revenue',
        title: 'Monthly Revenue',
        value: `₹${monthRev.toLocaleString()}`,
        change: 'Month to date',
        isPositive: true,
        comparisonText: 'current billing cycle',
        iconName: 'monthly-revenue',
        colorScheme: 'teal'
      },
      {
        id: 'platform-commission',
        title: 'Platform Commission',
        value: `₹${platformFeeMonth.toLocaleString()}`,
        change: 'Gross',
        isPositive: true,
        comparisonText: 'platform take',
        iconName: 'commission',
        colorScheme: 'indigo'
      },
      {
        id: 'avg-order-value',
        title: 'Avg. Order Value',
        value: `₹${aov}`,
        change: 'Per Job',
        isPositive: true,
        comparisonText: 'across all stores',
        iconName: 'aov',
        colorScheme: 'pink'
      }
    ];
  }

  /**
   * 2. Revenue Overview Time-Series Graph
   */
  public async getRevenue(period: 'This Week' | 'This Month' | 'This Year' = 'This Week'): Promise<RevenueOverviewResponse> {
    const now = new Date();
    let startDate = new Date();
    let prevStartDate = new Date();
    let numDays = 7;

    if (period === 'This Month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      prevStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      numDays = now.getDate();
    } else if (period === 'This Year') {
      startDate = new Date(now.getFullYear(), 0, 1);
      prevStartDate = new Date(now.getFullYear() - 1, 0, 1);
      numDays = 12;
    } else {
      // This Week
      startDate = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);
      startDate.setHours(0, 0, 0, 0);
      prevStartDate = new Date(startDate.getTime() - 7 * 24 * 60 * 60 * 1000);
      numDays = 7;
    }

    const [txns, prevTxns] = await Promise.all([
      TransactionModel.aggregate([
        { $match: { status: 'PAID', createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: {
              $dateToString: {
                format: period === 'This Year' ? '%Y-%m' : '%Y-%m-%d',
                date: '$createdAt'
              }
            },
            revenue: { $sum: '$amount' },
            orders: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      TransactionModel.aggregate([
        { $match: { status: 'PAID', createdAt: { $gte: prevStartDate, $lt: startDate } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);

    const txMap = new Map<string, { revenue: number; orders: number }>();
    txns.forEach((t) => txMap.set(t._id, { revenue: t.revenue, orders: t.orders }));

    const points = [];
    let totalRevenueSum = 0;

    if (period === 'This Year') {
      for (let m = 0; m < 12; m++) {
        const d = new Date(now.getFullYear(), m, 1);
        const key = d.toISOString().slice(0, 7);
        const displayDate = d.toLocaleDateString('en-GB', { month: 'short' });
        const val = txMap.get(key) || { revenue: 0, orders: 0 };
        totalRevenueSum += val.revenue;
        points.push({
          date: key,
          displayDate,
          revenue: val.revenue,
          orders: val.orders
        });
      }
    } else {
      for (let i = 0; i < numDays; i++) {
        const d = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
        const key = d.toISOString().slice(0, 10);
        const displayDate = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
        const val = txMap.get(key) || { revenue: 0, orders: 0 };
        totalRevenueSum += val.revenue;
        points.push({
          date: key,
          displayDate,
          revenue: val.revenue,
          orders: val.orders
        });
      }
    }

    const prevRev = prevTxns[0]?.total || 0;
    const changePercentage =
      prevRev > 0
        ? `${(((totalRevenueSum - prevRev) / prevRev) * 100).toFixed(1)}%`
        : totalRevenueSum > 0
        ? '+100%'
        : '0%';

    return {
      totalRevenue: `₹${totalRevenueSum.toLocaleString()}`,
      changePercentage,
      comparisonPeriod: `vs previous ${period.toLowerCase()}`,
      points
    };
  }

  /**
   * 3. Live Print Activities Spooler Stream
   */
  public async getLiveActivities(): Promise<LivePrintActivityItem[]> {
    const jobs = await PrintJobModel.find()
      .populate('storeId', 'name')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    return jobs.map((job) => {
      const storeName = (job.storeId as any)?.name || 'Central Kiosk';
      const statusLower = String(job.status).toLowerCase();

      let colorChip: 'purple' | 'green' | 'amber' | 'red' = 'purple';
      if (statusLower.includes('completed')) colorChip = 'green';
      else if (statusLower.includes('failed') || statusLower.includes('cancel')) colorChip = 'red';
      else if (statusLower.includes('wait') || statusLower.includes('process')) colorChip = 'amber';

      const timeFormatted = job.createdAt
        ? new Date(job.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : 'Just now';

      return {
        id: job.jobNumber || String(job._id).slice(-6).toUpperCase(),
        storeName,
        status: String(job.status),
        fileName: job.fileName || 'Document.pdf',
        pageProgress: `${job.totalPages || 1} Pages (${job.copies || 1}x)`,
        colorChip,
        timestamp: timeFormatted
      };
    });
  }

  /**
   * 4. Top Performing Store Partners Leaderboard
   */
  public async getTopStores(): Promise<TopPerformingStoreItem[]> {
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
      { $limit: 5 },
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
        revenue: '₹0',
        orders: 0,
        commission: '₹0',
        status: 'Online'
      }));
    }

    return agg.map((item) => ({
      id: String(item.store._id),
      storeName: item.store.name,
      revenue: `₹${item.totalRevenue.toLocaleString()}`,
      orders: item.orderCount,
      commission: `₹${(item.totalCommission || Math.round(item.totalRevenue * 0.1)).toLocaleString()}`,
      status: item.store.status === 'ACTIVE' ? 'Online' : 'Offline'
    }));
  }

  /**
   * 5. Recent Platform Payment Transactions
   */
  public async getRecentTransactions(limit = 5): Promise<DashboardTransactionItem[]> {
    const txns = await TransactionModel.find()
      .populate('storeId', 'name')
      .populate('userId', 'name')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return txns.map((t) => {
      const storeName = (t.storeId as any)?.name || 'Station';
      const customerName = (t.userId as any)?.name || 'Guest User';
      const timeFormatted = t.createdAt
        ? new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : 'Recent';

      let uiStatus: 'Success' | 'Pending' | 'Failed' | 'Refunded' = 'Success';
      if (t.status === 'PAID') uiStatus = 'Success';
      else if (t.status === 'PENDING') uiStatus = 'Pending';
      else if (t.status === 'REFUNDED') uiStatus = 'Refunded';
      else if (t.status === 'FAILED') uiStatus = 'Failed';

      return {
        id: t.transactionId,
        storeName,
        customerName,
        amount: `₹${t.amount.toFixed(2)}`,
        commission: `₹${(t.platformFee || t.amount * 0.1).toFixed(2)}`,
        paymentMethod: t.paymentGateway || 'UPI',
        status: uiStatus,
        timestamp: timeFormatted
      };
    });
  }

  /**
   * 6. Platform Analytics Distributions (Donut Charts) — 100% MongoDB Driven
   */
  public async getPlatformAnalytics(_period = 'This Month'): Promise<PlatformAnalyticsResponse> {
    const totalJobs = await PrintJobModel.countDocuments();

    // If zero jobs in database, return strictly empty arrays (No fabrication)
    if (totalJobs === 0) {
      // Check if printers are configured in DB
      const totalPrinters = await PrinterModel.countDocuments();
      let mostUsedPrinters: any[] = [];
      if (totalPrinters > 0) {
        const printersAgg = await PrinterModel.aggregate([
          {
            $group: {
              _id: '$model',
              count: { $sum: 1 }
            }
          },
          { $sort: { count: -1 } },
          { $limit: 4 }
        ]);
        const printerPalette = ['#4F46E5', '#14B8A6', '#0EA5E9', '#F59E0B'];
        mostUsedPrinters = printersAgg.map((p, idx) => ({
          label: p._id || 'Configured Printer',
          percentage: Math.round((p.count / totalPrinters) * 100),
          color: printerPalette[idx % printerPalette.length]
        }));
      }

      return {
        printType: [],
        paperSize: [],
        mostUsedPrinters,
        peakHours: []
      };
    }

    // 1. Print Type Aggregation
    const printTypeAgg = await PrintJobModel.aggregate([
      {
        $group: {
          _id: { $toUpper: '$printType' },
          count: { $sum: 1 }
        }
      }
    ]);

    const printTypeColors: Record<string, string> = {
      'BW': '#6366F1',
      'B&W': '#6366F1',
      'BLACK & WHITE': '#6366F1',
      'COLOR': '#C7D2FE'
    };

    const printType = printTypeAgg.map((pt) => {
      const label =
        pt._id === 'BW' || pt._id === 'B&W' ? 'Black & White' : pt._id === 'COLOR' ? 'Color' : pt._id;
      return {
        label,
        percentage: Math.round((pt.count / totalJobs) * 100),
        color: printTypeColors[pt._id] || '#6366F1'
      };
    });

    // 2. Paper Size Aggregation
    const paperSizeAgg = await PrintJobModel.aggregate([
      {
        $group: {
          _id: { $toUpper: '$paperSize' },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const paperColors: Record<string, string> = {
      'A4': '#3B82F6',
      'A3': '#8B5CF6',
      'LETTER': '#EC4899',
      'LEGAL': '#F59E0B'
    };

    const paperSize = paperSizeAgg.map((ps) => ({
      label: ps._id || 'Other',
      percentage: Math.round((ps.count / totalJobs) * 100),
      color: paperColors[ps._id] || '#0EA5E9'
    }));

    // 3. Most Used Printers Aggregation
    const totalPrinters = await PrinterModel.countDocuments();
    let mostUsedPrinters: any[] = [];
    if (totalPrinters > 0) {
      const printersAgg = await PrinterModel.aggregate([
        {
          $group: {
            _id: '$model',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 4 }
      ]);
      const printerPalette = ['#4F46E5', '#14B8A6', '#0EA5E9', '#F59E0B'];
      mostUsedPrinters = printersAgg.map((p, idx) => ({
        label: p._id || 'Standard Printer',
        percentage: Math.round((p.count / totalPrinters) * 100),
        color: printerPalette[idx % printerPalette.length]
      }));
    }

    // 4. Peak Hours Aggregation
    const hoursAgg = await PrintJobModel.aggregate([
      {
        $project: {
          hour: { $hour: '$createdAt' }
        }
      },
      {
        $bucket: {
          groupBy: '$hour',
          boundaries: [0, 6, 12, 17, 22, 24],
          default: 'Other',
          output: {
            count: { $sum: 1 }
          }
        }
      }
    ]);

    const bucketLabels: Record<string, { label: string; color: string }> = {
      '0': { label: 'Night (12AM-6AM)', color: '#64748B' },
      '6': { label: 'Morning (6AM-12PM)', color: '#6366F1' },
      '12': { label: 'Afternoon (12PM-5PM)', color: '#10B981' },
      '17': { label: 'Evening (5PM-10PM)', color: '#F59E0B' },
      '22': { label: 'Late Night (10PM-12AM)', color: '#8B5CF6' }
    };

    const peakHours = hoursAgg.map((h) => {
      const info = bucketLabels[String(h._id)] || { label: `Slot ${h._id}`, color: '#6366F1' };
      return {
        label: info.label,
        percentage: Math.round((h.count / totalJobs) * 100),
        color: info.color
      };
    });

    return {
      printType,
      paperSize,
      mostUsedPrinters,
      peakHours
    };
  }

  /**
   * 7. System Health Alerts
   */
  public async getSystemAlerts(): Promise<SystemAlertItem[]> {
    const [offlinePrinters, offlineStores, pendingStores, failedTxns] = await Promise.all([
      PrinterModel.countDocuments({ status: { $in: ['OFFLINE', 'ERROR'] } }),
      StoreModel.countDocuments({ status: 'INACTIVE' }),
      StoreModel.countDocuments({ $or: [{ status: 'PENDING' }, { isVerified: false }] }),
      TransactionModel.countDocuments({ status: 'FAILED' })
    ]);

    const alerts: SystemAlertItem[] = [];

    if (offlinePrinters > 0) {
      alerts.push({
        id: 'ALERT-01',
        title: 'Printer Offline',
        count: offlinePrinters,
        countLabel: `${offlinePrinters} Printers`,
        alertType: 'danger',
        icon: 'printer-off'
      });
    }

    if (offlineStores > 0) {
      alerts.push({
        id: 'ALERT-02',
        title: 'Store Offline',
        count: offlineStores,
        countLabel: `${offlineStores} Stores`,
        alertType: 'danger',
        icon: 'wifi-off'
      });
    }

    if (pendingStores > 0) {
      alerts.push({
        id: 'ALERT-03',
        title: 'New Stores Awaiting Approval',
        count: pendingStores,
        countLabel: `${pendingStores} Stores`,
        alertType: 'info',
        icon: 'user-plus'
      });
    }

    if (failedTxns > 0) {
      alerts.push({
        id: 'ALERT-04',
        title: 'Payment Failures',
        count: failedTxns,
        countLabel: `${failedTxns} Transactions`,
        alertType: 'danger',
        icon: 'credit-card-off'
      });
    }

    return alerts;
  }

  /**
   * 8. Recent Registered Users
   */
  public async getRecentUsers(): Promise<RecentUserItem[]> {
    const users = await UserModel.find({ isDeleted: { $ne: true } })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    return users.map((u, idx) => {
      const initials = (u.name || 'User')
        .split(' ')
        .slice(0, 2)
        .map((n) => n[0])
        .join('')
        .toUpperCase();

      const timeAgo = u.createdAt
        ? new Date(u.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : 'Recent';

      return {
        id: String(u._id),
        name: u.name || 'Platform User',
        storeName: u.email || `User #${idx + 1}`,
        lastActivity: timeAgo,
        avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(initials || 'U')}`,
        isOnline: true
      };
    });
  }

  /**
   * 9. Complete Overview Aggregate Endpoint
   */
  public async getOverview(revenuePeriod = 'This Week', analyticsPeriod = 'This Month'): Promise<DashboardOverviewResponse> {
    const [
      stats,
      revenueData,
      liveActivities,
      topStores,
      transactions,
      analytics,
      alerts,
      recentUsers
    ] = await Promise.all([
      this.getStats(),
      this.getRevenue(revenuePeriod as any),
      this.getLiveActivities(),
      this.getTopStores(),
      this.getRecentTransactions(),
      this.getPlatformAnalytics(analyticsPeriod),
      this.getSystemAlerts(),
      this.getRecentUsers()
    ]);

    return {
      stats,
      summary: stats,
      revenueData,
      revenueOverview: revenueData,
      liveActivities,
      livePrintActivity: liveActivities,
      topStores,
      transactions,
      recentTransactions: transactions,
      analytics,
      alerts,
      recentUsers
    };
  }

  /**
   * 10. Dashboard Global Search
   */
  public async search(q: string) {
    if (!q || !q.trim()) {
      return { stores: [], users: [], transactions: [] };
    }

    const reg = new RegExp(q.trim(), 'i');
    const [stores, users, transactions] = await Promise.all([
      StoreModel.find({ $or: [{ name: reg }, { storeCode: reg }, { city: reg }] })
        .limit(5)
        .lean(),
      UserModel.find({ $or: [{ name: reg }, { email: reg }, { phone: reg }] })
        .limit(5)
        .lean(),
      TransactionModel.find({ $or: [{ transactionId: reg }] })
        .limit(5)
        .lean()
    ]);

    return { stores, users, transactions };
  }
}

export const adminDashboardService = new AdminDashboardService();
export default adminDashboardService;
