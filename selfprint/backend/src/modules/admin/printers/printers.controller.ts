import { Request, Response, NextFunction } from 'express';
import { BaseController } from '../../../controllers/BaseController';
import { adminPrintersService, AdminPrintersService } from './printers.service';

export class AdminPrintersController extends BaseController {
  private service: AdminPrintersService;

  constructor(service: AdminPrintersService = adminPrintersService) {
    super();
    this.service = service;
  }

  public getStats = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = await this.service.getStats();
      this.sendSuccess(res, 'Printer stats fetched successfully', stats);
    } catch (error) {
      next(error);
    }
  };

  public getFilters = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters = await this.service.getFilterOptions();
      this.sendSuccess(res, 'Printer filter options fetched successfully', filters);
    } catch (error) {
      next(error);
    }
  };

  public getPrinters = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.getPrinters(req.query as any);
      this.sendSuccess(res, 'Printers list fetched successfully', result);
    } catch (error) {
      next(error);
    }
  };

  public getPrinterById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const printer = await this.service.getPrinterById(req.params.id);
      this.sendSuccess(res, 'Printer details fetched successfully', printer);
    } catch (error) {
      next(error);
    }
  };

  public registerPrinter = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const printer = await this.service.registerPrinter(req.body);
      this.sendSuccess(res, 'Printer registered successfully', printer, 201);
    } catch (error) {
      next(error);
    }
  };

  public updatePrinter = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const printer = await this.service.updatePrinter(req.params.id, req.body);
      this.sendSuccess(res, 'Printer updated successfully', printer);
    } catch (error) {
      next(error);
    }
  };

  public deletePrinter = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.service.deletePrinter(req.params.id);
      this.sendSuccess(res, 'Printer deleted successfully', null);
    } catch (error) {
      next(error);
    }
  };

  public restartPrinter = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.restartPrinter(req.params.id);
      this.sendSuccess(res, result.message, result);
    } catch (error) {
      next(error);
    }
  };

  public testPrint = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const job = await this.service.testPrint(req.params.id, req.body);
      this.sendSuccess(res, 'Test print job dispatched successfully', job);
    } catch (error) {
      next(error);
    }
  };

  public togglePause = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const printer = await this.service.togglePause(req.params.id);
      this.sendSuccess(res, `Printer status updated to ${printer.status}`, printer);
    } catch (error) {
      next(error);
    }
  };
}

export const adminPrintersController = new AdminPrintersController();
export default adminPrintersController;
