import mongoose from 'mongoose';
import { PrinterModel, IPrinter, PrinterStatusType } from '../../models/printer.model';
import { HostModel, IHost } from '../../models/host.model';
import { StoreModel } from '../../models/store.model';
import { SavePrinterDto, PairHostDto } from './printer.types';

export class PrinterRepository {
  /**
   * Finds all printers associated with a store
   */
  public async findPrintersByStore(storeId: string): Promise<IPrinter[]> {
    if (!mongoose.Types.ObjectId.isValid(storeId)) return [];
    return PrinterModel.find({ storeId: new mongoose.Types.ObjectId(storeId) })
      .sort({ isDefault: -1, createdAt: -1 })
      .lean();
  }

  /**
   * Finds the primary default printer for a store
   */
  public async findDefaultPrinter(storeId: string): Promise<IPrinter | null> {
    if (!mongoose.Types.ObjectId.isValid(storeId)) return null;
    return PrinterModel.findOne({
      storeId: new mongoose.Types.ObjectId(storeId),
      isDefault: true
    }).lean();
  }

  /**
   * Saves or updates a configured printer for a store
   */
  public async savePrinter(storeId: string, data: SavePrinterDto): Promise<IPrinter> {
    const sId = new mongoose.Types.ObjectId(storeId);

    // If marked as default, unset other defaults
    if (data.isDefault) {
      await PrinterModel.updateMany({ storeId: sId }, { $set: { isDefault: false } });
    }

    // Upsert printer by printerName + storeId or deviceId
    const query = data.deviceId
      ? { storeId: sId, deviceId: data.deviceId }
      : { storeId: sId, printerName: data.printerName };

    const updated = await PrinterModel.findOneAndUpdate(
      query,
      {
        $set: {
          storeId: sId,
          deviceId: data.deviceId,
          printerName: data.printerName,
          model: data.model,
          brand: data.brand,
          driver: data.driver,
          port: data.port,
          connectionType: data.connectionType || 'USB',
          status: 'ONLINE',
          isDefault: data.isDefault ?? true,
          capabilities: data.capabilities || { isColor: false, isDuplex: true, isAutoCut: false, paperSizes: ['A4', 'Letter'] },
          lastHeartbeat: new Date(),
          lastSeen: new Date()
        }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Update Store model flags: printerConfigured = true, isFirstLogin = false
    await StoreModel.findByIdAndUpdate(sId, {
      $set: { printerConfigured: true, isFirstLogin: false }
    });

    return updated;
  }

  /**
   * Updates printer status
   */
  public async updatePrinterStatus(
    storeId: string,
    printerId: string,
    status: PrinterStatusType
  ): Promise<IPrinter | null> {
    if (!mongoose.Types.ObjectId.isValid(printerId)) return null;
    return PrinterModel.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(printerId),
        storeId: new mongoose.Types.ObjectId(storeId)
      },
      {
        $set: { status, lastHeartbeat: new Date() }
      },
      { new: true }
    );
  }

  /**
   * Deletes a printer
   */
  public async deletePrinter(storeId: string, printerId: string): Promise<boolean> {
    if (!mongoose.Types.ObjectId.isValid(printerId)) return false;
    const sId = new mongoose.Types.ObjectId(storeId);
    const result = await PrinterModel.deleteOne({
      _id: new mongoose.Types.ObjectId(printerId),
      storeId: sId
    });

    // If 0 printers left, mark store printerConfigured = false
    const count = await PrinterModel.countDocuments({ storeId: sId });
    if (count === 0) {
      await StoreModel.findByIdAndUpdate(sId, { $set: { printerConfigured: false } });
    }

    return result.deletedCount > 0;
  }

  /**
   * Registers / pairs a desktop host bridge
   */
  public async upsertHost(storeId: string, data: PairHostDto): Promise<IHost> {
    const sId = new mongoose.Types.ObjectId(storeId);
    return HostModel.findOneAndUpdate(
      { storeId: sId, hostId: data.hostId },
      {
        $set: {
          storeId: sId,
          hostId: data.hostId,
          deviceName: data.deviceName,
          os: data.os,
          osRelease: data.osRelease,
          hostVersion: data.hostVersion || '1.0.0',
          ipAddress: data.ipAddress,
          status: 'ONLINE',
          lastHeartbeat: new Date()
        }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  /**
   * Updates host heartbeat and printer statuses
   */
  public async updateHostHeartbeat(
    storeId: string,
    hostId: string,
    printersTelemetry: Array<{ deviceId?: string; printerName: string; status: PrinterStatusType; paperLevel?: number; tonerLevel?: number }>
  ): Promise<void> {
    const sId = new mongoose.Types.ObjectId(storeId);
    await HostModel.updateOne(
      { storeId: sId, hostId },
      { $set: { status: 'ONLINE', lastHeartbeat: new Date() } }
    );

    // Update telemetry for each connected printer
    for (const p of printersTelemetry) {
      const query = p.deviceId
        ? { storeId: sId, deviceId: p.deviceId }
        : { storeId: sId, printerName: p.printerName };

      await PrinterModel.updateOne(query, {
        $set: {
          status: p.status,
          ...(p.paperLevel !== undefined ? { paperLevel: p.paperLevel } : {}),
          ...(p.tonerLevel !== undefined ? { tonerLevel: p.tonerLevel } : {}),
          lastHeartbeat: new Date(),
          lastSeen: new Date()
        }
      });
    }
  }
}

export const printerRepository = new PrinterRepository();
