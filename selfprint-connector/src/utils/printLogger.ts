import { rotatingLogger } from './rotatingLogger';

class PrintLogger {
  public jobReceived(jobId: string, printer: string, url: string): void {
    rotatingLogger.write('print', 'JOB_RECEIVED', `JobId="${jobId}" Printer="${printer}" URL="${url}"`);
  }

  public downloadStarted(jobId: string, url: string): void {
    rotatingLogger.write('print', 'DOWNLOAD_STARTED', `JobId="${jobId}" URL="${url}"`);
  }

  public downloadComplete(jobId: string, bytes: number, durationMs: number): void {
    rotatingLogger.write('print', 'DOWNLOAD_COMPLETE', `JobId="${jobId}" Bytes=${bytes} DurationMs=${durationMs}`);
  }

  public printStarted(jobId: string, printer: string, copies: number): void {
    rotatingLogger.write('print', 'PRINT_STARTED', `JobId="${jobId}" Printer="${printer}" Copies=${copies}`);
  }

  public pagePrinted(jobId: string, page: number, totalPages?: number): void {
    const totalStr = totalPages ? `/${totalPages}` : '';
    rotatingLogger.write('print', 'PAGE_PRINTED', `JobId="${jobId}" Page=${page}${totalStr}`);
  }

  public printFinished(jobId: string, printer: string, durationMs: number): void {
    rotatingLogger.write('print', 'PRINT_FINISHED', `JobId="${jobId}" Printer="${printer}" DurationMs=${durationMs}`);
  }

  public printFailed(jobId: string, printer: string, error: string): void {
    rotatingLogger.write('print', 'PRINT_FAILED', `JobId="${jobId}" Printer="${printer}" Error="${error}"`);
  }

  public jobCancelled(jobId: string, printer: string): void {
    rotatingLogger.write('print', 'JOB_CANCELLED', `JobId="${jobId}" Printer="${printer}"`);
  }

  public jobTimeout(jobId: string, printer: string, timeoutMs: number): void {
    rotatingLogger.write('print', 'JOB_TIMEOUT', `JobId="${jobId}" Printer="${printer}" TimeoutMs=${timeoutMs}`);
  }

  public printerOffline(jobId: string, printer: string, status: string): void {
    rotatingLogger.write('print', 'PRINTER_OFFLINE', `JobId="${jobId}" Printer="${printer}" Status="${status}"`);
  }
}

export const printLogger = new PrintLogger();
