import { PrintHistoryItem, PrintJobStatus } from './types';

class PrintHistoryStore {
  private maxItems = 100;
  private history: PrintHistoryItem[] = [];

  public recordStart(jobId: string, printer: string, copies = 1, pages = 1): PrintHistoryItem {
    const existingIndex = this.history.findIndex((h) => h.jobId === jobId);
    const item: PrintHistoryItem = {
      jobId,
      printer,
      startedAt: new Date().toISOString(),
      completedAt: null,
      durationMs: null,
      pages,
      copies,
      status: 'QUEUED',
      error: null
    };

    if (existingIndex >= 0) {
      this.history[existingIndex] = item;
    } else {
      this.history.unshift(item);
      if (this.history.length > this.maxItems) {
        this.history.pop();
      }
    }

    return item;
  }

  public updateStatus(jobId: string, status: PrintJobStatus, error?: string, pages?: number): void {
    const item = this.history.find((h) => h.jobId === jobId);
    if (!item) return;

    item.status = status;
    if (pages && pages > item.pages) {
      item.pages = pages;
    }

    if (status === 'COMPLETED' || status === 'FAILED' || status === 'CANCELLED') {
      item.completedAt = new Date().toISOString();
      item.durationMs = Date.now() - new Date(item.startedAt).getTime();
      if (error) {
        item.error = error;
      }
    }
  }

  public getAll(): PrintHistoryItem[] {
    return [...this.history];
  }

  public getById(jobId: string): PrintHistoryItem | undefined {
    return this.history.find((h) => h.jobId === jobId);
  }
}

export const printHistory = new PrintHistoryStore();
