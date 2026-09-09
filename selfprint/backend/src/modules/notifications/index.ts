import { Router, Request, Response } from 'express';
import { BaseController } from '../../controllers/BaseController';

export class NotificationsController extends BaseController {
  public getNotifications = async (_req: Request, res: Response): Promise<void> => {
    this.sendSuccess(res, 'Notifications list endpoint ready', {
      notifications: [],
      unreadCount: 0
    });
  };

  public markAsRead = async (_req: Request, res: Response): Promise<void> => {
    this.sendSuccess(res, 'Notification marked as read', { success: true });
  };
}

export const notificationsController = new NotificationsController();

const notificationsRouter = Router();
notificationsRouter.get('/', notificationsController.getNotifications);
notificationsRouter.patch('/:id/read', notificationsController.markAsRead);

export default notificationsRouter;
export { notificationsRouter };
