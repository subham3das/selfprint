import { Request, Response, NextFunction } from 'express';
import { BaseController } from '../../../controllers/BaseController';
import { dashboardService, DashboardService } from './dashboard.service';
import {
  dashboardQuerySchema,
  queueQuerySchema,
  activityQuerySchema,
  notificationsQuerySchema
} from './dashboard.validation';
import { AuthenticatedRequest } from '../../../middlewares/auth.middleware';

export class DashboardController extends BaseController {
  private service: DashboardService;

  constructor(service: DashboardService = dashboardService) {
    super();
    this.service = service;
  }

  private getStoreId(req: Request): string | undefined {
    const user = (req as AuthenticatedRequest).user;
    return user?.storeId || user?.id || (req.query.storeId as string);
  }

  /**
   * GET /api/v1/store/dashboard
   * Full dashboard overview data
   */
  public getDashboardOverview = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const validated = dashboardQuerySchema.parse(req.query);
      const storeId = this.getStoreId(req) || validated.storeId;
      const data = await this.service.getDashboardOverview(storeId);
      this.sendSuccess(res, 'Store dashboard data retrieved successfully', data);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/store/dashboard/queue
   * Paginated and filtered queue table
   */
  public getRecentQueue = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const validated = queueQuerySchema.parse(req.query);
      const storeId = this.getStoreId(req) || validated.storeId;
      const data = await this.service.getRecentQueue(
        storeId,
        validated.status,
        validated.page,
        validated.limit,
        validated.search,
        validated.paperSize,
        validated.colorMode,
        validated.sortBy
      );
      this.sendSuccess(res, 'Queue jobs retrieved successfully', data);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/store/dashboard/activity
   * Today's activity list
   */
  public getTodayActivity = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const validated = activityQuerySchema.parse(req.query);
      const storeId = this.getStoreId(req) || validated.storeId;
      const data = await this.service.getTodayActivity(storeId, validated.limit);
      this.sendSuccess(res, "Today's activities retrieved successfully", data);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/store/dashboard/stock-alerts
   * Paper, ink, toner stock alerts
   */
  public getStockAlerts = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const validated = dashboardQuerySchema.parse(req.query);
      const storeId = this.getStoreId(req) || validated.storeId;
      const data = await this.service.getStockAlerts(storeId);
      this.sendSuccess(res, 'Stock alerts retrieved successfully', data);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/store/dashboard/summary
   * Today's chart breakdown summary
   */
  public getTodaySummary = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const validated = dashboardQuerySchema.parse(req.query);
      const storeId = this.getStoreId(req) || validated.storeId;
      const data = await this.service.getTodaySummary(storeId);
      this.sendSuccess(res, "Today's summary breakdown retrieved successfully", data);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/store/dashboard/notifications
   * Notification list and unread count
   */
  public getNotifications = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const validated = notificationsQuerySchema.parse(req.query);
      const storeId = this.getStoreId(req) || validated.storeId;
      const data = await this.service.getNotifications(storeId, validated.limit);
      this.sendSuccess(res, 'Notifications retrieved successfully', data);
    } catch (error) {
      next(error);
    }
  };
}

export const dashboardController = new DashboardController();
export default dashboardController;
