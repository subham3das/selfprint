import { Request, Response, NextFunction } from 'express';
import { BaseController } from '../../../controllers/BaseController';
import { adminSupportService, AdminSupportService } from './support.service';

export class AdminSupportController extends BaseController {
  private service: AdminSupportService;

  constructor(service: AdminSupportService = adminSupportService) {
    super();
    this.service = service;
  }

  public getDashboardOverview = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const overview = await this.service.getDashboardOverview();
      this.sendSuccess(res, 'Support dashboard overview fetched successfully', overview);
    } catch (error) {
      next(error);
    }
  };

  public getStats = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = await this.service.getStats();
      this.sendSuccess(res, 'Support stats fetched successfully', stats);
    } catch (error) {
      next(error);
    }
  };

  public getFilters = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters = await this.service.getFilterOptions();
      this.sendSuccess(res, 'Support filter options fetched successfully', filters);
    } catch (error) {
      next(error);
    }
  };

  public getTickets = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.getTickets(req.query as any);
      this.sendSuccess(res, 'Support tickets fetched successfully', result);
    } catch (error) {
      next(error);
    }
  };

  public getTicketById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ticket = await this.service.getTicketById(req.params.id);
      this.sendSuccess(res, 'Ticket details fetched successfully', ticket);
    } catch (error) {
      next(error);
    }
  };

  public createTicket = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ticket = await this.service.createTicket(req.body);
      this.sendSuccess(res, 'Support ticket created successfully', ticket, 201);
    } catch (error) {
      next(error);
    }
  };

  public updateTicket = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ticket = await this.service.updateTicket(req.params.id, req.body);
      this.sendSuccess(res, 'Ticket updated successfully', ticket);
    } catch (error) {
      next(error);
    }
  };

  public assignTicket = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ticket = await this.service.assignTicket(req.params.id, req.body);
      this.sendSuccess(res, 'Ticket assigned successfully', ticket);
    } catch (error) {
      next(error);
    }
  };

  public replyTicket = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ticket = await this.service.replyTicket(req.params.id, req.body);
      this.sendSuccess(res, 'Reply sent successfully', ticket);
    } catch (error) {
      next(error);
    }
  };

  public resolveTicket = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ticket = await this.service.resolveTicket(req.params.id, req.body);
      this.sendSuccess(res, 'Ticket resolved successfully', ticket);
    } catch (error) {
      next(error);
    }
  };

  public updateStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ticket = await this.service.updateTicket(req.params.id, { status: req.body.status });
      this.sendSuccess(res, 'Ticket status updated successfully', ticket);
    } catch (error) {
      next(error);
    }
  };

  public addInternalNote = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ticket = await this.service.addInternalNote(req.params.id, req.body.note);
      this.sendSuccess(res, 'Internal note added successfully', ticket);
    } catch (error) {
      next(error);
    }
  };

  public deleteTicket = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.service.deleteTicket(req.params.id);
      this.sendSuccess(res, 'Ticket deleted successfully', null);
    } catch (error) {
      next(error);
    }
  };
}

export const adminSupportController = new AdminSupportController();
export default adminSupportController;
