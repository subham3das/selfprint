import { printerWatcher } from '../printer/watchPrinters';
import { printerCache } from '../printer/printerCache';
import { syncPrintersToBackend } from '../printer/printerSync';
import { logger } from '../utils/logger';

class SyncService {
  private isStarted = false;

  public async start(): Promise<void> {
    if (this.isStarted) return;
    this.isStarted = true;

    logger.info('Initializing Printer Synchronization Service...');

    // Initial scan and sync
    await printerWatcher.scan(true);

    // Start background watcher daemon
    printerWatcher.start();
  }

  public async forceSync(): Promise<boolean> {
    const printers = printerCache.getAll();
    return syncPrintersToBackend(printers);
  }

  public stop(): void {
    printerWatcher.stop();
    this.isStarted = false;
  }
}

export const syncService = new SyncService();
