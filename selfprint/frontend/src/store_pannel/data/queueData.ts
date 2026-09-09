import { QueueJobItem, QueueSummaryStats } from '../types/queue.types';

export const emptyQueueSummary: QueueSummaryStats = {
  printingNow: 0,
  waitingInQueue: 0,
  completedToday: 0,
  failedToday: 0,
  cancelledToday: 0,
  totalRevenueToday: 0,
  avgWaitTimeMinutes: 0
};

export const emptyQueueJobs: QueueJobItem[] = [];
