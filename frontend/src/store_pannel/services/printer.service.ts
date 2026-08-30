import {
  DetectedPrinter,
  PrinterSetupConfig,
  PrinterErrorType
} from '../types/printerSetup.types';
import {
  MOCK_DETECTED_PRINTERS,
  DEFAULT_PRINTER_CONFIG
} from '../data/printer.mock';

const STORAGE_KEY_CONFIGURED_PRINTER = 'selfprint_configured_printer';
const STORAGE_KEY_PRINTER_CONFIG = 'selfprint_printer_config';
const STORAGE_KEY_SUPPRESS_WIZARD = 'selfprint_suppress_printer_wizard';

export const printerService = {
  /**
   * Scans system ports & network for connected printers
   */
  async detectPrinters(options?: {
    simulateError?: PrinterErrorType;
  }): Promise<DetectedPrinter[]> {
    // Simulate OS hardware discovery delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    if (options?.simulateError) {
      throw new Error(options.simulateError);
    }

    return MOCK_DETECTED_PRINTERS;
  },

  /**
   * Connects and verifies communication with a detected printer
   */
  async connectPrinter(printerId: string): Promise<{
    success: boolean;
    printer: DetectedPrinter;
  }> {
    await new Promise((resolve) => setTimeout(resolve, 800));

    const found = MOCK_DETECTED_PRINTERS.find((p) => p.id === printerId);
    if (!found) {
      throw new Error('Printer not found');
    }

    return {
      success: true,
      printer: found
    };
  },

  /**
   * Runs hardware diagnostics and sensor calibration
   */
  async calibratePrinter(_printerId: string): Promise<{
    success: boolean;
    paperStatus: string;
    tonerStatus: string;
  }> {
    await new Promise((resolve) => setTimeout(resolve, 1200));

    return {
      success: true,
      paperStatus: 'Loaded & Aligned (Tray 1)',
      tonerStatus: 'Cartridge Ready (85%)'
    };
  },

  /**
   * Sends a test print page command to the hardware spooler
   */
  async sendTestPrint(_printerId: string): Promise<{
    success: boolean;
    jobId: string;
  }> {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return {
      success: true,
      jobId: `TST-PAGE-${Date.now().toString().slice(-4)}`
    };
  },

  /**
   * Soft-restarts the local print spooler service
   */
  async restartPrinter(_printerId: string): Promise<{ success: boolean }> {
    await new Promise((resolve) => setTimeout(resolve, 1200));
    return { success: true };
  },


  /**
   * Retrieves the currently active configured printer from localStorage
   */
  getSavedPrinter(): DetectedPrinter | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_CONFIGURED_PRINTER);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  /**
   * Retrieves the saved printer setup configuration
   */
  getSavedConfig(): PrinterSetupConfig {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_PRINTER_CONFIG);
      return stored ? JSON.parse(stored) : DEFAULT_PRINTER_CONFIG;
    } catch {
      return DEFAULT_PRINTER_CONFIG;
    }
  },

  /**
   * Persists configured printer and settings into localStorage
   */
  saveConfiguredPrinter(
    printer: DetectedPrinter,
    config: PrinterSetupConfig
  ): void {
    try {
      localStorage.setItem(
        STORAGE_KEY_CONFIGURED_PRINTER,
        JSON.stringify(printer)
      );
      localStorage.setItem(STORAGE_KEY_PRINTER_CONFIG, JSON.stringify(config));
    } catch (err) {
      console.warn('LocalStorage error saving printer:', err);
    }
  },

  /**
   * Checks whether the user selected "Don't show again on this device"
   */
  isWizardSuppressed(): boolean {
    try {
      return localStorage.getItem(STORAGE_KEY_SUPPRESS_WIZARD) === 'true';
    } catch {
      return false;
    }
  },

  /**
   * Sets the "Don't show again" preference
   */
  setWizardSuppressed(suppressed: boolean): void {
    try {
      if (suppressed) {
        localStorage.setItem(STORAGE_KEY_SUPPRESS_WIZARD, 'true');
      } else {
        localStorage.removeItem(STORAGE_KEY_SUPPRESS_WIZARD);
      }
    } catch (err) {
      console.warn('LocalStorage error setting wizard suppression:', err);
    }
  }
};
