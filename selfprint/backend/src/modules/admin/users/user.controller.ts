import { Request, Response, NextFunction } from 'express';
import { BaseController } from '../../../controllers/BaseController';
import { userService, UserService } from './user.service';
import {
  userQuerySchema,
  userIdParamSchema,
  updateUserSchema,
  updateStatusSchema
} from './user.validation';

export class UserController extends BaseController {
  private service: UserService;

  constructor(service: UserService = userService) {
    super();
    this.service = service;
  }

  /**
   * GET /api/v1/admin/users
   * Paginated, filtered, and searchable user accounts
   */
  public getUsers = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const validatedQuery = userQuerySchema.parse(req.query);
      const data = await this.service.getUsers(validatedQuery);
      this.sendSuccess(res, 'Users retrieved successfully', data);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/admin/users/stats
   * KPI statistical summaries
   */
  public getUserStats = async (
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const stats = await this.service.getUserStats();
      this.sendSuccess(res, 'User statistics retrieved successfully', stats);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/admin/users/export
   * CSV download
   */
  public exportUsers = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const validatedQuery = userQuerySchema.parse(req.query);
      const csvData = await this.service.exportUsersCsv(validatedQuery);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="selfprint_users_${new Date().toISOString().split('T')[0]}.csv"`
      );
      res.status(200).send(csvData);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/admin/users/:id
   * User detailed profile with orders
   */
  public getUserDetails = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = userIdParamSchema.parse(req.params);
      const data = await this.service.getUserDetails(id);
      this.sendSuccess(res, 'User details retrieved successfully', data);
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /api/v1/admin/users/:id
   * Update user details
   */
  public updateUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = userIdParamSchema.parse(req.params);
      const validatedBody = updateUserSchema.parse(req.body);
      const data = await this.service.updateUser(id, validatedBody);
      this.sendSuccess(res, 'User updated successfully', data);
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /api/v1/admin/users/:id/status
   * Toggle / update user status
   */
  public updateUserStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = userIdParamSchema.parse(req.params);
      const validatedBody = updateStatusSchema.parse(req.body);
      const data = await this.service.updateStatus(id, validatedBody.status, validatedBody.reason);
      this.sendSuccess(res, 'User status updated successfully', data);
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /api/v1/admin/users/:id
   * Soft delete user
   */
  public deleteUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = userIdParamSchema.parse(req.params);
      const data = await this.service.deleteUser(id);
      this.sendSuccess(res, data.message, data);
    } catch (error) {
      next(error);
    }
  };
}

export const userController = new UserController();
export default userController;
