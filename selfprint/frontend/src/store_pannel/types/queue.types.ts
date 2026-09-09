export type QueueJobStatus =
  | 'Waiting'
  | 'Printing'
  | 'Completed'
  | 'Cancelled'
  | 'Failed';

export type QueueColorMode = 'B&W' | 'Color';
export type QueuePaperSize = 'A4' | 'A3' | 'Letter' | 'Legal';
export type QueueSortOption =
  | 'newest'
  | 'oldest'
  | 'highest_pages'
  | 'lowest_pages'
  | 'price_high'
  | 'price_low';

export interface QueueJobItem {
  id: string;
  jobCode: string; // e.g. "#102"
  fullJobId: string; // e.g. "SP-20250812-102"
  customerName: string;
  customerPhone?: string;
  fileName: string;
  fileSize: string; // e.g. "1.2 MB"
  fileType: 'pdf' | 'docx' | 'image';
  pages: number;
  copies: number;
  colorMode: QueueColorMode;
  paperSize: QueuePaperSize;
  estimatedPrice: number; // e.g. 24
  uploadTime: string; // e.g. "10:24 AM"
  timeAgo: string; // e.g. "2 mins ago"
  estimatedFinishTime?: string; // e.g. "10:27 AM"
  status: QueueJobStatus;
  queueNumber?: number; // e.g. 1, 2
  statusReason?: string; // e.g. "In queue #1", "Paper jam", "User cancelled"
  paymentStatus: 'Paid' | 'Pending' | 'Refunded';
  currentPrintingPage?: number; // e.g. 1
  progressPercent?: number; // e.g. 8
  timeline: {
    waitingAt?: string;
    printingAt?: string;
    completedAt?: string;
    failedAt?: string;
    cancelledAt?: string;
  };
}

export interface QueueSummaryStats {
  printingNow: number;
  waitingInQueue: number;
  completedToday: number;
  failedToday: number;
  cancelledToday: number;
  totalRevenueToday: number;
  avgWaitTimeMinutes: number;
}

export interface QueueFilters {
  searchQuery: string;
  statusTab: 'All Jobs' | QueueJobStatus;
  paperSize?: QueuePaperSize | 'All';
  colorMode?: QueueColorMode | 'All';
  sortBy: QueueSortOption;
}
