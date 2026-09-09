import {
  JobItem,
  StatItem,
  PrinterStatusInfo,
  ActivityItem,
  StockAlertItem,
  SummaryBreakdown,
  StoreInfo
} from '../types/dashboard.types';

export const mockStoreInfo: StoreInfo = {
  name: 'Demo Print Store',
  location: 'Koramangala, Bengaluru',
  isOnline: true,
  isPaused: false
};

export const mockStatItems: StatItem[] = [
  {
    id: 'jobs',
    title: "Today's Jobs",
    value: 48,
    trend: {
      value: '12%',
      isPositive: true,
      period: 'vs yesterday'
    },
    variant: 'purple'
  },
  {
    id: 'revenue',
    title: "Today's Revenue",
    value: '₹720.00',
    trend: {
      value: '8%',
      isPositive: true,
      period: 'vs yesterday'
    },
    variant: 'green'
  },
  {
    id: 'printing',
    title: 'Printing Now',
    value: 1,
    actionLabel: 'View in Queue',
    actionTab: 'Printing',
    variant: 'blue'
  },
  {
    id: 'waiting',
    title: 'Waiting in Queue',
    value: 2,
    actionLabel: 'View in Queue',
    actionTab: 'Waiting',
    variant: 'amber'
  }
];

export const mockQueueJobs: JobItem[] = [
  {
    id: 'job-102',
    jobCode: '#102',
    fileName: 'notes.pdf',
    fileType: 'pdf',
    fileSize: '2.4 MB',
    customer: 'Guest',
    pages: 12,
    copies: 1,
    colorMode: 'B&W',
    status: 'Printing',
    time: '10:24 AM',
    timeAgo: '2 mins ago',
    cost: 24
  },
  {
    id: 'job-103',
    jobCode: '#103',
    fileName: 'assignment.pdf',
    fileType: 'pdf',
    fileSize: '4.8 MB',
    customer: 'Guest',
    pages: 8,
    copies: 2,
    colorMode: 'Color',
    status: 'Waiting',
    time: '10:25 AM',
    timeAgo: '1 min ago',
    cost: 160
  },
  {
    id: 'job-104',
    jobCode: '#104',
    fileName: 'project.pdf',
    fileType: 'pdf',
    fileSize: '15.1 MB',
    customer: 'Guest',
    pages: 25,
    copies: 1,
    colorMode: 'B&W',
    status: 'Waiting',
    time: '10:26 AM',
    timeAgo: 'Just now',
    cost: 50
  },
  {
    id: 'job-101',
    jobCode: '#101',
    fileName: 'book.pdf',
    fileType: 'pdf',
    fileSize: '8.2 MB',
    customer: 'Guest',
    pages: 15,
    copies: 1,
    colorMode: 'B&W',
    status: 'Completed',
    time: '10:20 AM',
    timeAgo: '6 mins ago',
    cost: 30
  },
  {
    id: 'job-100',
    jobCode: '#100',
    fileName: 'report.pdf',
    fileType: 'pdf',
    fileSize: '5.6 MB',
    customer: 'Guest',
    pages: 10,
    copies: 1,
    colorMode: 'Color',
    status: 'Completed',
    time: '10:18 AM',
    timeAgo: '8 mins ago',
    cost: 100
  },
  {
    id: 'job-099',
    jobCode: '#099',
    fileName: 'thesis_final.pdf',
    fileType: 'pdf',
    fileSize: '18.4 MB',
    customer: 'Guest',
    pages: 42,
    copies: 1,
    colorMode: 'B&W',
    status: 'Completed',
    time: '10:05 AM',
    timeAgo: '21 mins ago',
    cost: 84
  },
  {
    id: 'job-098',
    jobCode: '#098',
    fileName: 'flyer_marketing.pdf',
    fileType: 'pdf',
    fileSize: '1.2 MB',
    customer: 'Guest',
    pages: 4,
    copies: 5,
    colorMode: 'Color',
    status: 'Failed',
    time: '09:50 AM',
    timeAgo: '36 mins ago',
    cost: 200
  },
  {
    id: 'job-097',
    jobCode: '#097',
    fileName: 'invoice_tax.pdf',
    fileType: 'pdf',
    fileSize: '650 KB',
    customer: 'Guest',
    pages: 2,
    copies: 1,
    colorMode: 'B&W',
    status: 'Completed',
    time: '09:42 AM',
    timeAgo: '44 mins ago',
    cost: 4
  }
];

export const mockPrinterStatus: PrinterStatusInfo = {
  name: 'No printer configured',
  model: 'Not Configured',
  isOnline: false,
  isConfigured: false,
  connectionStatus: 'Disconnected',
  printerStatus: 'Not Configured',
  paperSize: 'A4',
  tonerPercentage: 0
};

export const mockActivities: ActivityItem[] = [
  {
    id: 'act-1',
    jobCode: 'Job #101',
    action: 'completed',
    fileName: 'book.pdf',
    time: '10:20 AM',
    type: 'success'
  },
  {
    id: 'act-2',
    jobCode: 'Job #102',
    action: 'started printing',
    fileName: 'notes.pdf',
    time: '10:24 AM',
    type: 'info'
  },
  {
    id: 'act-3',
    jobCode: 'Job #103',
    action: 'added to queue',
    fileName: 'assignment.pdf',
    time: '10:25 AM',
    type: 'warning'
  }
];

export const mockStockAlerts: StockAlertItem[] = [
  {
    id: 'stock-1',
    itemName: 'A4 Paper',
    details: 'Only 32 sheets left',
    severity: 'Low',
    type: 'paper'
  },
  {
    id: 'stock-2',
    itemName: 'Toner Cartridge',
    details: '20% remaining',
    severity: 'Low',
    type: 'toner'
  },
  {
    id: 'stock-3',
    itemName: 'Color Ink',
    details: '15% remaining',
    severity: 'Critical',
    type: 'ink'
  }
];

export const mockSummaryBreakdown: SummaryBreakdown = {
  totalJobs: 48,
  completed: 45,
  completedPercent: 75,
  printing: 1,
  printingPercent: 2,
  waiting: 2,
  waitingPercent: 3,
  failed: 1,
  failedPercent: 2,
  totalRevenue: '₹720.00'
};
