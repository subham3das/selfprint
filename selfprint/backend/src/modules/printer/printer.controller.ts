import { Request, Response } from 'express';
import { BaseController } from '../../controllers/BaseController';
import { printerService, PrinterService } from './printer.service';

export class PrinterController extends BaseController {
  constructor(private readonly service: PrinterService = printerService) {
    super();
  }

  /**
   * GET /api/v1/printer/store
   * Returns all active configured printers for the authenticated store
   */
  public getStorePrinters = async (req: Request, res: Response): Promise<void> => {
    const storeId = (req as any).user?.storeId || (req as any).user?.id;
    const printers = await this.service.getStorePrinters(storeId);
    this.sendSuccess(res, 'Store printers retrieved successfully', { printers });
  };

  /**
   * POST /api/v1/printer/save
   * Saves or configures a physical printer in MongoDB
   */
  public savePrinter = async (req: Request, res: Response): Promise<void> => {
    const storeId = (req as any).user?.storeId || (req as any).user?.id;
    const printer = await this.service.savePrinter(storeId, req.body);
    this.sendCreated(res, 'Printer saved and configured successfully', { printer });
  };

  /**
   * PATCH /api/v1/printer/:id/status
   * Updates status of a printer (e.g. PAUSED, ONLINE)
   */
  public updatePrinterStatus = async (req: Request, res: Response): Promise<void> => {
    const storeId = (req as any).user?.storeId || (req as any).user?.id;
    const { id } = req.params;
    const { status } = req.body;
    const printer = await this.service.updatePrinterStatus(storeId, id, status);
    this.sendSuccess(res, `Printer status updated to ${status}`, { printer });
  };

  /**
   * DELETE /api/v1/printer/:id
   * Removes a printer from the store
   */
  public deletePrinter = async (req: Request, res: Response): Promise<void> => {
    const storeId = (req as any).user?.storeId || (req as any).user?.id;
    const { id } = req.params;
    await this.service.deletePrinter(storeId, id);
    this.sendSuccess(res, 'Printer removed successfully');
  };

  /**
   * POST /api/v1/printer/host/pair
   * Pairs local desktop host bridge with the store
   */
  public pairHost = async (req: Request, res: Response): Promise<void> => {
    const storeId = (req as any).user?.storeId || (req as any).user?.id;
    const result = await this.service.pairHost(storeId, req.body);
    this.sendSuccess(res, 'Host bridge paired successfully', result);
  };

  /**
   * POST /api/v1/printer/host/heartbeat
   * Ingests telemetry heartbeat from desktop host bridge
   */
  public processHeartbeat = async (req: Request, res: Response): Promise<void> => {
    const storeId = (req as any).user?.storeId || (req as any).user?.id;
    const result = await this.service.processHeartbeat(storeId, req.body);
    this.sendSuccess(res, 'Heartbeat acknowledged', result);
  };
}

export const printerController = new PrinterController();
