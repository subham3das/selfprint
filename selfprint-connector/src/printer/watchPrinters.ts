import { detectPrinters } from './detectPrinters';
import { printerCache } from './printerCache';
import { Printer, PrinterDiff } from './types';
import { logger } from '../utils/logger';
import { printerLogger } from '../utils/printerLogger';
import { broadcastPrinterDiff } from '../websocket/socket';
import { syncPrintersToBackend } from './printerSync';
import { config } from '../config/config';

export type DiffListener = (diff: PrinterDiff, allPrinters: Printer[]) => void;

class PrinterWatcher {
  private scanTimer: NodeJS.Timeout | null = null;
  private isScanning = false;
  private listeners: Set<DiffListener> = new Set();

  public subscribe(listener: DiffListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Executes a scan cycle, updates cache, emits diff events, logs state changes, and syncs with backend.
   */
  public async scan(isInitial = false): Promise<PrinterDiff> {
    if (this.isScanning) {
      logger.debug('Printer scan already in progress, skipping duplicate cycle.');
      return { added: [], removed: [], updated: [], statusChanged: [], defaultChanged: null };
    }

    this.isScanning = true;

    try {
      const freshPrinters = await detectPrinters();
      const diff = printerCache.update(freshPrinters);

      // Handle Initial Scan
      if (isInitial) {
        logger.info('Detected Printers:');
        for (const p of freshPrinters) {
          const defaultTag = p.isDefault ? ' (Default)' : '';
          const statusTag = p.status === 'ONLINE' ? '[Online]' : `[${p.status}]`;
          logger.info(`  ✓ ${p.name}${defaultTag} ${statusTag}`);
          printerLogger.printerDetected(p.name, p.id, p.connectionType);
        }

        // Trigger initial backend sync
        await syncPrintersToBackend(freshPrinters);
        return diff;
      }

      // Process and log diffs if changes detected
      if (printerCache.hasChanges(diff)) {
        logger.info('Printer hardware state changes detected.');

        // 1. Added
        for (const p of diff.added) {
          logger.info(`[Printer Added] ${p.name} (ID: ${p.id}, Connection: ${p.connectionType})`);
          printerLogger.printerDetected(p.name, p.id, p.connectionType);
        }

        // 2. Removed
        for (const p of diff.removed) {
          logger.info(`[Printer Removed] ${p.name} (ID: ${p.id})`);
          printerLogger.printerRemoved(p.name, p.id);
        }

        // 3. Updated
        for (const u of diff.updated) {
          logger.info(`[Printer Updated] ${u.current.name} (ID: ${u.current.id}) - Changes: ${u.changes.join(', ')}`);
          printerLogger.printerUpdated(u.current.name, u.current.id, u.changes);
        }

        // 4. Status Changed
        for (const sc of diff.statusChanged) {
          logger.info(`[Printer Status] ${sc.printer.name} transitioned from ${sc.previousStatus} -> ${sc.currentStatus}`);
          if (sc.currentStatus === 'ONLINE') {
            printerLogger.printerOnline(sc.printer.name, sc.printer.id);
          } else if (sc.currentStatus === 'OFFLINE') {
            printerLogger.printerOffline(sc.printer.name, sc.printer.id, 'Status changed to OFFLINE');
          }
        }

        // 5. Default Changed
        if (diff.defaultChanged) {
          const prev = diff.defaultChanged.previousDefault?.name || 'None';
          const curr = diff.defaultChanged.currentDefault?.name || 'None';
          logger.info(`[Default Printer Changed] ${prev} -> ${curr}`);
        }

        // Broadcast WebSocket Events
        broadcastPrinterDiff(diff);

        // Sync fresh printer set to Backend
        await syncPrintersToBackend(freshPrinters);

        // Notify in-process listeners
        for (const listener of this.listeners) {
          try {
            listener(diff, freshPrinters);
          } catch (err) {
            logger.error('Error in printer watcher listener callback:', err);
          }
        }
      }

      return diff;
    } catch (error) {
      logger.error('Error during printer watcher cycle:', error);
      return { added: [], removed: [], updated: [], statusChanged: [], defaultChanged: null };
    } finally {
      this.isScanning = false;
    }
  }

  /**
   * Starts the recurring background watcher interval.
   */
  public start(): void {
    if (this.scanTimer) {
      clearInterval(this.scanTimer);
    }

    const interval = config.printerScanIntervalMs || 30000;
    logger.info(`Starting Printer Watcher Daemon (Interval: ${interval / 1000}s)...`);

    this.scanTimer = setInterval(() => {
      this.scan(false);
    }, interval);
  }

  /**
   * Stops the background watcher.
   */
  public stop(): void {
    if (this.scanTimer) {
      clearInterval(this.scanTimer);
      this.scanTimer = null;
    }
  }
}

export const printerWatcher = new PrinterWatcher();
