import { Request, Response, NextFunction } from 'express';
import { BaseController } from '../../../controllers/BaseController';
import { adminDashboardService, AdminDashboardService } from './dashboard.service';

export class AdminDashboardController extends BaseController {
  private service: AdminDashboardService;

  constructor(service: AdminDashboardService = adminDashboardService) {
    super();
    this.service = service;
  }

  public getOverview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const revenuePeriod = (req.query.revenuePeriod as string) || 'This Week';
      const analyticsPeriod = (req.query.analyticsPeriod as string) || 'This Month';
      const result = await this.service.getOverview(revenuePeriod, analyticsPeriod);
      this.sendSuccess(res, 'Dashboard overview fetched successfully', result);
    } catch (error) {
      next(error);
    }
  };

  public getStats = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = await this.service.getStats();
      this.sendSuccess(res, 'Dashboard stats fetched successfully', stats);
    } catch (error) {
      next(error);
    }
  };

  public getRevenue = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const period = (req.query.period as any) || 'This Week';
      const revenue = await this.service.getRevenue(period);
      this.sendSuccess(res, 'Revenue data fetched successfully', revenue);
    } catch (error) {
      next(error);
    }
  };

  public getActivities = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const activities = await this.service.getLiveActivities();
      this.sendSuccess(res, 'Live activities fetched successfully', activities);
    } catch (error) {
      next(error);
    }
  };

  public getTopStores = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const topStores = await this.service.getTopStores();
      this.sendSuccess(res, 'Top stores fetched successfully', topStores);
    } catch (error) {
      next(error);
    }
  };

  public getTransactions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const limit = Number(req.query.limit) || 5;
      const transactions = await this.service.getRecentTransactions(limit);
      this.sendSuccess(res, 'Recent transactions fetched successfully', transactions);
    } catch (error) {
      next(error);
    }
  };

  public getAnalytics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const period = (req.query.period as string) || 'This Month';
      const analytics = await this.service.getPlatformAnalytics(period);
      this.sendSuccess(res, 'Platform analytics fetched successfully', analytics);
    } catch (error) {
      next(error);
    }
  };

  public getAlerts = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const alerts = await this.service.getSystemAlerts();
      this.sendSuccess(res, 'System alerts fetched successfully', alerts);
    } catch (error) {
      next(error);
    }
  };

  public getRecentUsers = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const users = await this.service.getRecentUsers();
      this.sendSuccess(res, 'Recent users fetched successfully', users);
    } catch (error) {
      next(error);
    }
  };

  public search = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const q = (req.query.q as string) || '';
      const result = await this.service.search(q);
      this.sendSuccess(res, 'Dashboard search results fetched successfully', result);
    } catch (error) {
      next(error);
    }
  };
}

export const adminDashboardController = new AdminDashboardController();
export default adminDashboardController;
