import {
  RevenueStatsData,
  RevenueChartPoint,
  CategoryRevenueSegment,
  PaymentMethodRevenueSegment,
  TopStoreRevenueItem,
  TopCityRevenueItem,
  RecentRevenueTransactionItem
} from '../types/revenue.types';

export const REVENUE_STATS_MOCK: RevenueStatsData = {
  totalRevenue: '₹25,68,450',
  totalRevenueTrend: '↑ 18.7% from last month',
  platformCommission: '₹2,56,845',
  platformCommissionTrend: '↑ 19.6% from last month',
  totalTransactions: 12846,
  totalTransactionsTrend: '↑ 16.8% from last month',
  averageOrderValue: '₹199.80',
  averageOrderValueTrend: '↑ 6.3% from last month',
  refundsAdjustments: '₹48,650',
  refundsTrend: '↓ 4.5% from last month',
  netRevenue: '₹25,19,800',
  netRevenueTrend: '↑ 19.1% from last month'
};

export const DAILY_REVENUE_CHART_POINTS: RevenueChartPoint[] = [
  { label: '1 May', revenue: 20000, revenueFormatted: '₹20,000', orders: 120 },
  { label: '3 May', revenue: 32000, revenueFormatted: '₹32,000', orders: 180 },
  { label: '5 May', revenue: 38000, revenueFormatted: '₹38,000', orders: 210 },
  { label: '7 May', revenue: 28000, revenueFormatted: '₹28,000', orders: 155 },
  { label: '9 May', revenue: 35000, revenueFormatted: '₹35,000', orders: 190 },
  { label: '11 May', revenue: 48000, revenueFormatted: '₹48,000', orders: 260 },
  { label: '13 May', revenue: 52000, revenueFormatted: '₹52,000', orders: 285 },
  { label: '15 May', revenue: 42000, revenueFormatted: '₹42,000', orders: 230 },
  { label: '17 May', revenue: 36000, revenueFormatted: '₹36,000', orders: 195 },
  { label: '19 May', revenue: 46000, revenueFormatted: '₹46,000', orders: 250 },
  { label: '21 May', revenue: 40000, revenueFormatted: '₹40,000', orders: 220 },
  { label: '23 May', revenue: 58000, revenueFormatted: '₹58,000', orders: 310 },
  { label: '25 May', revenue: 52000, revenueFormatted: '₹52,000', orders: 280 },
  { label: '27 May', revenue: 44000, revenueFormatted: '₹44,000', orders: 240 },
  { label: '29 May', revenue: 64000, revenueFormatted: '₹64,000', orders: 350 }
];

export const WEEKLY_REVENUE_CHART_POINTS: RevenueChartPoint[] = [
  { label: 'Week 1', revenue: 485000, revenueFormatted: '₹4,85,000', orders: 2450 },
  { label: 'Week 2', revenue: 612000, revenueFormatted: '₹6,12,000', orders: 3120 },
  { label: 'Week 3', revenue: 590000, revenueFormatted: '₹5,90,000', orders: 2980 },
  { label: 'Week 4', revenue: 881450, revenueFormatted: '₹8,81,450', orders: 4296 }
];

export const MONTHLY_REVENUE_CHART_POINTS: RevenueChartPoint[] = [
  { label: 'Jan', revenue: 1450000, revenueFormatted: '₹14,50,000', orders: 7800 },
  { label: 'Feb', revenue: 1680000, revenueFormatted: '₹16,80,000', orders: 8900 },
  { label: 'Mar', revenue: 1920000, revenueFormatted: '₹19,20,000', orders: 9800 },
  { label: 'Apr', revenue: 2160000, revenueFormatted: '₹21,60,000', orders: 11000 },
  { label: 'May', revenue: 2568450, revenueFormatted: '₹25,68,450', orders: 12846 }
];

export const CATEGORY_REVENUE_SEGMENTS: CategoryRevenueSegment[] = [
  {
    name: 'Print Services',
    amountFormatted: '₹16,45,230',
    amountRaw: 1645230,
    percentage: 64.0,
    color: '#6366F1' // Purple
  },
  {
    name: 'Subscription Plans',
    amountFormatted: '₹4,25,600',
    amountRaw: 425600,
    percentage: 16.6,
    color: '#3B82F6' // Blue
  },
  {
    name: 'Membership Fees',
    amountFormatted: '₹2,15,400',
    amountRaw: 215400,
    percentage: 8.4,
    color: '#10B981' // Green
  },
  {
    name: 'Other Services',
    amountFormatted: '₹2,82,220',
    amountRaw: 282220,
    percentage: 11.0,
    color: '#F59E0B' // Orange
  }
];

export const PAYMENT_METHOD_REVENUE_SEGMENTS: PaymentMethodRevenueSegment[] = [
  {
    name: 'UPI',
    amountFormatted: '₹12,45,230',
    amountRaw: 1245230,
    percentage: 48.5,
    color: '#6366F1' // Purple
  },
  {
    name: 'Card Payments',
    amountFormatted: '₹6,85,420',
    amountRaw: 685420,
    percentage: 26.7,
    color: '#3B82F6' // Blue
  },
  {
    name: 'Wallets',
    amountFormatted: '₹3,45,620',
    amountRaw: 345620,
    percentage: 13.4,
    color: '#10B981' // Emerald
  },
  {
    name: 'Net Banking',
    amountFormatted: '₹2,12,180',
    amountRaw: 212180,
    percentage: 8.2,
    color: '#F59E0B' // Amber
  },
  {
    name: 'Cash',
    amountFormatted: '₹79,000',
    amountRaw: 79000,
    percentage: 3.2,
    color: '#EF4444' // Red
  }
];

export const TOP_PERFORMING_STORES_REVENUE: TopStoreRevenueItem[] = [
  {
    id: 'store-1',
    storeName: 'Print Hub Dibrugarh',
    logoBg: 'bg-slate-900 text-white',
    logoText: 'P',
    city: 'Dibrugarh',
    state: 'Assam',
    revenue: '₹58,760',
    transactions: 842,
    commission: '₹5,876',
    status: 'Online'
  },
  {
    id: 'store-2',
    storeName: 'Print Zone Guwahati',
    logoBg: 'bg-purple-600 text-white',
    logoText: 'PZ',
    city: 'Guwahati',
    state: 'Assam',
    revenue: '₹47,890',
    transactions: 689,
    commission: '₹4,789',
    status: 'Online'
  },
  {
    id: 'store-3',
    storeName: 'Copy Center Jorhat',
    logoBg: 'bg-amber-500 text-white',
    logoText: 'CC',
    city: 'Jorhat',
    state: 'Assam',
    revenue: '₹36,420',
    transactions: 512,
    commission: '₹3,642',
    status: 'Online'
  },
  {
    id: 'store-4',
    storeName: 'Docu Print Silchar',
    logoBg: 'bg-emerald-600 text-white',
    logoText: 'DP',
    city: 'Silchar',
    state: 'Assam',
    revenue: '₹28,450',
    transactions: 421,
    commission: '₹2,845',
    status: 'Busy'
  },
  {
    id: 'store-5',
    storeName: 'Easy Print Tezpur',
    logoBg: 'bg-blue-600 text-white',
    logoText: 'EP',
    city: 'Tezpur',
    state: 'Assam',
    revenue: '₹24,890',
    transactions: 389,
    commission: '₹2,489',
    status: 'Online'
  }
];

export const TOP_CITIES_REVENUE: TopCityRevenueItem[] = [
  {
    id: 'city-1',
    city: 'Guwahati',
    state: 'Assam',
    revenueFormatted: '₹6,45,230',
    revenueRaw: 645230,
    transactions: 3245,
    progressPercent: 100
  },
  {
    id: 'city-2',
    city: 'Dibrugarh',
    state: 'Assam',
    revenueFormatted: '₹4,25,600',
    revenueRaw: 425600,
    transactions: 2156,
    progressPercent: 66
  },
  {
    id: 'city-3',
    city: 'Jorhat',
    state: 'Assam',
    revenueFormatted: '₹3,45,780',
    revenueRaw: 345780,
    transactions: 1845,
    progressPercent: 54
  },
  {
    id: 'city-4',
    city: 'Silchar',
    state: 'Assam',
    revenueFormatted: '₹2,85,400',
    revenueRaw: 285400,
    transactions: 1256,
    progressPercent: 44
  },
  {
    id: 'city-5',
    city: 'Tezpur',
    state: 'Assam',
    revenueFormatted: '₹2,12,540',
    revenueRaw: 212540,
    transactions: 985,
    progressPercent: 33
  },
  {
    id: 'city-6',
    city: 'Shillong',
    state: 'Meghalaya',
    revenueFormatted: '₹1,45,320',
    revenueRaw: 145320,
    transactions: 784,
    progressPercent: 23
  },
  {
    id: 'city-7',
    city: 'Nagaon',
    state: 'Assam',
    revenueFormatted: '₹98,580',
    revenueRaw: 98580,
    transactions: 575,
    progressPercent: 15
  }
];

export const RECENT_REVENUE_TRANSACTIONS: RecentRevenueTransactionItem[] = [
  {
    id: 'rtxn-12',
    txnId: 'TXN-250529-0012',
    storeName: 'Print Hub Dibrugarh',
    amountFormatted: '₹45.00',
    commissionFormatted: '₹4.50',
    status: 'Success',
    date: '29 May 2025',
    time: '10:32 AM'
  },
  {
    id: 'rtxn-11',
    txnId: 'TXN-250529-0011',
    storeName: 'Print Zone Guwahati',
    amountFormatted: '₹12.00',
    commissionFormatted: '₹1.20',
    status: 'Success',
    date: '29 May 2025',
    time: '10:28 AM'
  },
  {
    id: 'rtxn-10',
    txnId: 'TXN-250529-0010',
    storeName: 'Copy Center Jorhat',
    amountFormatted: '₹62.50',
    commissionFormatted: '₹6.25',
    status: 'Success',
    date: '29 May 2025',
    time: '10:21 AM'
  },
  {
    id: 'rtxn-9',
    txnId: 'TXN-250529-0009',
    storeName: 'Docu Print Silchar',
    amountFormatted: '₹8.00',
    commissionFormatted: '₹0.80',
    status: 'Pending',
    date: '29 May 2025',
    time: '10:18 AM'
  },
  {
    id: 'rtxn-8',
    txnId: 'TXN-250529-0008',
    storeName: 'Easy Print Tezpur',
    amountFormatted: '₹75.00',
    commissionFormatted: '₹7.50',
    status: 'Success',
    date: '29 May 2025',
    time: '10:14 AM'
  }
];
