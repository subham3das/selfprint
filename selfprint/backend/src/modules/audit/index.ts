import { Router, Request, Response } from 'express';
import { BaseController } from '../../controllers/BaseController';

export class AuditController extends BaseController {
  public getAuditLogs = async (_req: Request, res: Response): Promise<void> => {
    this.sendSuccess(res, 'Audit logs endpoint ready', {
      logs: [],
      totalCount: 0
    });
  };
}

export const auditController = new AuditController();

const auditRouter = Router();
auditRouter.get('/', auditController.getAuditLogs);

export default auditRouter;
export { auditRouter };
