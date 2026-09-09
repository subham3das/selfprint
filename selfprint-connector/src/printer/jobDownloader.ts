import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { printLogger } from '../utils/printLogger';
import { logger } from '../utils/logger';

export interface DownloadResult {
  success: boolean;
  filePath?: string;
  fileSizeBytes?: number;
  totalPages?: number;
  error?: string;
}

export class JobDownloader {
  private tempDir: string;

  constructor() {
    this.tempDir = path.resolve(process.cwd(), 'temp', 'jobs');
    this.ensureTempDirectory();
  }

  private ensureTempDirectory(): void {
    try {
      if (!fs.existsSync(this.tempDir)) {
        fs.mkdirSync(this.tempDir, { recursive: true });
      }
    } catch (err) {
      logger.error('Failed to create temp/jobs directory:', err);
    }
  }

  /**
   * Validates whether a file is a valid PDF by inspecting magic bytes.
   */
  private validatePdfHeader(buffer: Buffer): boolean {
    if (buffer.length < 10) return false;
    const header = buffer.subarray(0, 10).toString('ascii');
    return header.includes('%PDF-');
  }

  /**
   * Fast regex page counter for standard PDF structures.
   */
  private estimatePdfPageCount(buffer: Buffer): number {
    try {
      const content = buffer.toString('latin1');
      const matches = content.match(/\/Type\s*\/Page\b/g);
      if (matches && matches.length > 0) {
        // Exclude /Pages definitions
        const pagesMatches = content.match(/\/Type\s*\/Pages\b/g) || [];
        return Math.max(1, matches.length - pagesMatches.length);
      }
      return 1;
    } catch {
      return 1;
    }
  }

  /**
   * Verifies SHA-256 or MD5 checksum if provided by backend.
   */
  private verifyChecksum(buffer: Buffer, expectedChecksum: string): boolean {
    const cleanExpected = expectedChecksum.trim().toLowerCase();
    const sha256 = crypto.createHash('sha256').update(buffer).digest('hex').toLowerCase();
    const md5 = crypto.createHash('md5').update(buffer).digest('hex').toLowerCase();
    return sha256 === cleanExpected || md5 === cleanExpected;
  }

  /**
   * Downloads a PDF file with automated retries, magic-byte validation, and checksum verification.
   */
  public async downloadFile(jobId: string, fileUrl: string, expectedChecksum?: string, maxRetries = 3): Promise<DownloadResult> {
    this.ensureTempDirectory();
    const filePath = path.join(this.tempDir, `${jobId}.pdf`);

    printLogger.downloadStarted(jobId, fileUrl);
    const startTime = Date.now();

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        logger.debug(`[Downloader] Attempt ${attempt}/${maxRetries} downloading job ${jobId} from ${fileUrl}`);

        const response = await fetch(fileUrl, {
          signal: AbortSignal.timeout(30000)
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        if (buffer.length === 0) {
          throw new Error('Downloaded file is empty (0 bytes).');
        }

        // Validate PDF structure
        if (!this.validatePdfHeader(buffer)) {
          throw new Error('Corrupted download: File header does not match valid %PDF- magic bytes.');
        }

        // Validate Checksum if supplied
        if (expectedChecksum && !this.verifyChecksum(buffer, expectedChecksum)) {
          throw new Error('Checksum validation failed: File hash does not match backend manifest.');
        }

        // Write safely to disk
        fs.writeFileSync(filePath, buffer);

        const durationMs = Date.now() - startTime;
        const totalPages = this.estimatePdfPageCount(buffer);

        printLogger.downloadComplete(jobId, buffer.length, durationMs);
        logger.info(`[Downloader] Job [${jobId}] PDF downloaded successfully (${buffer.length} bytes, ~${totalPages} pages) in ${durationMs}ms.`);

        return {
          success: true,
          filePath,
          fileSizeBytes: buffer.length,
          totalPages
        };
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : String(err);
        logger.warn(`[Downloader] Download attempt ${attempt} failed for job [${jobId}]: ${errMsg}`);

        if (attempt < maxRetries) {
          const delayMs = attempt * 1500;
          await new Promise((r) => setTimeout(r, delayMs));
        } else {
          printLogger.printFailed(jobId, 'UNKNOWN', `Download failed after ${maxRetries} attempts: ${errMsg}`);
          return {
            success: false,
            error: errMsg
          };
        }
      }
    }

    return { success: false, error: 'Max download retries exceeded' };
  }

  /**
   * Safely shreds and removes temporary print file.
   */
  public cleanup(jobId: string): void {
    const filePath = path.join(this.tempDir, `${jobId}.pdf`);
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        logger.debug(`[Downloader] Cleaned up temp file for job [${jobId}]`);
      }
    } catch (err) {
      logger.debug(`[Downloader] Temp cleanup skipped for ${jobId}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
}

export const jobDownloader = new JobDownloader();
