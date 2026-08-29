import { QueueJobItem, QueueSummaryStats } from '../types/queue.types';

export const initialQueueSummary: QueueSummaryStats = {
  printingNow: 1,
  waitingInQueue: 2,
  completedToday: 45,
  failedToday: 1,
  cancelledToday: 1,
  totalRevenueToday: 720,
  avgWaitTimeMinutes: 3
};

export const initialQueueJobs: QueueJobItem[] = [
  {
    id: 'job-102',
    jobCode: '#102',
    fullJobId: 'SP-20250812-102',
    customerName: 'Guest',
    customerPhone: '+91 98765 43210',
    fileName: 'notes.pdf',
    fileSize: '1.2 MB',
    fileType: 'pdf',
    pages: 12,
    copies: 1,
    colorMode: 'B&W',
    paperSize: 'A4',
    estimatedPrice: 24.0,
    uploadTime: '10:24 AM',
    timeAgo: '2 mins ago',
    estimatedFinishTime: '10:26 AM',
    status: 'Printing',
    paymentStatus: 'Paid',
    currentPrintingPage: 1,
    progressPercent: 8,
    timeline: {
      waitingAt: '10:24 AM',
      printingAt: '10:24 AM'
    }
  },
  {
    id: 'job-103',
    jobCode: '#103',
    fullJobId: 'SP-20250812-103',
    customerName: 'Guest',
    customerPhone: '+91 98123 45678',
    fileName: 'assignment.pdf',
    fileSize: '850 KB',
    fileType: 'pdf',
    pages: 8,
    copies: 2,
    colorMode: 'Color',
    paperSize: 'A4',
    estimatedPrice: 160.0,
    uploadTime: '10:25 AM',
    timeAgo: '1 min ago',
    estimatedFinishTime: '10:28 AM',
    status: 'Waiting',
    queueNumber: 1,
    statusReason: 'In queue #1',
    paymentStatus: 'Paid',
    timeline: {
      waitingAt: '10:25 AM'
    }
  },
  {
    id: 'job-104',
    jobCode: '#104',
    fullJobId: 'SP-20250812-104',
    customerName: 'Guest',
    customerPhone: '+91 99456 78901',
    fileName: 'project.pdf',
    fileSize: '3.5 MB',
    fileType: 'pdf',
    pages: 25,
    copies: 1,
    colorMode: 'B&W',
    paperSize: 'A4',
    estimatedPrice: 50.0,
    uploadTime: '10:26 AM',
    timeAgo: 'Just now',
    estimatedFinishTime: '10:31 AM',
    status: 'Waiting',
    queueNumber: 2,
    statusReason: 'In queue #2',
    paymentStatus: 'Paid',
    timeline: {
      waitingAt: '10:26 AM'
    }
  },
  {
    id: 'job-101',
    jobCode: '#101',
    fullJobId: 'SP-20250812-101',
    customerName: 'Guest',
    customerPhone: '+91 97890 12345',
    fileName: 'book.pdf',
    fileSize: '2.1 MB',
    fileType: 'pdf',
    pages: 15,
    copies: 1,
    colorMode: 'B&W',
    paperSize: 'A4',
    estimatedPrice: 30.0,
    uploadTime: '10:20 AM',
    timeAgo: '6 mins ago',
    status: 'Completed',
    paymentStatus: 'Paid',
    timeline: {
      waitingAt: '10:18 AM',
      printingAt: '10:19 AM',
      completedAt: '10:20 AM'
    }
  },
  {
    id: 'job-100',
    jobCode: '#100',
    fullJobId: 'SP-20250812-100',
    customerName: 'Guest',
    customerPhone: '+91 96543 21098',
    fileName: 'report.pdf',
    fileSize: '1.8 MB',
    fileType: 'pdf',
    pages: 10,
    copies: 1,
    colorMode: 'Color',
    paperSize: 'A4',
    estimatedPrice: 100.0,
    uploadTime: '10:18 AM',
    timeAgo: '8 mins ago',
    status: 'Completed',
    paymentStatus: 'Paid',
    timeline: {
      waitingAt: '10:15 AM',
      printingAt: '10:16 AM',
      completedAt: '10:18 AM'
    }
  },
  {
    id: 'job-099',
    jobCode: '#099',
    fullJobId: 'SP-20250812-099',
    customerName: 'Guest',
    customerPhone: '+91 95432 10987',
    fileName: 'image.pdf',
    fileSize: '600 KB',
    fileType: 'pdf',
    pages: 5,
    copies: 1,
    colorMode: 'B&W',
    paperSize: 'A4',
    estimatedPrice: 10.0,
    uploadTime: '10:15 AM',
    timeAgo: '11 mins ago',
    status: 'Failed',
    statusReason: 'Paper jam',
    paymentStatus: 'Paid',
    timeline: {
      waitingAt: '10:12 AM',
      printingAt: '10:14 AM',
      failedAt: '10:15 AM'
    }
  },
  {
    id: 'job-098',
    jobCode: '#098',
    fullJobId: 'SP-20250812-098',
    customerName: 'Guest',
    customerPhone: '+91 94321 09876',
    fileName: 'contract_draft.pdf',
    fileSize: '920 KB',
    fileType: 'pdf',
    pages: 4,
    copies: 1,
    colorMode: 'B&W',
    paperSize: 'Legal',
    estimatedPrice: 12.0,
    uploadTime: '10:10 AM',
    timeAgo: '16 mins ago',
    status: 'Cancelled',
    statusReason: 'User cancelled',
    paymentStatus: 'Refunded',
    timeline: {
      waitingAt: '10:09 AM',
      cancelledAt: '10:10 AM'
    }
  }
];

let globalQueueJobs: QueueJobItem[] = [...initialQueueJobs];

export const getSharedQueueJobs = (): QueueJobItem[] => {
  return globalQueueJobs;
};

export const updateSharedQueueJobs = (newJobs: QueueJobItem[]) => {
  globalQueueJobs = newJobs;
};

export const resetSharedQueueJobs = () => {
  globalQueueJobs = [...initialQueueJobs];
};

