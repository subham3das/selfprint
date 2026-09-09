import { Printer, PrinterDiff, PrinterStatus } from './types';

class PrinterCache {
  private cache: Map<string, Printer> = new Map();
  private defaultPrinterId: string | null = null;
  private isInitialized = false;

  public getAll(): Printer[] {
    return Array.from(this.cache.values());
  }

  public getById(id: string): Printer | undefined {
    return this.cache.get(id);
  }

  public getByName(name: string): Printer | undefined {
    const normalized = name.toLowerCase().trim();
    for (const printer of this.cache.values()) {
      if (printer.name.toLowerCase().trim() === normalized) {
        return printer;
      }
    }
    return undefined;
  }

  public getDefault(): Printer | undefined {
    if (this.defaultPrinterId && this.cache.has(this.defaultPrinterId)) {
      return this.cache.get(this.defaultPrinterId);
    }
    for (const printer of this.cache.values()) {
      if (printer.isDefault) {
        return printer;
      }
    }
    return this.cache.values().next().value;
  }

  /**
   * Updates the cache with a new scan and computes accurate diffs.
   */
  public update(freshPrinters: Printer[]): PrinterDiff {
    const diff: PrinterDiff = {
      added: [],
      removed: [],
      updated: [],
      statusChanged: [],
      defaultChanged: null
    };

    const freshMap = new Map<string, Printer>();
    let freshDefault: Printer | null = null;

    for (const p of freshPrinters) {
      freshMap.set(p.id, p);
      if (p.isDefault) {
        freshDefault = p;
      }
    }

    // 1. Initial hydration check
    if (!this.isInitialized) {
      this.cache = freshMap;
      this.defaultPrinterId = freshDefault ? freshDefault.id : null;
      this.isInitialized = true;
      diff.added = freshPrinters;
      return diff;
    }

    // 2. Check for Removed Printers
    for (const [id, oldPrinter] of this.cache.entries()) {
      if (!freshMap.has(id)) {
        diff.removed.push(oldPrinter);
      }
    }

    // 3. Check for Added & Updated Printers
    for (const [id, freshPrinter] of freshMap.entries()) {
      const oldPrinter = this.cache.get(id);

      if (!oldPrinter) {
        diff.added.push(freshPrinter);
      } else {
        const changes: string[] = [];

        // Status change
        if (oldPrinter.status !== freshPrinter.status) {
          changes.push(`status: ${oldPrinter.status} -> ${freshPrinter.status}`);
          diff.statusChanged.push({
            printer: freshPrinter,
            previousStatus: oldPrinter.status,
            currentStatus: freshPrinter.status
          });
        }

        if (oldPrinter.isDefault !== freshPrinter.isDefault) {
          changes.push(`isDefault: ${oldPrinter.isDefault} -> ${freshPrinter.isDefault}`);
        }

        if (oldPrinter.jobsWaiting !== freshPrinter.jobsWaiting) {
          changes.push(`jobsWaiting: ${oldPrinter.jobsWaiting} -> ${freshPrinter.jobsWaiting}`);
        }

        if (oldPrinter.portName !== freshPrinter.portName) {
          changes.push(`portName: ${oldPrinter.portName} -> ${freshPrinter.portName}`);
        }

        if (oldPrinter.ipAddress !== freshPrinter.ipAddress) {
          changes.push(`ipAddress: ${oldPrinter.ipAddress} -> ${freshPrinter.ipAddress}`);
        }

        if (changes.length > 0) {
          diff.updated.push({
            previous: oldPrinter,
            current: freshPrinter,
            changes
          });
        }
      }
    }

    // 4. Default Printer change
    const oldDefault = this.defaultPrinterId ? this.cache.get(this.defaultPrinterId) || null : null;
    const oldDefId = oldDefault ? oldDefault.id : null;
    const newDefId = freshDefault ? freshDefault.id : null;

    if (oldDefId !== newDefId) {
      diff.defaultChanged = {
        previousDefault: oldDefault,
        currentDefault: freshDefault
      };
    }

    // Commit updates to cache
    this.cache = freshMap;
    this.defaultPrinterId = freshDefault ? freshDefault.id : null;

    return diff;
  }

  public hasChanges(diff: PrinterDiff): boolean {
    return (
      diff.added.length > 0 ||
      diff.removed.length > 0 ||
      diff.updated.length > 0 ||
      diff.statusChanged.length > 0 ||
      diff.defaultChanged !== null
    );
  }
}

export const printerCache = new PrinterCache();
