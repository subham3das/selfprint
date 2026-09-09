import { PrinterStatus } from './types';
import { printerCache } from './printerCache';
import { detectPrinters } from './detectPrinters';

/**
 * Evaluates Windows printer status based on WMI Win32_Printer flags and state codes.
 */
export function mapPrinterStatus(raw: {
  WorkOffline?: boolean;
  PrinterStatus?: number;
  ExtendedPrinterStatus?: number;
  DetectedErrorState?: number;
  PrinterState?: number;
}): { status: PrinterStatus; isOnline: boolean } {
  // 1. Explicit WorkOffline flag
  if (raw.WorkOffline === true) {
    return { status: 'OFFLINE', isOnline: false };
  }

  const errorState = raw.DetectedErrorState ?? 0;
  const pState = raw.PrinterState ?? 0;
  const pStatus = raw.PrinterStatus ?? 3;
  const extStatus = raw.ExtendedPrinterStatus ?? 2;

  // 2. Hardware Paper Jam
  if (errorState === 5 || extStatus === 5 || (pState & 8) !== 0) {
    return { status: 'PAPER_JAM', isOnline: false };
  }

  // 3. Out of Paper
  if (errorState === 4 || extStatus === 4 || (pState & 16) !== 0) {
    return { status: 'OUT_OF_PAPER', isOnline: false };
  }

  // 4. Low Toner / No Toner
  if (errorState === 11 || errorState === 12 || extStatus === 6 || (pState & 131072) !== 0 || (pState & 262144) !== 0) {
    return { status: 'LOW_TONER', isOnline: true };
  }

  // 5. Paused
  if (pStatus === 6 || (pState & 1) !== 0) {
    return { status: 'PAUSED', isOnline: true };
  }

  // 6. Currently Printing / Processing
  if (pStatus === 4 || (pState & 1024) !== 0 || (pState & 16384) !== 0) {
    return { status: 'PRINTING', isOnline: true };
  }

  // 7. General Error / Offline Flags
  if (errorState === 8 || extStatus === 7 || pStatus === 7 || (pState & 128) !== 0) {
    return { status: 'OFFLINE', isOnline: false };
  }

  if (errorState === 1 || errorState === 9 || errorState === 10 || (pState & 2) !== 0 || (pState & 4194304) !== 0) {
    return { status: 'ERROR', isOnline: false };
  }

  // 8. Normal Idle / Online
  if (pStatus === 3 || pStatus === 1 || extStatus === 2 || extStatus === 3) {
    return { status: 'ONLINE', isOnline: true };
  }

  if (pStatus === 2) {
    return { status: 'UNKNOWN', isOnline: false };
  }

  return { status: 'ONLINE', isOnline: true };
}

/**
 * Returns current status of a specific printer by name or ID.
 */
export async function getPrinterStatus(printerName?: string): Promise<PrinterStatus> {
  if (!printerName) return 'UNKNOWN';
  let printer = printerCache.getByName(printerName) || printerCache.getById(printerName);
  if (!printer) {
    const fresh = await detectPrinters();
    printerCache.update(fresh);
    printer = printerCache.getByName(printerName) || printerCache.getById(printerName);
  }
  return printer ? printer.status : 'OFFLINE';
}
