import { Router, Request, Response } from 'express';
import { BaseController } from '../../controllers/BaseController';

export class AnalyticsController extends BaseController {
  public getPlatformAnalytics = async (_req: Request, res: Response): Promise<void> => {
    this.sendSuccess(res, 'Analytics engine endpoint ready', {
      totalVolume: 0,
      totalRevenue: '₹0.00'
    });
  };
}

export const analyticsController = new AnalyticsController();

const analyticsRouter = Router();
analyticsRouter.get('/', analyticsController.getPlatformAnalytics);

export default analyticsRouter;
export { analyticsRouter };
