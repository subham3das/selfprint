import fs from 'fs';
import path from 'path';
import { Printer } from '../printer/types';
import { printerCache } from '../printer/printerCache';
import { syncPrintersToBackend } from '../printer/printerSync';
import { offlineQueue } from '../queue/offlineQueue';
import { logger } from '../utils/logger';

export interface RecoveryState {
  lastPrinters: Printer[];
  lastHeartbeat: string | null;
  unsentPrinterSync: boolean;
  unfinishedJobs: string[];
}

class CrashRecoveryManager {
  private recoveryFilePath: string;
  private state: RecoveryState;

  constructor() {
    this.recoveryFilePath = path.resolve(process.cwd(), 'config', 'recovery.json');
    this.state = this.loadCheckpoint();
  }

  private loadCheckpoint(): RecoveryState {
    try {
      if (fs.existsSync(this.recoveryFilePath)) {
        const raw = fs.readFileSync(this.recoveryFilePath, 'utf8');
        return JSON.parse(raw);
      }
    } catch {
      // Fallback
    }

    return {
      lastPrinters: [],
      lastHeartbeat: null,
      unsentPrinterSync: false,
      unfinishedJobs: []
    };
  }

  public saveCheckpoint(updates: Partial<RecoveryState>): void {
    try {
      this.state = { ...this.state, ...updates };
      const dir = path.dirname(this.recoveryFilePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(this.recoveryFilePath, JSON.stringify(this.state, null, 2), 'utf8');
    } catch (err) {
      logger.error('Failed to save recovery checkpoint:', err);
    }
  }

  /**
   * Recovers state on startup and replays unsent updates.
   */
  public async performRecovery(): Promise<void> {
    logger.info('Checking for crash recovery checkpoints...');

    if (this.state.lastPrinters && this.state.lastPrinters.length > 0) {
      printerCache.update(this.state.lastPrinters);
      logger.info(`[Recovery] Restored ${this.state.lastPrinters.length} cached printer(s) from previous session.`);
    }

    if (this.state.unsentPrinterSync) {
      logger.info('[Recovery] Resyncing pending printer inventory to backend...');
      const currentPrinters = printerCache.getAll();
      const success = await syncPrintersToBackend(currentPrinters);
      if (success) {
        this.saveCheckpoint({ unsentPrinterSync: false });
      }
    }

    if (offlineQueue.getQueueLength() > 0) {
      logger.info(`[Recovery] Found ${offlineQueue.getQueueLength()} offline queued print job(s).`);
      offlineQueue.drainQueue().catch(() => {});
    }
  }
}

export const crashRecovery = new CrashRecoveryManager();
