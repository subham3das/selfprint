import { exec } from 'child_process';
import { promisify } from 'util';
import { SpoolerJobInfo } from './types';
import { logger } from '../utils/logger';

const execAsync = promisify(exec);

export type SpoolerCallback = (jobs: SpoolerJobInfo[]) => void;

class SpoolerWatcher {
  private isWatching = false;
  private timer: NodeJS.Timeout | null = null;
  private listeners: Set<SpoolerCallback> = new Set();
  private lastKnownJobs: Map<number, SpoolerJobInfo> = new Map();

  public subscribe(callback: SpoolerCallback): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Queries active print jobs on all local Windows spooler queues.
   */
  public async getActiveSpoolerJobs(): Promise<SpoolerJobInfo[]> {
    try {
      const psCommand = `powershell -NoProfile -Command "$ErrorActionPreference='SilentlyContinue'; Get-CimInstance -ClassName Win32_PrintJob | Select-Object JobId, Name, Document, JobStatus, StatusMask, TotalPages, PagesPrinted, Size, TimeSubmitted | ConvertTo-Json -Compress"`;

      const { stdout } = await execAsync(psCommand, { timeout: 4000 });
      const trimmed = stdout.trim();
      if (!trimmed) return [];

      let parsed = JSON.parse(trimmed);
      if (!Array.isArray(parsed)) {
        parsed = [parsed];
      }

      return parsed.map((item: any) => {
        // Name format is typically "PrinterName, JobID"
        const rawName = String(item.Name || '');
        const printerName = rawName.includes(',') ? rawName.split(',')[0].trim() : rawName;

        return {
          jobId: item.JobId || 0,
          printerName,
          documentName: String(item.Document || ''),
          jobStatus: String(item.JobStatus || 'PRINTING'),
          statusCode: Number(item.StatusMask || 0),
          totalPageCount: Number(item.TotalPages || 1),
          pagesPrinted: Number(item.PagesPrinted || 0),
          sizeBytes: Number(item.Size || 0),
          submittedTime: item.TimeSubmitted ? String(item.TimeSubmitted) : new Date().toISOString()
        };
      });
    } catch (error) {
      // Non-fatal if spooler query is skipped during idle
      return [];
    }
  }

  /**
   * Executes a spooler scan and notifies listeners of active jobs and progress.
   */
  public async check(): Promise<SpoolerJobInfo[]> {
    const currentJobs = await this.getActiveSpoolerJobs();
    const currentMap = new Map<number, SpoolerJobInfo>();

    for (const job of currentJobs) {
      currentMap.set(job.jobId, job);
    }

    this.lastKnownJobs = currentMap;

    for (const listener of this.listeners) {
      try {
        listener(currentJobs);
      } catch (err) {
        logger.error('Error in spooler watcher callback:', err);
      }
    }

    return currentJobs;
  }

  public start(intervalMs = 2500): void {
    if (this.isWatching) return;
    this.isWatching = true;

    this.timer = setInterval(() => {
      this.check().catch(() => {});
    }, intervalMs);
  }

  public stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.isWatching = false;
  }
}

export const spoolerWatcher = new SpoolerWatcher();
