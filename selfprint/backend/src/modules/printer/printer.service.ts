import mongoose from 'mongoose';
import { printerRepository, PrinterRepository } from './printer.repository';
import { SavePrinterDto, PairHostDto, HostHeartbeatDto, PrinterResponseDto } from './printer.types';
import { PrinterModel, IPrinter, PrinterStatusType } from '../../models/printer.model';
import { HostModel } from '../../models/host.model';
import { StoreModel } from '../../models/store.model';
import { ConnectorModel } from '../../models/connector.model';
import { socketManager } from '../../socket';
import { logger } from '../../utils';
import { NotFoundError } from '../../errors';

export class PrinterService {
  constructor(private readonly repository: PrinterRepository = printerRepository) {}

  /**
   * Retrieves all printers for a store
   */
  public async getStorePrinters(storeId: string): Promise<PrinterResponseDto[]> {
    const printers = await this.repository.findPrintersByStore(storeId);
    return printers.map(p => this.formatPrinterDto(p));
  }

  /**
   * Retrieves the default printer for a store
   */
  public async getDefaultPrinter(storeId: string): Promise<PrinterResponseDto | null> {
    const printer = await this.repository.findDefaultPrinter(storeId);
    return printer ? this.formatPrinterDto(printer) : null;
  }

  /**
   * Saves or configures a physical printer
   */
  public async savePrinter(storeId: string, data: SavePrinterDto): Promise<PrinterResponseDto> {
    const saved = await this.repository.savePrinter(storeId, data);
    return this.formatPrinterDto(saved);
  }

  /**
   * Updates printer status
   */
  public async updatePrinterStatus(
    storeId: string,
    printerId: string,
    status: PrinterStatusType
  ): Promise<PrinterResponseDto> {
    const updated = await this.repository.updatePrinterStatus(storeId, printerId, status);
    if (!updated) {
      throw new NotFoundError(`Printer ${printerId} not found for this store`);
    }
    return this.formatPrinterDto(updated);
  }

  /**
   * Deletes a printer
   */
  public async deletePrinter(storeId: string, printerId: string): Promise<boolean> {
    const success = await this.repository.deletePrinter(storeId, printerId);
    if (!success) {
      throw new NotFoundError(`Printer ${printerId} not found`);
    }
    return true;
  }

  /**
   * Pairs a desktop host bridge with the store
   */
  public async pairHost(storeId: string, data: PairHostDto) {
    const host = await this.repository.upsertHost(storeId, data);
    return {
      success: true,
      hostId: host.hostId,
      deviceName: host.deviceName,
      status: host.status
    };
  }

  /**
   * Ingests telemetry heartbeat from desktop host bridge
   */
  public async processHeartbeat(storeId: string, data: HostHeartbeatDto) {
    await this.repository.updateHostHeartbeat(storeId, data.hostId, data.printers);
    return {
      acknowledged: true,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Synchronizes detected physical printers from desktop connector into MongoDB
   * and broadcasts realtime Socket.IO updates to the store's dashboard.
   */
  public async syncPrinters(
    storeId: string,
    connectorId: string,
    machineId: string,
    rawPrinters: any[]
  ): Promise<{ syncedCount: number; printers: PrinterResponseDto[] }> {
    let targetStoreId = storeId;
    if (!targetStoreId && connectorId) {
      const host = await HostModel.findOne({ hostId: connectorId }).lean();
      if (host) {
        targetStoreId = host.storeId.toString();
      } else {
        const store = await StoreModel.findOne().lean();
        if (store) {
          targetStoreId = store._id.toString();
        }
      }
    }

    if (!targetStoreId) {
      return { syncedCount: 0, printers: [] };
    }

    const sId = new mongoose.Types.ObjectId(targetStoreId);
    const validPrinters = Array.isArray(rawPrinters) ? rawPrinters : [];
    const syncedPrinters: IPrinter[] = [];

    // If 0 printers detected on the host machine, mark any previous store printers as OFFLINE
    if (validPrinters.length === 0) {
      await PrinterModel.updateMany({ storeId: sId }, { $set: { status: 'OFFLINE' } });
      await ConnectorModel.updateMany({ storeId: sId }, { $set: { connectedPrinters: 0, physicalPrinters: [] } });
    } else {
      for (let i = 0; i < validPrinters.length; i++) {
        const p = validPrinters[i];
        const printerName = p.name || p.printerName;
        if (!printerName) continue;

        const deviceId = p.id || p.deviceId || `prn_${printerName}`;
        const isDefault = p.isDefault ?? (i === 0);

        const saved = await PrinterModel.findOneAndUpdate(
          { storeId: sId, $or: [{ deviceId }, { printerName }] },
          {
            $set: {
              storeId: sId,
              deviceId,
              printerName,
              model: p.model || printerName,
              brand: p.brand || p.manufacturer || 'Generic',
              driver: p.driver || p.driverName || 'Generic Driver',
              port: p.port || p.portName || 'USB001',
              connectionType: (p.connectionType || p.connection || 'USB').toUpperCase(),
              status: p.status === 'Offline' ? 'OFFLINE' : 'ONLINE',
              isDefault,
              paperLevel: p.paperLevel ?? 90,
              tonerLevel: typeof p.inkLevels?.black === 'number' ? p.inkLevels.black : (p.tonerLevel ?? 85),
              capabilities: {
                isColor: Boolean(p.isColor || p.colorSupport),
                isDuplex: Boolean(p.isDuplexSupported || p.duplexSupport),
                isAutoCut: Boolean(p.isAutoCutSupported),
                paperSizes: Array.isArray(p.paperSizes) ? p.paperSizes : ['A4', 'Letter']
              },
              lastHeartbeat: new Date(),
              lastSeen: new Date()
            }
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        if (saved) {
          syncedPrinters.push(saved);
        }
      }

      await ConnectorModel.updateMany(
        { storeId: sId },
        { $set: { connectedPrinters: syncedPrinters.length, physicalPrinters: validPrinters } }
      );
    }

    if (syncedPrinters.length > 0) {
      await StoreModel.findByIdAndUpdate(sId, {
        $set: { printerConfigured: true, isFirstLogin: false }
      });
    }

    const formatted = syncedPrinters.map(p => this.formatPrinterDto(p));

    logger.info(`[Printer Sync API] Store ${targetStoreId} -> synchronized ${formatted.length} physical printer(s)`);

    // Realtime Socket.IO Broadcast to Store Dashboard
    socketManager.emitToStore(targetStoreId, 'printer_synced', {
      storeId: targetStoreId,
      connectorId,
      machineId,
      printers: formatted,
      count: formatted.length,
      timestamp: new Date().toISOString()
    });

    socketManager.emitToStore(targetStoreId, 'printers_updated', {
      connectorId,
      storeId: targetStoreId,
      printers: validPrinters,
      count: validPrinters.length,
      timestamp: new Date().toISOString()
    });

    socketManager.emitToStore(targetStoreId, 'connector_status', {
      status: 'Ready',
      connectorId,
      printerCount: formatted.length,
      timestamp: new Date().toISOString()
    });

    return { syncedCount: formatted.length, printers: formatted };
  }

  private formatPrinterDto(p: IPrinter): PrinterResponseDto {
    return {
      id: p._id.toString(),
      storeId: p.storeId.toString(),
      printerName: p.printerName,
      model: p.model,
      brand: p.brand,
      driver: p.driver,
      port: p.port,
      connectionType: p.connectionType,
      status: p.status,
      paperLevel: p.paperLevel ?? 90,
      tonerLevel: p.tonerLevel ?? 85,
      isDefault: p.isDefault,
      capabilities: p.capabilities,
      lastHeartbeat: (p.lastHeartbeat || p.updatedAt || new Date()).toISOString(),
      createdAt: (p.createdAt || new Date()).toISOString()
    };
  }
}

export const printerService = new PrinterService();
