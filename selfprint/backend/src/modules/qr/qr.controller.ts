import { Request, Response, NextFunction } from 'express';
import { BaseController } from '../../controllers/BaseController';
import { qrService, QRService } from './qr.service';
import { updateQRConfigSchema } from './qr.validation';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';
import { ApiResponse } from '../../responses/ApiResponse';
import { HTTP_STATUS } from '../../constants/httpStatusCodes';

export class QRController extends BaseController {
  private service: QRService;

  constructor(service: QRService = qrService) {
    super();
    this.service = service;
  }

  private getStoreId(req: Request): string | undefined {
    const user = (req as AuthenticatedRequest).user;
    return user?.storeId || user?.id || (req.query.storeId as string);
  }

  public getQRConfig = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const storeId = this.getStoreId(req);
      const config = await this.service.getQRConfig(storeId);
      if (!config) {
        ApiResponse.error(res, 'Store not found', HTTP_STATUS.NOT_FOUND);
        return;
      }
      this.sendSuccess(res, 'QR configuration retrieved', { config });
    } catch (error) {
      next(error);
    }
  };

  public updateQRConfig = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const storeId = this.getStoreId(req);
      const validated = updateQRConfigSchema.parse(req.body);
      const config = await this.service.updateQRConfig(storeId, {
        ...validated,
        logoUrl: req.body.logoUrl
      });
      if (!config) {
        ApiResponse.error(res, 'Store not found', HTTP_STATUS.NOT_FOUND);
        return;
      }
      this.sendSuccess(res, 'QR configuration updated successfully', { config });
    } catch (error) {
      next(error);
    }
  };

  public regenerateQR = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const storeId = this.getStoreId(req);
      const config = await this.service.regenerateQR(storeId);
      if (!config) {
        ApiResponse.error(res, 'Store not found', HTTP_STATUS.NOT_FOUND);
        return;
      }
      this.sendSuccess(res, 'QR regenerated and added to history', { config });
    } catch (error) {
      next(error);
    }
  };

  public getQRHistory = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const storeId = this.getStoreId(req);
      const history = await this.service.getQRHistory(storeId);
      this.sendSuccess(res, 'QR history retrieved', { history });
    } catch (error) {
      next(error);
    }
  };

  public deleteQRHistory = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const storeId = this.getStoreId(req);
      const { id } = req.params;
      const result = await this.service.deleteQRHistory(storeId, id);
      if (!result.success) {
        ApiResponse.error(res, result.message || 'Cannot delete history entry', HTTP_STATUS.BAD_REQUEST);
        return;
      }
      this.sendSuccess(res, 'History entry deleted');
    } catch (error) {
      next(error);
    }
  };

  public getQRAnalytics = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const storeId = this.getStoreId(req);
      const analytics = await this.service.getQRAnalytics(storeId);
      this.sendSuccess(res, 'QR analytics retrieved', { analytics });
    } catch (error) {
      next(error);
    }
  };

  public resolveQRToken = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const token = req.params.token || req.params.storeId;
      const data = await this.service.resolveStoreForUploadPortal(token);
      if (!data) {
        ApiResponse.error(res, 'Store not found or invalid QR', HTTP_STATUS.NOT_FOUND);
        return;
      }
      if (data.available === false) {
        ApiResponse.error(res, data.message || 'QR code expired', HTTP_STATUS.FORBIDDEN);
        return;
      }
      this.sendSuccess(res, 'Store resolved successfully', data);
    } catch (error) {
      next(error);
    }
  };
}

export const qrController = new QRController();
export default qrController;
