import { printerRepository, PrinterRepository } from './printer.repository';
import { SavePrinterDto, PairHostDto, HostHeartbeatDto, PrinterResponseDto } from './printer.types';
import { IPrinter, PrinterStatusType } from '../../models/printer.model';
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
