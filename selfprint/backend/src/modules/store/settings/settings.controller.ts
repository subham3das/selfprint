import { Request, Response, NextFunction } from 'express';
import { BaseController } from '../../../controllers/BaseController';
import { settingsService, SettingsService } from './settings.service';
import {
  updateGeneralSettingsSchema,
  updatePricingSettingsSchema,
  updatePaymentSettingsSchema,
  updatePrinterSettingsSchema,
  updatePreferencesSettingsSchema,
  updateNotificationSettingsSchema,
  updateReceiptSettingsSchema
} from './settings.validation';
import { AuthenticatedRequest } from '../../../middlewares/auth.middleware';
import { ApiResponse } from '../../../responses/ApiResponse';
import { HTTP_STATUS } from '../../../constants/httpStatusCodes';

export class SettingsController extends BaseController {
  private service: SettingsService;

  constructor(service: SettingsService = settingsService) {
    super();
    this.service = service;
  }

  private getStoreId(req: Request): string | undefined {
    const user = (req as AuthenticatedRequest).user;
    return user?.storeId || user?.id || (req.query.storeId as string);
  }

  public getFullSettings = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const storeId = this.getStoreId(req);
      const settings = await this.service.getFullSettings(storeId);
      if (!settings) {
        ApiResponse.error(res, 'Store not found', HTTP_STATUS.NOT_FOUND);
        return;
      }
      console.log(`[SettingsController:getFullSettings] Store ${storeId} -> testMode:`, settings.printer?.testMode);
      this.sendSuccess(res, 'Store settings retrieved', { settings });
    } catch (error) {
      next(error);
    }
  };

  public updateGeneralSettings = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const storeId = this.getStoreId(req);
      const validated = updateGeneralSettingsSchema.parse(req.body);
      const settings = await this.service.updateGeneralSettings(storeId, validated);
      this.sendSuccess(res, 'General settings updated', { settings });
    } catch (error) {
      next(error);
    }
  };

  public updatePricingSettings = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const storeId = this.getStoreId(req);
      const validated = updatePricingSettingsSchema.parse(req.body);
      const settings = await this.service.updatePricingSettings(storeId, validated);
      this.sendSuccess(res, 'Pricing configuration updated', { settings });
    } catch (error) {
      next(error);
    }
  };

  public updatePaymentSettings = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const storeId = this.getStoreId(req);
      const validated = updatePaymentSettingsSchema.parse(req.body);
      const meta = {
        ipAddress: (req.headers['x-forwarded-for'] as string) || req.ip || req.socket.remoteAddress || '127.0.0.1',
        userAgent: req.headers['user-agent'] || 'Web App',
        updatedBy: ((req as AuthenticatedRequest).user as any)?.name || (req as AuthenticatedRequest).user?.email || 'Store Owner'
      };
      const settings = await this.service.updatePaymentSettings(storeId, validated, meta);
      this.sendSuccess(res, 'Payment settings updated', { settings });
    } catch (error) {
      next(error);
    }
  };

  public updatePrinterSettings = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const storeId = this.getStoreId(req);
      console.log(`[SettingsController:updatePrinterSettings] Request Body:`, req.body);
      const validated = updatePrinterSettingsSchema.parse(req.body);
      console.log(`[SettingsController:updatePrinterSettings] Validated Payload:`, validated);
      const settings = await this.service.updatePrinterSettings(storeId, validated);
      this.sendSuccess(res, 'Printer settings updated', { settings });
    } catch (error) {
      next(error);
    }
  };

  public updatePreferencesSettings = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const storeId = this.getStoreId(req);
      const validated = updatePreferencesSettingsSchema.parse(req.body);
      const settings = await this.service.updatePreferencesSettings(storeId, validated);
      this.sendSuccess(res, 'Preferences updated', { settings });
    } catch (error) {
      next(error);
    }
  };

  public updateNotificationSettings = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const storeId = this.getStoreId(req);
      const validated = updateNotificationSettingsSchema.parse(req.body);
      const settings = await this.service.updateNotificationSettings(storeId, validated);
      this.sendSuccess(res, 'Notification settings updated', { settings });
    } catch (error) {
      next(error);
    }
  };

  public updateReceiptSettings = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const storeId = this.getStoreId(req);
      const validated = updateReceiptSettingsSchema.parse(req.body);
      const settings = await this.service.updateReceiptSettings(storeId, validated);
      this.sendSuccess(res, 'Receipt settings updated', { settings });
    } catch (error) {
      next(error);
    }
  };

  public exportBackup = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const storeId = this.getStoreId(req);
      const backup = await this.service.exportBackup(storeId);
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="store_backup_${Date.now()}.json"`);
      res.status(200).send(JSON.stringify(backup, null, 2));
    } catch (error) {
      next(error);
    }
  };

  public restoreBackup = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const storeId = this.getStoreId(req);
      const settings = await this.service.restoreBackup(storeId, req.body);
      this.sendSuccess(res, 'Backup restored successfully', { settings });
    } catch (error) {
      next(error);
    }
  };

  public getSystemInfo = async (
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const info = this.service.getSystemInfo();
      this.sendSuccess(res, 'System diagnostics retrieved', { systemInfo: info });
    } catch (error) {
      next(error);
    }
  };
}

export const settingsController = new SettingsController();
export default settingsController;
