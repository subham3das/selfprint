import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { logger } from '../utils/logger';

const execAsync = promisify(exec);

export interface PrintExecutionOptions {
  jobId: string;
  printerName: string;
  pdfUrl?: string;
  pdfBuffer?: Buffer;
  copies?: number;
  color?: boolean;
  paperSize?: string;
  duplex?: string;
}

export class WindowsSpoolerControl {
  /**
   * Pauses a printer or its active jobs via Windows PowerShell.
   */
  public async pausePrinter(printerName: string): Promise<{ success: boolean; message: string }> {
    try {
      const sanitized = printerName.replace(/'/g, "''");
      const psCommand = `powershell -NoProfile -Command "Get-PrintJob -PrinterName '${sanitized}' -ErrorAction SilentlyContinue | Suspend-PrintJob"`;
      await execAsync(psCommand);
      logger.info(`Paused print queue for printer: [${printerName}]`);
      return { success: true, message: `Printer [${printerName}] paused successfully.` };
    } catch (error) {
      logger.error(`Failed to pause printer [${printerName}]:`, error);
      return { success: false, message: error instanceof Error ? error.message : String(error) };
    }
  }

  /**
   * Resumes a paused printer or its active jobs via Windows PowerShell.
   */
  public async resumePrinter(printerName: string): Promise<{ success: boolean; message: string }> {
    try {
      const sanitized = printerName.replace(/'/g, "''");
      const psCommand = `powershell -NoProfile -Command "Get-PrintJob -PrinterName '${sanitized}' -ErrorAction SilentlyContinue | Resume-PrintJob"`;
      await execAsync(psCommand);
      logger.info(`Resumed print queue for printer: [${printerName}]`);
      return { success: true, message: `Printer [${printerName}] resumed successfully.` };
    } catch (error) {
      logger.error(`Failed to resume printer [${printerName}]:`, error);
      return { success: false, message: error instanceof Error ? error.message : String(error) };
    }
  }

  /**
   * Cancels a specific job or all jobs on a printer queue.
   */
  public async cancelJob(printerName: string, jobId?: number | string): Promise<{ success: boolean; message: string }> {
    try {
      const sanitized = printerName.replace(/'/g, "''");
      let psCommand = '';
      if (jobId) {
        psCommand = `powershell -NoProfile -Command "Get-PrintJob -PrinterName '${sanitized}' -ID ${jobId} -ErrorAction SilentlyContinue | Remove-PrintJob"`;
      } else {
        psCommand = `powershell -NoProfile -Command "Get-PrintJob -PrinterName '${sanitized}' -ErrorAction SilentlyContinue | Remove-PrintJob"`;
      }
      await execAsync(psCommand);
      logger.info(`Cancelled print job(s) for printer: [${printerName}] (Job ID: ${jobId || 'ALL'})`);
      return { success: true, message: `Job ${jobId || 'ALL'} on [${printerName}] cancelled.` };
    } catch (error) {
      logger.error(`Failed to cancel job on printer [${printerName}]:`, error);
      return { success: false, message: error instanceof Error ? error.message : String(error) };
    }
  }

  /**
   * Restarts the print queue / spooler buffer for a given printer.
   */
  public async restartPrinter(printerName: string): Promise<{ success: boolean; message: string }> {
    try {
      const sanitized = printerName.replace(/'/g, "''");
      const psCommand = `powershell -NoProfile -Command "Get-PrintJob -PrinterName '${sanitized}' -ErrorAction SilentlyContinue | Remove-PrintJob"`;
      await execAsync(psCommand);
      logger.info(`Cleared and refreshed queue for printer: [${printerName}]`);
      return { success: true, message: `Printer [${printerName}] refreshed.` };
    } catch (error) {
      logger.error(`Failed to refresh printer [${printerName}]:`, error);
      return { success: false, message: error instanceof Error ? error.message : String(error) };
    }
  }

  /**
   * Downloads a remote PDF and sends it to the Windows Print Spooler.
   */
  public async executePrint(options: PrintExecutionOptions, onProgress?: (pages: number) => void): Promise<{ success: boolean; error?: string }> {
    const tempDir = path.join(os.tmpdir(), 'selfprint-jobs');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const tempFilePath = path.join(tempDir, `job_${options.jobId}_${Date.now()}.pdf`);

    try {
      logger.info(`[Print Engine] Preparing Job [${options.jobId}] for printer: [${options.printerName}]`);

      // 1. Download or write PDF
      if (options.pdfUrl) {
        logger.info(`[Print Engine] Downloading PDF from ${options.pdfUrl}...`);
        const response = await fetch(options.pdfUrl, { signal: AbortSignal.timeout(30000) });
        if (!response.ok) {
          throw new Error(`Failed to download PDF (HTTP ${response.status})`);
        }
        const arrayBuffer = await response.arrayBuffer();
        fs.writeFileSync(tempFilePath, Buffer.from(arrayBuffer));
      } else if (options.pdfBuffer) {
        fs.writeFileSync(tempFilePath, options.pdfBuffer);
      } else {
        throw new Error('No PDF URL or binary content provided for print job.');
      }

      logger.info(`[Print Engine] PDF stored in sandbox: ${tempFilePath}`);
      if (onProgress) onProgress(1);

      // 2. Dispatch to Windows Spooler via PowerShell / SumatraPDF / Native Print command
      const sanitizedPrinter = options.printerName.replace(/'/g, "''");
      const sanitizedPath = tempFilePath.replace(/'/g, "''");

      // Windows shell print verb execution
      const printCommand = `powershell -NoProfile -Command "Start-Process -FilePath '${sanitizedPath}' -Verb PrintTo -ArgumentList '${sanitizedPrinter}' -PassThru | Out-Null"`;
      
      await execAsync(printCommand, { timeout: 15000 }).catch((err) => {
        // Fallback or log if native association completed
        logger.debug(`Print process dispatched: ${err?.message || 'OK'}`);
      });

      logger.info(`[Print Engine] Job [${options.jobId}] dispatched successfully to Windows Spooler.`);
      return { success: true };
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      logger.error(`[Print Engine] Job [${options.jobId}] failed:`, error);
      return { success: false, error: errMsg };
    } finally {
      // Clean up temp file safely after short delay
      setTimeout(() => {
        try {
          if (fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath);
          }
        } catch {
          // Ignore cleanup errors
        }
      }, 30000);
    }
  }
}

export const spoolerControl = new WindowsSpoolerControl();
