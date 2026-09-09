import {
  AdminStatCardItem,
  RevenueOverviewData,
  LivePrintActivityItem,
  TopPerformingStoreItem,
  DashboardTransactionItem,
  PlatformAnalyticsData,
  SystemAlertItem,
  RecentUserItem
} from '../types/admin.types';


export const ADMIN_STAT_CARDS: AdminStatCardItem[] = [
  // Row 1
  {
    id: 'total-stores',
    title: 'Total Stores',
    value: '58',
    change: '8.6%',
    isPositive: true,
    comparisonText: 'from last month',
    iconName: 'store',
    colorScheme: 'blue'
  },
  {
    id: 'active-stores',
    title: 'Active Stores',
    value: '46',
    change: '12.4%',
    isPositive: true,
    comparisonText: 'from last month',
    iconName: 'active-store',
    colorScheme: 'emerald'
  },
  {
    id: 'offline-stores',
    title: 'Offline Stores',
    value: '12',
    change: '3.2%',
    isPositive: false,
    comparisonText: 'from last month',
    iconName: 'offline-store',
    colorScheme: 'red'
  },
  {
    id: 'total-users',
    title: 'Total Users',
    value: '1,248',
    change: '15.3%',
    isPositive: true,
    comparisonText: 'from last month',
    iconName: 'users',
    colorScheme: 'indigo'
  },
  {
    id: 'today-orders',
    title: "Today's Orders",
    value: '356',
    change: '18.7%',
    isPositive: true,
    comparisonText: 'from yesterday',
    iconName: 'orders',
    colorScheme: 'amber'
  },
  {
    id: 'orders-in-progress',
    title: 'Orders in Progress',
    value: '72',
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
    value: '284',
    change: '16.8%',
    isPositive: true,
    comparisonText: 'from yesterday',
    iconName: 'completed-orders',
    colorScheme: 'emerald'
  },
  {
    id: 'failed-orders',
    title: 'Failed Orders',
    value: '8',
    change: '2.1%',
    isPositive: false,
    comparisonText: 'from yesterday',
    iconName: 'failed-orders',
    colorScheme: 'red'
  },
  {
    id: 'today-revenue',
    title: "Today's Revenue",
    value: '₹24,560',
    change: '22.5%',
    isPositive: true,
    comparisonText: 'from yesterday',
    iconName: 'today-revenue',
    colorScheme: 'purple'
  },
  {
    id: 'monthly-revenue',
    title: 'Monthly Revenue',
    value: '₹6,45,230',
    change: '18.9%',
    isPositive: true,
    comparisonText: 'from last month',
    iconName: 'monthly-revenue',
    colorScheme: 'teal'
  },
  {
    id: 'platform-commission',
    title: 'Platform Commission',
    value: '₹64,523',
    change: '21.3%',
    isPositive: true,
    comparisonText: 'from last month',
    iconName: 'commission',
    colorScheme: 'indigo'
  },
  {
    id: 'avg-order-value',
    title: 'Avg. Order Value',
    value: '₹68.90',
    change: '5.6%',
    isPositive: true,
    comparisonText: 'from last month',
    iconName: 'aov',
    colorScheme: 'pink'
  }
];

export const ADMIN_REVENUE_OVERVIEW: RevenueOverviewData = {
  totalRevenue: '₹1,45,230',
  changePercentage: '18.6%',
  comparisonPeriod: 'vs last week',
  points: [
    { date: '2025-05-23', displayDate: '23 May', revenue: 17200, orders: 48 },
    { date: '2025-05-24', displayDate: '24 May', revenue: 26800, orders: 64 },
    { date: '2025-05-25', displayDate: '25 May', revenue: 20400, orders: 52 },
    { date: '2025-05-26', displayDate: '26 May', revenue: 31500, orders: 78 },
    { date: '2025-05-27', displayDate: '27 May', revenue: 18100, orders: 45 },
    { date: '2025-05-28', displayDate: '28 May', revenue: 24300, orders: 59 },
    { date: '2025-05-29', displayDate: '29 May', revenue: 35200, orders: 88 }
  ]
};

export const LIVE_PRINT_ACTIVITIES: LivePrintActivityItem[] = [
  {
    id: 'ACT-101',
    storeName: 'Print Hub Dibrugarh',
    status: 'Printing',
    fileName: 'Resume.pdf',
    pageProgress: 'Page 4 / 18',
    colorChip: 'purple',
    timestamp: 'Just now'
  },
  {
    id: 'ACT-102',
    storeName: 'Print Zone Guwahati',
    status: 'Completed',
    fileName: 'Invoice.pdf',
    pageProgress: '6 Pages',
    colorChip: 'green',
    timestamp: '1 min ago'
  },
  {
    id: 'ACT-103',
    storeName: 'Copy Center Jorhat',
    status: 'Printing',
    fileName: 'Project_Report.pdf',
    pageProgress: 'Page 2 / 15',
    colorChip: 'purple',
    timestamp: '2 mins ago'
  },
  {
    id: 'ACT-104',
    storeName: 'Docu Print Silchar',
    status: 'Processing',
    fileName: 'Notes.pdf',
    pageProgress: 'Waiting...',
    colorChip: 'amber',
    timestamp: '3 mins ago'
  },
  {
    id: 'ACT-105',
    storeName: 'Easy Print Tezpur',
    status: 'Completed',
    fileName: 'Assignment.pdf',
    pageProgress: '12 Pages',
    colorChip: 'green',
    timestamp: '4 mins ago'
  }
];

export const TOP_PERFORMING_STORES: TopPerformingStoreItem[] = [
  {
    id: 'STORE-01',
    storeName: 'Print Hub Dibrugarh',
    revenue: '₹58,760',
    orders: 842,
    commission: '₹5,876',
    status: 'Online'
  },
  {
    id: 'STORE-02',
    storeName: 'Print Zone Guwahati',
    revenue: '₹47,890',
    orders: 689,
    commission: '₹4,789',
    status: 'Online'
  },
  {
    id: 'STORE-03',
    storeName: 'Copy Center Jorhat',
    revenue: '₹36,420',
    orders: 512,
    commission: '₹3,642',
    status: 'Online'
  },
  {
    id: 'STORE-04',
    storeName: 'Docu Print Silchar',
    revenue: '₹28,450',
    orders: 421,
    commission: '₹2,845',
    status: 'Busy'
  },
  {
    id: 'STORE-05',
    storeName: 'Easy Print Tezpur',
    revenue: '₹24,890',
    orders: 389,
    commission: '₹2,489',
    status: 'Online'
  }
];

export const RECENT_TRANSACTIONS: DashboardTransactionItem[] = [
  {

    id: 'TXN-250529-001',
    storeName: 'Print Hub Dibrugarh',
    customerName: 'Rahul D.',
    amount: '₹120.00',
    commission: '₹12.00',
    paymentMethod: 'UPI',
    status: 'Success',
    timestamp: '10:28 AM'
  },
  {
    id: 'TXN-250529-002',
    storeName: 'Print Zone Guwahati',
    customerName: 'Nikita P.',
    amount: '₹85.00',
    commission: '₹8.50',
    paymentMethod: 'UPI',
    status: 'Success',
    timestamp: '10:24 AM'
  },
  {
    id: 'TXN-250529-003',
    storeName: 'Copy Center Jorhat',
    customerName: 'Aman K.',
    amount: '₹60.00',
    commission: '₹6.00',
    paymentMethod: 'UPI',
    status: 'Success',
    timestamp: '10:19 AM'
  },
  {
    id: 'TXN-250529-004',
    storeName: 'Docu Print Silchar',
    customerName: 'Priya S.',
    amount: '₹45.00',
    commission: '₹4.50',
    paymentMethod: 'Wallet',
    status: 'Success',
    timestamp: '10:15 AM'
  },
  {
    id: 'TXN-250529-005',
    storeName: 'Easy Print Tezpur',
    customerName: 'Vivek R.',
    amount: '₹70.00',
    commission: '₹7.00',
    paymentMethod: 'UPI',
    status: 'Failed',
    timestamp: '10:08 AM'
  }
];

export const PLATFORM_ANALYTICS: PlatformAnalyticsData = {
  printType: [
    { label: 'Black & White', percentage: 62, color: '#6366F1' },
    { label: 'Color', percentage: 38, color: '#C7D2FE' }
  ],
  paperSize: [
    { label: 'A4', percentage: 72, color: '#3B82F6' },
    { label: 'A3', percentage: 18, color: '#8B5CF6' },
    { label: 'Other', percentage: 10, color: '#F59E0B' }
  ],
  mostUsedPrinters: [
    { label: 'HP LaserJet', percentage: 45, color: '#4F46E5' },
    { label: 'Canon iR', percentage: 30, color: '#14B8A6' },
    { label: 'Epson LQ', percentage: 25, color: '#0EA5E9' }
  ],
  peakHours: [
    { label: '10 AM - 1 PM', percentage: 48, color: '#6366F1' },
    { label: '1 PM - 6 PM', percentage: 35, color: '#10B981' },
    { label: 'Others', percentage: 17, color: '#F59E0B' }
  ]
};

export const SYSTEM_ALERTS: SystemAlertItem[] = [
  {
    id: 'ALERT-01',
    title: 'Low Paper Alert',
    count: 5,
    countLabel: '5 Stores',
    alertType: 'danger',
    icon: 'alert-triangle'
  },
  {
    id: 'ALERT-02',
    title: 'Printer Offline',
    count: 3,
    countLabel: '3 Printers',
    alertType: 'danger',
    icon: 'printer-off'
  },
  {
    id: 'ALERT-03',
    title: 'Store Offline',
    count: 2,
    countLabel: '2 Stores',
    alertType: 'danger',
    icon: 'wifi-off'
  },
  {
    id: 'ALERT-04',
    title: 'Payment Failures',
    count: 7,
    countLabel: '7 Transactions',
    alertType: 'danger',
    icon: 'credit-card-off'
  },
  {
    id: 'ALERT-05',
    title: 'New Stores Awaiting Approval',
    count: 4,
    countLabel: '4 Stores',
    alertType: 'info',
    icon: 'user-plus'
  }
];

export const RECENT_USERS: RecentUserItem[] = [
  {
    id: 'USR-01',
    name: 'Rahul Das',
    storeName: 'Print Hub Dibrugarh',
    lastActivity: '2 mins ago',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    isOnline: true
  },
  {
    id: 'USR-02',
    name: 'Nikita Paul',
    storeName: 'Print Zone Guwahati',
    lastActivity: '5 mins ago',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    isOnline: true
  },
  {
    id: 'USR-03',
    name: 'Aman Kumar',
    storeName: 'Copy Center Jorhat',
    lastActivity: '12 mins ago',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    isOnline: true
  },
  {
    id: 'USR-04',
    name: 'Priya Sharma',
    storeName: 'Docu Print Silchar',
    lastActivity: '18 mins ago',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop&q=80',
    isOnline: true
  },
  {
    id: 'USR-05',
    name: 'Vivek Roy',
    storeName: 'Easy Print Tezpur',
    lastActivity: '25 mins ago',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    isOnline: true
  }
];
