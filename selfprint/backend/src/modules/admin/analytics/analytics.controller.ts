import { Request, Response, NextFunction } from 'express';
import { BaseController } from '../../../controllers/BaseController';
import { adminAnalyticsService, AdminAnalyticsService } from './analytics.service';
import { AnalyticsPeriod } from './analytics.types';

export class AdminAnalyticsController extends BaseController {
  private service: AdminAnalyticsService;

  constructor(service: AdminAnalyticsService = adminAnalyticsService) {
    super();
    this.service = service;
  }

  public getDashboard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const period = (req.query.period as AnalyticsPeriod) || 'Month';
      const dashboard = await this.service.getDashboard(period);
      this.sendSuccess(res, 'Analytics dashboard fetched successfully', dashboard);
    } catch (error) {
      next(error);
    }
  };

  public getStats = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = await this.service.getStats();
      this.sendSuccess(res, 'Analytics stats fetched successfully', stats);
    } catch (error) {
      next(error);
    }
  };

  public getActivity = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const period = (req.query.period as AnalyticsPeriod) || 'Month';
      const activity = await this.service.getPrintingActivity(period);
      this.sendSuccess(res, 'Printing activity fetched successfully', activity);
    } catch (error) {
      next(error);
    }
  };

  public getPlatformHealth = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const health = await this.service.getPlatformHealth();
      this.sendSuccess(res, 'Platform health fetched successfully', health);
    } catch (error) {
      next(error);
    }
  };

  public getHeatmap = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const cells = await this.service.getPrintingHeatmap();
      this.sendSuccess(res, 'Heatmap data fetched successfully', cells);
    } catch (error) {
      next(error);
    }
  };

  public getTopStores = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stores = await this.service.getTopStores();
      this.sendSuccess(res, 'Top stores fetched successfully', stores);
    } catch (error) {
      next(error);
    }
  };

  public getPaperUsage = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const usage = await this.service.getPaperUsage();
      this.sendSuccess(res, 'Paper usage fetched successfully', usage);
    } catch (error) {
      next(error);
    }
  };

  public getPrintTypes = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const types = await this.service.getPrintTypeDistribution();
      this.sendSuccess(res, 'Print types fetched successfully', types);
    } catch (error) {
      next(error);
    }
  };

  public getPrinterStatus = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const status = await this.service.getPrinterStatusDistribution();
      this.sendSuccess(res, 'Printer status fetched successfully', status);
    } catch (error) {
      next(error);
    }
  };

  public getRecentEvents = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const events = await this.service.getRecentEvents();
      this.sendSuccess(res, 'Recent events fetched successfully', events);
    } catch (error) {
      next(error);
    }
  };

  public getQuickInsights = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const insights = await this.service.getQuickInsights();
      this.sendSuccess(res, 'Quick insights fetched successfully', insights);
    } catch (error) {
      next(error);
    }
  };
}

export const adminAnalyticsController = new AdminAnalyticsController();
export default adminAnalyticsController;
