import { apiClient } from '@/lib/axios';
import { QueueJobItem } from '../types/queue.types';

export interface FetchQueueParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  paperSize?: string;
  colorMode?: string;
  sortBy?: string;
}

export interface FetchQueueResponse {
  jobs: QueueJobItem[];
  total: number;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const storeQueueService = {
  /**
   * Fetches real live print queue from MongoDB
   */
  async fetchQueue(params?: FetchQueueParams): Promise<FetchQueueResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set('page', String(params.page));
    if (params?.limit) queryParams.set('limit', String(params.limit));
    if (params?.status && params.status !== 'All' && params.status !== 'All Jobs') {
      queryParams.set('status', params.status);
    }
    if (params?.search && params.search.trim()) {
      queryParams.set('search', params.search.trim());
    }
    if (params?.paperSize && params.paperSize !== 'All') {
      queryParams.set('paperSize', params.paperSize);
    }
    if (params?.colorMode && params.colorMode !== 'All') {
      queryParams.set('colorMode', params.colorMode);
    }
    if (params?.sortBy) {
      queryParams.set('sortBy', params.sortBy);
    }

    const res = await apiClient.get(`/store/dashboard/queue?${queryParams.toString()}`);
    const data = res.data?.data;
    const rawJobs = data?.jobs || [];

    const jobs: QueueJobItem[] = rawJobs.map((j: any) => ({
      id: j.id || j._id,
      jobCode: j.jobNumber || j.jobCode || '#000',
      fullJobId: j.id || j._id,
      customerName: j.customerName || 'Guest',
      customerPhone: j.customerPhone,
      fileName: j.fileName || 'document.pdf',
      fileSize: j.fileSize || '—',
      fileType: 'pdf',
      pages: j.pages || j.totalPages || 1,
      copies: j.copies || 1,
      colorMode: j.colorMode === 'Color' || j.printType === 'COLOR' || j.printType === 'Color' ? 'Color' : 'B&W',
      paperSize: j.paperSize || 'A4',
      estimatedPrice: j.estimatedPrice ?? j.price ?? 0,
      uploadTime: j.uploadTime || j.timeAgo || 'Just now',
      timeAgo: j.timeAgo || 'Just now',
      status: j.status || 'Waiting',
      paymentStatus: (j.paymentStatus === 'Pending' || j.paymentStatus === 'PENDING') ? 'Pending' : 'Paid',
      currentPrintingPage: j.status === 'Printing' ? (j.currentPrintingPage || 1) : undefined,
      progressPercent: j.status === 'Printing' ? (j.progressPercent || 15) : undefined,
      timeline: {
        waitingAt: j.uploadTime || '—',
        printingAt: j.status === 'Printing' || j.status === 'Completed' ? j.uploadTime : undefined,
        completedAt: j.status === 'Completed' ? j.uploadTime : undefined
      }
    }));

    return {
      jobs,
      total: data?.total ?? jobs.length,
      pagination: data?.pagination ?? {
        page: params?.page || 1,
        limit: params?.limit || 10,
        total: data?.total ?? jobs.length,
        totalPages: Math.ceil((data?.total ?? jobs.length) / (params?.limit || 10)) || 1
      }
    };
  },

  /**
   * Updates job status in MongoDB (e.g. Waiting -> Printing -> Completed / Cancelled)
   */
  async updateJobStatus(jobId: string, status: string): Promise<any> {
    const res = await apiClient.patch(`/orders/${jobId}/status`, { status });
    return res.data?.data?.job;
  },

  /**
   * Deletes / cancels a print job from MongoDB queue
   */
  async deleteJob(jobId: string): Promise<void> {
    await apiClient.delete(`/orders/${jobId}`);
  },

  /**
   * Clears all completed print jobs for the store
   */
  async clearCompleted(): Promise<void> {
    await apiClient.post('/orders/clear-completed');
  },

  /**
   * Fetches single print job details
   */
  async getJobDetails(jobId: string): Promise<any> {
    const res = await apiClient.get(`/orders/${jobId}`);
    return res.data?.data?.job;
  }
};
