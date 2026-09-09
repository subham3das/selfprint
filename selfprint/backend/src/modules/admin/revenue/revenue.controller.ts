import { Request, Response, NextFunction } from 'express';
import { BaseController } from '../../../controllers/BaseController';
import { adminRevenueService, AdminRevenueService } from './revenue.service';

export class AdminRevenueController extends BaseController {
  private service: AdminRevenueService;

  constructor(service: AdminRevenueService = adminRevenueService) {
    super();
    this.service = service;
  }

  public getOverview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const overview = await this.service.getOverview(req.query as any);
      this.sendSuccess(res, 'Revenue overview fetched successfully', overview);
    } catch (error) {
      next(error);
    }
  };

  public getStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = await this.service.getStats(req.query as any);
      this.sendSuccess(res, 'Revenue stats fetched successfully', stats);
    } catch (error) {
      next(error);
    }
  };

  public getChart = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const period = (req.query.period as any) || 'daily';
      const chart = await this.service.getChart(period, req.query as any);
      this.sendSuccess(res, 'Revenue chart fetched successfully', chart);
    } catch (error) {
      next(error);
    }
  };

  public getFilters = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters = await this.service.getFilterOptions();
      this.sendSuccess(res, 'Revenue filter options fetched successfully', filters);
    } catch (error) {
      next(error);
    }
  };
}

export const adminRevenueController = new AdminRevenueController();
export default adminRevenueController;
