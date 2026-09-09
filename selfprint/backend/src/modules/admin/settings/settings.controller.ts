import { Request, Response, NextFunction } from 'express';
import { BaseController } from '../../../controllers/BaseController';
import { adminSettingsService, AdminSettingsService } from './settings.service';
import { SettingsSectionKey } from './settings.types';

export class AdminSettingsController extends BaseController {
  private service: AdminSettingsService;

  constructor(service: AdminSettingsService = adminSettingsService) {
    super();
    this.service = service;
  }

  public getSettings = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const settings = await this.service.getSettings();
      this.sendSuccess(res, 'Platform settings retrieved successfully', settings);
    } catch (error) {
      next(error);
    }
  };

  public updateSection = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const section = req.params.section as SettingsSectionKey;
      const actorEmail = (req as any).user?.email || 'admin@selfprint.com';
      const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';

      const updated = await this.service.updateSection(section, req.body, actorEmail, ipAddress);
      this.sendSuccess(res, `Settings for section '${section}' updated successfully`, updated);
    } catch (error) {
      next(error);
    }
  };

  public updateAllSettings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const actorEmail = (req as any).user?.email || 'admin@selfprint.com';
      const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';

      const updated = await this.service.updateAllSettings(req.body, actorEmail, ipAddress);
      this.sendSuccess(res, 'Global platform settings updated successfully', updated);
    } catch (error) {
      next(error);
    }
  };

  public testEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const actorEmail = (req as any).user?.email || 'admin@selfprint.com';
      const result = await this.service.testEmail(req.body, actorEmail);
      this.sendSuccess(res, result.message, result);
    } catch (error) {
      next(error);
    }
  };

  public testIntegration = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const actorEmail = (req as any).user?.email || 'admin@selfprint.com';
      const result = await this.service.testIntegration(req.body, actorEmail);
      this.sendSuccess(res, `Connection to ${result.provider} verified successfully (${result.latencyMs}ms)`, result);
    } catch (error) {
      next(error);
    }
  };

  public triggerBackup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const actorEmail = (req as any).user?.email || 'admin@selfprint.com';
      const result = await this.service.triggerBackup(actorEmail);
      this.sendSuccess(res, 'Platform database backup completed successfully', result);
    } catch (error) {
      next(error);
    }
  };

  public dangerAction = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const actorEmail = (req as any).user?.email || 'admin@selfprint.com';
      const result = await this.service.dangerAction(req.body, actorEmail);
      this.sendSuccess(res, result.message, result);
    } catch (error) {
      next(error);
    }
  };
}

export const adminSettingsController = new AdminSettingsController();
export default adminSettingsController;
