import { Router, Request, Response } from 'express';
import { BaseController } from '../../controllers/BaseController';

export class UserKioskController extends BaseController {
  public getStoreKiosk = async (req: Request, res: Response): Promise<void> => {
    this.sendSuccess(res, 'User Kiosk endpoint ready', {
      storeId: req.params.storeId || 'DEFAULT',
      isAcceptingPrints: true
    });
  };

  public getMyPrintHistory = async (_req: Request, res: Response): Promise<void> => {
    this.sendSuccess(res, 'User print history ready', { jobs: [] });
  };
}

export const userKioskController = new UserKioskController();

const userKioskRouter = Router();
userKioskRouter.get('/kiosk/:storeId', userKioskController.getStoreKiosk);
userKioskRouter.get('/history', userKioskController.getMyPrintHistory);

export default userKioskRouter;
export { userKioskRouter };
