import { Request, Response, NextFunction } from 'express';
import { BaseController } from '../../../controllers/BaseController';
import { adminAccessService, AdminAccessService } from './access.service';
import { AuthenticatedRequest } from '../../../middlewares/auth.middleware';
import { ValidationError } from '../../../errors';
import { AdminModel } from '../../../models/admin.model';


export class AdminAccessController extends BaseController {
  private service: AdminAccessService;

  constructor(service: AdminAccessService = adminAccessService) {
    super();
    this.service = service;
  }

  public getStats = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = await this.service.getStats();
      this.sendSuccess(res, 'Access stats fetched successfully', stats);
    } catch (error) {
      next(error);
    }
  };

  public getStaffList = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.getStaffList(req.query as any);
      this.sendSuccess(res, 'Staff members fetched successfully', result);
    } catch (error) {
      next(error);
    }
  };

  public getStaffById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const staff = await this.service.getStaffById(req.params.id);
      this.sendSuccess(res, 'Staff details fetched successfully', staff);
    } catch (error) {
      next(error);
    }
  };

  public inviteStaff = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { fullName, name, email, phone, role, department, permissions } = req.body;
      const staffName = (fullName || name || '').trim();
      const staffEmail = (email || '').trim().toLowerCase();
      const staffRole = (role || '').trim();
      const staffDept = (department || '').trim();

      const errors: Record<string, string> = {};

      if (!staffName) {
        errors.fullName = 'Full Name is required';
      }
      if (!staffEmail) {
        errors.email = 'Email is required';
      } else if (!staffEmail.includes('@') || !staffEmail.includes('.')) {
        errors.email = 'Please provide a valid email address';
      }
      if (!staffRole) {
        errors.role = 'Role is required';
      }
      if (!staffDept) {
        errors.department = 'Department is required';
      }

      // Check if email already exists in DB
      if (staffEmail) {
        const existing = await AdminModel.findOne({ email: staffEmail, isDeleted: { $ne: true } });
        if (existing) {
          errors.email = 'Email already exists';
        }
      }

      if (Object.keys(errors).length > 0) {
        res.status(422).json({
          success: false,
          message: 'Validation Failed',
          errors
        });
        return;
      }

      const actorEmail = req.user?.email || 'das01subhamj@gmail.com';
      const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '';
      const userAgent = req.headers['user-agent'] || '';

      const staff = await this.service.inviteStaff(
        {
          fullName: staffName,
          email: staffEmail,
          phone: phone || '',
          role: staffRole,
          department: staffDept,
          permissions,
          sendEmailInvite: req.body.sendEmailInvite ?? true
        },
        actorEmail,
        ipAddress,
        userAgent
      );

      this.sendSuccess(res, 'Staff member invited successfully.', staff, 201);
    } catch (error: any) {
      if (error?.message && error.message.includes('already exists')) {
        res.status(422).json({
          success: false,
          message: 'Validation Failed',
          errors: {
            email: 'Email already exists'
          }
        });
        return;
      }
      next(error);
    }
  };


  public updateStaff = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const actorEmail = req.user?.email || 'das01subhamj@gmail.com';
      const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '';
      const userAgent = req.headers['user-agent'] || '';

      const staff = await this.service.updateStaff(
        req.params.id,
        req.body,
        actorEmail,
        ipAddress,
        userAgent
      );
      this.sendSuccess(res, 'Staff member updated successfully.', staff);
    } catch (error) {
      next(error);
    }
  };

  public toggleStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const staff = await this.service.toggleStatus(req.params.id);
      this.sendSuccess(res, 'Status updated successfully.', staff);
    } catch (error) {
      next(error);
    }
  };

  public deleteStaff = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.service.deleteStaff(req.params.id);
      this.sendSuccess(res, 'Staff member deleted successfully.', null);
    } catch (error) {
      next(error);
    }
  };

  public resendInvitation = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const actorEmail = req.user?.email || 'das01subhamj@gmail.com';
      const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '';
      const userAgent = req.headers['user-agent'] || '';

      const staff = await this.service.resendInvitation(
        req.params.id,
        actorEmail,
        ipAddress,
        userAgent
      );
      this.sendSuccess(res, 'Invitation resent successfully.', staff);
    } catch (error) {
      next(error);
    }
  };

  public cancelInvitation = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const actorEmail = req.user?.email || 'das01subhamj@gmail.com';
      const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '';
      const userAgent = req.headers['user-agent'] || '';

      await this.service.cancelInvitation(
        req.params.id,
        actorEmail,
        ipAddress,
        userAgent
      );
      this.sendSuccess(res, 'Invitation cancelled successfully.', null);
    } catch (error) {
      next(error);
    }
  };

  public resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.service.resetPassword(req.params.id);
      this.sendSuccess(res, 'Password reset email triggered.', null);
    } catch (error) {
      next(error);
    }
  };


  public getFilters = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters = await this.service.getFilters();
      this.sendSuccess(res, 'Filter options fetched successfully.', filters);
    } catch (error) {
      next(error);
    }
  };

  public getAuditLogs = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const logs = await this.service.getAuditLogs();
      this.sendSuccess(res, 'Access audit logs fetched successfully.', logs);
    } catch (error) {
      next(error);
    }
  };
}

export const adminAccessController = new AdminAccessController();
export default adminAccessController;
