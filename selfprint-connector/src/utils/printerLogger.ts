import { rotatingLogger } from './rotatingLogger';

class PrinterLogger {
  public printerDetected(printerName: string, id: string, connectionType: string): void {
    rotatingLogger.write('printer', 'PRINTER_DETECTED', `Name="${printerName}" ID="${id}" Type="${connectionType}"`);
  }

  public printerRemoved(printerName: string, id: string): void {
    rotatingLogger.write('printer', 'PRINTER_REMOVED', `Name="${printerName}" ID="${id}"`);
  }

  public printerUpdated(printerName: string, id: string, changes: string[]): void {
    rotatingLogger.write('printer', 'PRINTER_UPDATED', `Name="${printerName}" ID="${id}" Changes=[${changes.join(', ')}]`);
  }

  public printerOnline(printerName: string, id: string): void {
    rotatingLogger.write('printer', 'PRINTER_ONLINE', `Name="${printerName}" ID="${id}"`);
  }

  public printerOffline(printerName: string, id: string, reason?: string): void {
    rotatingLogger.write('printer', 'PRINTER_OFFLINE', `Name="${printerName}" ID="${id}"${reason ? ` Reason="${reason}"` : ''}`);
  }

  public backendSyncSuccess(count: number, durationMs: number): void {
    rotatingLogger.write('printer', 'BACKEND_SYNC_SUCCESS', `Synchronized ${count} printers in ${durationMs}ms`);
  }

  public backendSyncFailed(error: string): void {
    rotatingLogger.write('printer', 'BACKEND_SYNC_FAILED', `Error="${error}"`);
  }
}

export const printerLogger = new PrinterLogger();
