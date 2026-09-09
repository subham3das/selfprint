import { Router, Request, Response } from 'express';
import { BaseController } from '../../controllers/BaseController';

export class SuperAdminController extends BaseController {
  public getSystemOverview = async (_req: Request, res: Response): Promise<void> => {
    this.sendSuccess(res, 'Super Admin overview module ready', {
      systemStatus: 'ONLINE',
      maintenanceMode: false
    });
  };

  public updateSystemSettings = async (req: Request, res: Response): Promise<void> => {
    this.sendSuccess(res, 'System settings endpoint ready', req.body);
  };
}

export const superAdminController = new SuperAdminController();

const superAdminRouter = Router();
superAdminRouter.get('/overview', superAdminController.getSystemOverview);
superAdminRouter.put('/settings', superAdminController.updateSystemSettings);

export default superAdminRouter;
export { superAdminRouter };
