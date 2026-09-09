import fs from 'fs';
import path from 'path';
import { PrintJobOptions } from '../printer/types';
import { printJobExecutor } from '../printer/jobExecutor';
import { logger } from '../utils/logger';

class OfflineQueueManager {
  private queueFile: string;
  private queue: PrintJobOptions[] = [];
  private isDraining = false;

  constructor() {
    this.queueFile = path.resolve(process.cwd(), 'config', 'offlineQueue.json');
    this.loadQueue();
  }

  private loadQueue(): void {
    try {
      if (fs.existsSync(this.queueFile)) {
        const raw = fs.readFileSync(this.queueFile, 'utf8');
        this.queue = JSON.parse(raw);
        logger.info(`Loaded ${this.queue.length} offline queued job(s).`);
      }
    } catch {
      this.queue = [];
    }
  }

  private saveQueue(): void {
    try {
      const dir = path.dirname(this.queueFile);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(this.queueFile, JSON.stringify(this.queue, null, 2), 'utf8');
    } catch (err) {
      logger.error('Failed to save offlineQueue.json:', err);
    }
  }

  public enqueue(job: PrintJobOptions): void {
    const exists = this.queue.some((j) => j.jobId === job.jobId);
    if (!exists) {
      this.queue.push(job);
      this.saveQueue();
      logger.warn(`[Offline Queue] Backend offline. Enqueued job [${job.jobId}] for delayed execution.`);
    }
  }

  public getQueueLength(): number {
    return this.queue.length;
  }

  /**
   * Automatically executes all pending offline jobs once connectivity is restored.
   */
  public async drainQueue(): Promise<void> {
    if (this.isDraining || this.queue.length === 0) return;
    this.isDraining = true;

    logger.info(`[Offline Queue] Reconnection detected. Draining ${this.queue.length} pending job(s)...`);

    while (this.queue.length > 0) {
      const job = this.queue.shift();
      if (job) {
        this.saveQueue();
        try {
          logger.info(`[Offline Queue] Executing queued job [${job.jobId}]...`);
          await printJobExecutor.execute(job);
        } catch (err) {
          logger.error(`[Offline Queue] Failed to process queued job [${job.jobId}]:`, err);
        }
      }
    }

    this.isDraining = false;
  }
}

export const offlineQueue = new OfflineQueueManager();
