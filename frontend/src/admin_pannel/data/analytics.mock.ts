import {
  AnalyticsStatsData,
  PrintingActivityDataPoint,
  PlatformHealthMetric,
  HeatmapCell,
  AnalyticsTopStoreItem,
  PaperUsageItem,
  PrintTypeSegment,
  PrinterStatusSegment,
  PlatformEventItem,
  QuickInsightItem
} from '../types/analytics.types';

export const ANALYTICS_STATS_MOCK: AnalyticsStatsData = {
  totalPrintJobs: 12846,
  totalPagesPrinted: 78542,
  avgPrintTime: '24.6 sec',
  printerEfficiency: '92.4%',
  peakUsageTime: '11:00 AM',
  systemUptime: '99.68%',
  cards: [
    {
      id: 'print-jobs',
      title: 'Total Print Jobs Today',
      value: '12,846',
      comparisonText: '↑ 18.6% from yesterday',
      isPositive: true,
      sparkline: [20, 25, 22, 32, 28, 38, 35, 48, 42, 52],
      color: '#6366F1'
    },
    {
      id: 'pages-printed',
      title: 'Total Pages Printed',
      value: '78,542',
      comparisonText: '↑ 16.3% from yesterday',
      isPositive: true,
      sparkline: [30, 35, 32, 42, 38, 48, 45, 58, 52, 65],
      color: '#10B981'
    },
    {
      id: 'avg-print-time',
      title: 'Average Print Time',
      value: '24.6 sec',
      comparisonText: '↓ 8.4% from yesterday',
      isPositive: false,
      sparkline: [40, 36, 38, 32, 35, 28, 30, 26, 28, 24],
      color: '#F59E0B'
    },
    {
      id: 'printer-efficiency',
      title: 'Printer Efficiency',
      value: '92.4%',
      comparisonText: '↑ 7.2% from yesterday',
      isPositive: true,
      sparkline: [75, 78, 76, 82, 80, 85, 84, 88, 90, 92],
      color: '#0EA5E9'
    },
    {
      id: 'peak-usage-time',
      title: 'Peak Usage Time',
      value: '11:00 AM',
      comparisonText: "Today's peak hour",
      isPositive: true,
      sparkline: [10, 15, 25, 40, 60, 50, 35, 25, 18, 12],
      color: '#EF4444'
    },
    {
      id: 'system-uptime',
      title: 'System Uptime',
      value: '99.68%',
      comparisonText: '↑ 0.15% from yesterday',
      isPositive: true,
      sparkline: [98, 98.5, 99, 99.2, 99.1, 99.5, 99.4, 99.6, 99.65, 99.68],
      color: '#8B5CF6'
    }
  ]
};

export const PRINTING_ACTIVITY_DAY: PrintingActivityDataPoint[] = [
  { date: '23 May', pagesPrinted: 11000, pagesPrintedFormatted: '11,000', orders: 850, revenue: 32000, revenueFormatted: '₹32,000' },
  { date: '24 May', pagesPrinted: 10800, pagesPrintedFormatted: '10,800', orders: 920, revenue: 35000, revenueFormatted: '₹35,000' },
  { date: '25 May', pagesPrinted: 12500, pagesPrintedFormatted: '12,500', orders: 1050, revenue: 38500, revenueFormatted: '₹38,500' },
  { date: '26 May', pagesPrinted: 11200, pagesPrintedFormatted: '11,200', orders: 980, revenue: 36000, revenueFormatted: '₹36,000' },
  { date: '27 May', pagesPrinted: 14652, pagesPrintedFormatted: '14,652', orders: 1248, revenue: 45230, revenueFormatted: '₹45,230' },
  { date: '28 May', pagesPrinted: 13800, pagesPrintedFormatted: '13,800', orders: 1180, revenue: 42100, revenueFormatted: '₹42,100' },
  { date: '29 May', pagesPrinted: 14200, pagesPrintedFormatted: '14,200', orders: 1210, revenue: 44000, revenueFormatted: '₹44,000' }
];

export const PRINTING_ACTIVITY_WEEK: PrintingActivityDataPoint[] = [
  { date: 'Week 1', pagesPrinted: 68000, pagesPrintedFormatted: '68,000', orders: 5800, revenue: 210000, revenueFormatted: '₹2,10,000' },
  { date: 'Week 2', pagesPrinted: 74000, pagesPrintedFormatted: '74,000', orders: 6200, revenue: 235000, revenueFormatted: '₹2,35,000' },
  { date: 'Week 3', pagesPrinted: 82000, pagesPrintedFormatted: '82,000', orders: 7100, revenue: 268000, revenueFormatted: '₹2,68,000' },
  { date: 'Week 4', pagesPrinted: 88500, pagesPrintedFormatted: '88,500', orders: 7650, revenue: 295000, revenueFormatted: '₹2,95,000' }
];

export const PRINTING_ACTIVITY_MONTH: PrintingActivityDataPoint[] = [
  { date: 'Jan', pagesPrinted: 240000, pagesPrintedFormatted: '2,40,000', orders: 21000, revenue: 780000, revenueFormatted: '₹7,80,000' },
  { date: 'Feb', pagesPrinted: 265000, pagesPrintedFormatted: '2,65,000', orders: 23500, revenue: 860000, revenueFormatted: '₹8,60,000' },
  { date: 'Mar', pagesPrinted: 290000, pagesPrintedFormatted: '2,90,000', orders: 25800, revenue: 950000, revenueFormatted: '₹9,50,000' },
  { date: 'Apr', pagesPrinted: 315000, pagesPrintedFormatted: '3,15,000', orders: 28000, revenue: 1040000, revenueFormatted: '₹10,40,000' },
  { date: 'May', pagesPrinted: 345000, pagesPrintedFormatted: '3,45,000', orders: 31000, revenue: 1150000, revenueFormatted: '₹11,50,000' }
];

export const PLATFORM_HEALTH_MOCK: PlatformHealthMetric = {
  overallHealthPercent: 98,
  serverHealth: 98,
  apiStatus: 'Online',
  databaseStatus: 'Healthy',
  storageUsedPercent: 62,
  activeConnections: 1256,
  todaysErrors: 12
};

export const generateHeatmapMock = (): HeatmapCell[] => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const cells: HeatmapCell[] = [];

  days.forEach((day) => {
    for (let hour = 0; hour < 24; hour++) {
      let intensity = 0;
      let count = 0;

      // Night hours (12 AM - 7 AM)
      if (hour >= 0 && hour < 7) {
        intensity = Math.random() > 0.6 ? 1 : 0;
        count = intensity * Math.floor(Math.random() * 8 + 2);
      }
      // Morning rush (8 AM - 12 PM)
      else if (hour >= 8 && hour <= 12) {
        intensity = hour === 10 || hour === 11 ? 4 : 3;
        count = intensity * Math.floor(Math.random() * 25 + 40);
      }
      // Afternoon (1 PM - 5 PM)
      else if (hour >= 13 && hour <= 17) {
        intensity = 3;
        count = intensity * Math.floor(Math.random() * 20 + 30);
      }
      // Evening (6 PM - 10 PM)
      else if (hour >= 18 && hour <= 22) {
        intensity = 2;
        count = intensity * Math.floor(Math.random() * 15 + 15);
      }
      // Late night (11 PM)
      else {
        intensity = 1;
        count = Math.floor(Math.random() * 10 + 5);
      }

      cells.push({
        day,
        hour,
        intensity,
        jobsCount: count
      });
    }
  });

  return cells;
};

export const TOP_10_ANALYTICS_STORES: AnalyticsTopStoreItem[] = [
  { rank: 1, name: 'Print Hub Dibrugarh', city: 'Dibrugarh', logoBg: 'bg-emerald-500', logoText: 'P', orders: 1248, revenue: '₹58,760', growth: '↑ 18.5%' },
  { rank: 2, name: 'Print Zone Guwahati', city: 'Guwahati', logoBg: 'bg-purple-600', logoText: 'PZ', orders: 1056, revenue: '₹47,890', growth: '↑ 14.2%' },
  { rank: 3, name: 'Copy Center Jorhat', city: 'Jorhat', logoBg: 'bg-amber-500', logoText: 'CC', orders: 896, revenue: '₹36,420', growth: '↑ 12.6%' },
  { rank: 4, name: 'Docu Print Silchar', city: 'Silchar', logoBg: 'bg-emerald-600', logoText: 'DP', orders: 742, revenue: '₹28,450', growth: '↑ 11.3%' },
  { rank: 5, name: 'Easy Print Tezpur', city: 'Tezpur', logoBg: 'bg-sky-500', logoText: 'EP', orders: 688, revenue: '₹24,890', growth: '↑ 9.4%' },
  { rank: 6, name: 'Print Point Shillong', city: 'Shillong', logoBg: 'bg-rose-500', logoText: 'PP', orders: 612, revenue: '₹22,150', growth: '↑ 8.7%' },
  { rank: 7, name: 'City Print Nagaon', city: 'Nagaon', logoBg: 'bg-indigo-500', logoText: 'CP', orders: 578, revenue: '₹21,480', growth: '↑ 7.6%' },
  { rank: 8, name: 'Mega Print Tinsukia', city: 'Tinsukia', logoBg: 'bg-amber-600', logoText: 'MP', orders: 544, revenue: '₹19,350', growth: '↑ 6.8%' },
  { rank: 9, name: 'Creative Prints Lakhimpur', city: 'Lakhimpur', logoBg: 'bg-purple-500', logoText: 'CR', orders: 489, revenue: '₹17,240', growth: '↑ 6.2%' },
  { rank: 10, name: 'Print World Kokrajhar', city: 'Kokrajhar', logoBg: 'bg-slate-700', logoText: 'PW', orders: 456, revenue: '₹15,780', growth: '↑ 5.1%' }
];

export const PAPER_USAGE_STATS: PaperUsageItem[] = [
  { paperSize: 'A4', usage: 45620, percentage: 52.4 },
  { paperSize: 'Legal', usage: 18450, percentage: 21.2 },
  { paperSize: 'Letter', usage: 12850, percentage: 14.8 },
  { paperSize: 'A3', usage: 6420, percentage: 7.4 },
  { paperSize: 'B5', usage: 2450, percentage: 2.8 },
  { paperSize: 'Others', usage: 750, percentage: 0.9 }
];

export const PRINT_TYPE_SEGMENTS: PrintTypeSegment[] = [
  { name: 'Black & White', count: 41082, percentage: 52.3, color: '#6366F1' },
  { name: 'Color', count: 21678, percentage: 27.6, color: '#0EA5E9' },
  { name: 'Poster', count: 7698, percentage: 9.8, color: '#10B981' },
  { name: 'Photo', count: 5109, percentage: 6.5, color: '#F59E0B' },
  { name: 'Label', count: 2975, percentage: 3.8, color: '#EF4444' }
];

export const PRINTER_STATUS_SEGMENTS: PrinterStatusSegment[] = [
  { name: 'Online', count: 418, percentage: 77.1, color: '#10B981' },
  { name: 'Busy', count: 76, percentage: 14.0, color: '#F59E0B' },
  { name: 'Offline', count: 28, percentage: 5.2, color: '#EF4444' },
  { name: 'Maintenance', count: 10, percentage: 1.8, color: '#8B5CF6' }
];

export const RECENT_PLATFORM_EVENTS: PlatformEventItem[] = [
  {
    id: 'evt-1',
    title: 'Printer HP LaserJet Pro M404dn',
    description: 'went offline',
    timestamp: '10:32 AM',
    type: 'offline',
    colorClass: 'bg-rose-50 border-rose-200 text-rose-600'
  },
  {
    id: 'evt-2',
    title: 'New store Print Hub Dibrugarh',
    description: 'has been added',
    timestamp: '10:21 AM',
    type: 'store_added',
    colorClass: 'bg-emerald-50 border-emerald-200 text-emerald-600'
  },
  {
    id: 'evt-3',
    title: 'Revenue milestone achieved',
    description: "Today's revenue crossed ₹1 Lakh",
    timestamp: '10:15 AM',
    type: 'milestone',
    colorClass: 'bg-purple-50 border-purple-200 text-purple-600'
  },
  {
    id: 'evt-4',
    title: 'Large print job completed',
    description: '1,250 pages printed',
    timestamp: '10:02 AM',
    type: 'large_job',
    colorClass: 'bg-sky-50 border-sky-200 text-sky-600'
  },
  {
    id: 'evt-5',
    title: 'Low paper alert',
    description: 'HP DeskJet 4120e - Paper low',
    timestamp: '09:58 AM',
    type: 'paper_low',
    colorClass: 'bg-amber-50 border-amber-200 text-amber-600'
  },
  {
    id: 'evt-6',
    title: 'New user registered',
    description: 'Rahul Das from Dibrugarh',
    timestamp: '09:46 AM',
    type: 'user_reg',
    colorClass: 'bg-emerald-50 border-emerald-200 text-emerald-600'
  }
];

export const QUICK_INSIGHTS_MOCK: QuickInsightItem[] = [
  {
    id: 'qi-1',
    title: 'Best Performing Store',
    value: 'Print Hub Dibrugarh',
    subtitle: '1,248 orders',
    iconType: 'shield'
  },
  {
    id: 'qi-2',
    title: 'Highest Revenue Store',
    value: 'Print Zone Guwahati',
    subtitle: '₹47,890',
    iconType: 'trending'
  },
  {
    id: 'qi-3',
    title: 'Most Active User',
    value: 'Rahul Das',
    subtitle: '156 orders',
    iconType: 'user'
  },
  {
    id: 'qi-4',
    title: 'Average Queue Time',
    value: '2.4 min',
    subtitle: '↓ 6.3%',
    trend: '↓ 6.3%',
    isPositive: true,
    iconType: 'queue'
  },
  {
    id: 'qi-5',
    title: 'Average Wait Time',
    value: '1.8 min',
    subtitle: '↓ 5.7%',
    trend: '↓ 5.7%',
    isPositive: true,
    iconType: 'wait'
  },
  {
    id: 'qi-6',
    title: 'Average Pages Per Order',
    value: '6.12',
    subtitle: '↑ 8.2%',
    trend: '↑ 8.2%',
    isPositive: true,
    iconType: 'pages'
  },
  {
    id: 'qi-7',
    title: 'Peak Printing Hour',
    value: '11:00 AM',
    subtitle: 'Today',
    iconType: 'peak'
  },
  {
    id: 'qi-8',
    title: 'Platform Growth',
    value: '18.7%',
    subtitle: 'vs last month',
    trend: '18.7%',
    isPositive: true,
    iconType: 'growth'
  }
];
