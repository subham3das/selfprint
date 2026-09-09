import { exec } from 'child_process';
import { promisify } from 'util';
import { printerCache } from './printerCache';
import { jobDownloader } from './jobDownloader';
import { printHistory } from './printHistory';
import { spoolerWatcher } from './spoolerWatcher';
import { printLogger } from '../utils/printLogger';
import { logger } from '../utils/logger';
import {
  PrintJobOptions,
  PrintJobProgress,
  PrintJobStatus,
  Printer
} from './types';

const execAsync = promisify(exec);

export type JobStatusCallback = (progress: PrintJobProgress) => void;

export class PrintJobExecutor {
  private activeJobs: Map<string, { cancel: () => void }> = new Map();

  /**
   * Dispatches a live progress update to listeners and records to history.
   */
  private emitStatus(
    options: PrintJobOptions,
    status: PrintJobStatus,
    targetPrinterName: string,
    details?: { currentPage?: number; totalPages?: number; error?: string },
    onStatusUpdate?: JobStatusCallback
  ): void {
    const progress: PrintJobProgress = {
      jobId: options.jobId,
      status,
      printerName: targetPrinterName,
      currentPage: details?.currentPage,
      totalPages: details?.totalPages,
      error: details?.error,
      timestamp: new Date().toISOString()
    };

    printHistory.updateStatus(options.jobId, status, details?.error, details?.totalPages);

    if (onStatusUpdate) {
      try {
        onStatusUpdate(progress);
      } catch (err) {
        logger.error('Error executing job status callback:', err);
      }
    }
  }

  /**
   * Finds the target printer on this Windows machine.
   */
  private resolvePrinter(options: PrintJobOptions): Printer | null {
    if (options.printerId) {
      const p = printerCache.getById(options.printerId);
      if (p) return p;
    }

    if (options.printerName) {
      const p = printerCache.getByName(options.printerName);
      if (p) return p;
    }

    // Default printer fallback
    return printerCache.getDefault() || null;
  }

  /**
   * Executes the complete end-to-end print pipeline.
   */
  public async execute(options: PrintJobOptions, onStatusUpdate?: JobStatusCallback): Promise<{ success: boolean; error?: string }> {
    const startTime = Date.now();
    const copies = options.copies || 1;
    const timeoutMs = options.timeoutMs || 90000; // 90-second timeout
    let targetPrinterName = options.printerName || 'Default';

    printLogger.jobReceived(options.jobId, targetPrinterName, options.fileUrl);

    // 1. Status: QUEUED
    this.emitStatus(options, 'QUEUED', targetPrinterName, undefined, onStatusUpdate);
    printHistory.recordStart(options.jobId, targetPrinterName, copies);

    // 2. Validate Target Printer
    const printer = this.resolvePrinter(options);
    if (!printer) {
      const errMsg = `Target printer "${targetPrinterName}" is not installed on this computer.`;
      printLogger.printFailed(options.jobId, targetPrinterName, errMsg);
      this.emitStatus(options, 'FAILED', targetPrinterName, { error: errMsg }, onStatusUpdate);
      return { success: false, error: errMsg };
    }

    targetPrinterName = printer.name;

    // 3. Validate Printer Online Status
    if (!printer.isOnline || printer.status === 'OFFLINE' || printer.status === 'ERROR') {
      const errMsg = `Printer "${printer.name}" is currently ${printer.status}.`;
      printLogger.printerOffline(options.jobId, printer.name, printer.status);
      this.emitStatus(options, 'FAILED', printer.name, { error: errMsg }, onStatusUpdate);
      return { success: false, error: errMsg };
    }

    if (printer.status === 'OUT_OF_PAPER') {
      const errMsg = `Printer "${printer.name}" is out of paper.`;
      printLogger.printFailed(options.jobId, printer.name, errMsg);
      this.emitStatus(options, 'FAILED', printer.name, { error: errMsg }, onStatusUpdate);
      return { success: false, error: errMsg };
    }

    if (printer.status === 'PAPER_JAM') {
      const errMsg = `Printer "${printer.name}" has a paper jam.`;
      printLogger.printFailed(options.jobId, printer.name, errMsg);
      this.emitStatus(options, 'FAILED', printer.name, { error: errMsg }, onStatusUpdate);
      return { success: false, error: errMsg };
    }

    // 4. Status: DOWNLOADING
    this.emitStatus(options, 'DOWNLOADING', printer.name, undefined, onStatusUpdate);

    const downloadResult = await jobDownloader.downloadFile(options.jobId, options.fileUrl, options.checksum);
    if (!downloadResult.success || !downloadResult.filePath) {
      const errMsg = downloadResult.error || 'Failed to download print file.';
      this.emitStatus(options, 'FAILED', printer.name, { error: errMsg }, onStatusUpdate);
      return { success: false, error: errMsg };
    }

    const totalPages = downloadResult.totalPages || 1;

    // 5. Status: READY
    this.emitStatus(options, 'READY', printer.name, { totalPages }, onStatusUpdate);

    // 6. Status: PRINTING
    this.emitStatus(options, 'PRINTING', printer.name, { totalPages, currentPage: 1 }, onStatusUpdate);
    printLogger.printStarted(options.jobId, printer.name, copies);

    // Cancellation hook
    let isCancelled = false;
    this.activeJobs.set(options.jobId, {
      cancel: () => {
        isCancelled = true;
      }
    });

    try {
      // Build PowerShell Native Spooler Command
      const sanitizedPrinter = printer.name.replace(/'/g, "''");
      const sanitizedFilePath = downloadResult.filePath.replace(/'/g, "''");

      // Loop for multi-copy support if needed
      for (let c = 1; c <= copies; c++) {
        if (isCancelled) {
          throw new Error('Print job cancelled by operator.');
        }

        const printCmd = `powershell -NoProfile -Command "$ErrorActionPreference='Stop'; Start-Process -FilePath '${sanitizedFilePath}' -Verb PrintTo -ArgumentList '${sanitizedPrinter}' -PassThru | Out-Null"`;

        await Promise.race([
          execAsync(printCmd),
          new Promise((_, reject) =>
            setTimeout(() => {
              printLogger.jobTimeout(options.jobId, printer.name, timeoutMs);
              reject(new Error(`Print execution timed out after ${timeoutMs / 1000}s`));
            }, timeoutMs)
          )
        ]);

        // Stream page progress
        for (let p = 1; p <= totalPages; p++) {
          printLogger.pagePrinted(options.jobId, p, totalPages);
          this.emitStatus(options, 'PAGE_PROGRESS', printer.name, { currentPage: p, totalPages }, onStatusUpdate);
        }
      }

      // Check active spooler state
      await spoolerWatcher.check();

      const durationMs = Date.now() - startTime;
      printLogger.printFinished(options.jobId, printer.name, durationMs);

      // 7. Status: COMPLETED
      this.emitStatus(options, 'COMPLETED', printer.name, { totalPages, currentPage: totalPages }, onStatusUpdate);
      return { success: true };
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);

      if (isCancelled || errMsg.toLowerCase().includes('cancelled')) {
        printLogger.jobCancelled(options.jobId, printer.name);
        this.emitStatus(options, 'CANCELLED', printer.name, { error: 'Job was cancelled' }, onStatusUpdate);
      } else {
        printLogger.printFailed(options.jobId, printer.name, errMsg);
        this.emitStatus(options, 'FAILED', printer.name, { error: errMsg }, onStatusUpdate);
      }

      return { success: false, error: errMsg };
    } finally {
      this.activeJobs.delete(options.jobId);
      // Auto-delete PDF after brief delay
      setTimeout(() => {
        jobDownloader.cleanup(options.jobId);
      }, 10000);
    }
  }

  /**
   * Cancels an active in-flight print job.
   */
  public cancel(jobId: string): boolean {
    const active = this.activeJobs.get(jobId);
    if (active) {
      active.cancel();
      this.activeJobs.delete(jobId);
      return true;
    }
    return false;
  }
}

export const printJobExecutor = new PrintJobExecutor();
