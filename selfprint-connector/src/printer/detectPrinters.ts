import { exec } from 'child_process';
import { promisify } from 'util';
import { IPrinterDetector, Printer } from './types';
import { mapRawToPrinter, createSelfPrintVirtualPrinter, RawPrinterData } from './printerMapper';
import { connectorStore } from '../storage/connectorStore';
import { logger } from '../utils/logger';

const execAsync = promisify(exec);

export class WindowsPrinterDetector implements IPrinterDetector {
  /**
   * Discovers all Windows installed printers using WMI Win32_Printer and converts them to unified Printer entities.
   */
  public async detectPrinters(): Promise<Printer[]> {
    const startTime = Date.now();
    const isTestMode = connectorStore.isTestMode();

    try {
      // Single compact PowerShell query combining Win32_Printer with quick attributes
      const psCommand = `powershell -NoProfile -Command "$ErrorActionPreference='SilentlyContinue'; Get-CimInstance -ClassName Win32_Printer | Select-Object Name, DeviceID, DriverName, PortName, Location, Comment, Default, Network, Shared, ShareName, PrinterStatus, ExtendedPrinterStatus, DetectedErrorState, WorkOffline, PrinterState, HorizontalResolution, VerticalResolution, CapabilityDescriptions, PaperSizesSupported, Direct | ConvertTo-Json -Compress"`;

      const { stdout } = await execAsync(psCommand, {
        maxBuffer: 10 * 1024 * 1024,
        timeout: 8000
      });

      const trimmed = stdout.trim();
      if (!trimmed) {
        return [];
      }

      let parsed: RawPrinterData | RawPrinterData[] = JSON.parse(trimmed);
      if (!Array.isArray(parsed)) {
        parsed = [parsed];
      }

      const printerMap: Map<string, Printer> = new Map();

      for (const raw of parsed) {
        const printer = await mapRawToPrinter(raw, isTestMode);
        if (printer && !printerMap.has(printer.id)) {
          printerMap.set(printer.id, printer);
          if (printer.isVirtual) {
            logger.info(`[TestMode] Virtual printer detected: ${printer.name}`);
          }
        }
      }

      // If Test Mode is ON and no physical or OS printer exists, auto-inject SelfPrint Virtual Printer
      if (isTestMode && printerMap.size === 0) {
        const virtualPrinter = createSelfPrintVirtualPrinter();
        printerMap.set(virtualPrinter.id, virtualPrinter);
        logger.info('[VirtualPrinter] Created');
        logger.info(`[TestMode] Virtual printer detected: ${virtualPrinter.name}`);
      }

      const printers = Array.from(printerMap.values());
      const durationMs = Date.now() - startTime;
      logger.debug(`Detected ${printers.length} printer(s) in ${durationMs}ms (TestMode: ${isTestMode ? 'ON' : 'OFF'}).`);

      return printers;
    } catch (error) {
      logger.error('Failed to execute Windows printer detection:', error);
      return [];
    }
  }
}

export const windowsPrinterDetector = new WindowsPrinterDetector();

export async function detectPrinters(): Promise<Printer[]> {
  return windowsPrinterDetector.detectPrinters();
}

export { detectPrinters as detectPrinter };
