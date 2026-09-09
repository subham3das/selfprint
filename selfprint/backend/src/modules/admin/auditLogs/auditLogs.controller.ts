import { Request, Response, NextFunction } from 'express';
import { BaseController } from '../../../controllers/BaseController';
import { adminAuditLogsService, AdminAuditLogsService } from './auditLogs.service';

export class AdminAuditLogsController extends BaseController {
  private service: AdminAuditLogsService;

  constructor(service: AdminAuditLogsService = adminAuditLogsService) {
    super();
    this.service = service;
  }

  public getStats = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = await this.service.getStats();
      this.sendSuccess(res, 'Audit stats fetched successfully', stats);
    } catch (error) {
      next(error);
    }
  };

  public getLogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.getLogs(req.query as any);
      this.sendSuccess(res, 'Audit logs fetched successfully', result);
    } catch (error) {
      next(error);
    }
  };

  public getLogById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const log = await this.service.getLogById(req.params.id);
      this.sendSuccess(res, 'Audit log detail fetched successfully', log);
    } catch (error) {
      next(error);
    }
  };

  public getSecuritySummary = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const summary = await this.service.getSecuritySummary();
      this.sendSuccess(res, 'Security summary fetched successfully', summary);
    } catch (error) {
      next(error);
    }
  };

  public getTimeline = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const timeline = await this.service.getTimeline();
      this.sendSuccess(res, 'Audit timeline fetched successfully', timeline);
    } catch (error) {
      next(error);
    }
  };

  public getHeatmap = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const heatmap = await this.service.getHeatmap();
      this.sendSuccess(res, 'Audit activity heatmap fetched successfully', heatmap);
    } catch (error) {
      next(error);
    }
  };

  public getLiveFeed = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const feed = await this.service.getLiveFeed();
      this.sendSuccess(res, 'Live audit feed fetched successfully', feed);
    } catch (error) {
      next(error);
    }
  };

  public getFilters = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters = await this.service.getFilters();
      this.sendSuccess(res, 'Audit filter options fetched successfully', filters);
    } catch (error) {
      next(error);
    }
  };

  public exportLogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const csv = await this.service.exportLogs(req.query as any);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=audit-logs-${Date.now()}.csv`);
      res.status(200).send(csv);
    } catch (error) {
      next(error);
    }
  };
}

export const adminAuditLogsController = new AdminAuditLogsController();
export default adminAuditLogsController;
