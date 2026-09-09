import { Router, Request, Response, NextFunction } from 'express';
import { BaseController } from '../../controllers/BaseController';
import { authenticate, AuthenticatedRequest } from '../../middlewares/auth.middleware';
import { AdminModel } from '../../models/admin.model';
import { StoreModel } from '../../models/store.model';
import { UserModel } from '../../models/user.model';
import { rbacManager } from '../../permissions/rbac';
import { ApiResponse } from '../../responses/ApiResponse';

export interface AuthSessionDto {
  token: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    role: string;
    name: string;
    permissions?: any;
  };
}

export class AuthController extends BaseController {
  public login = async (_req: Request, res: Response): Promise<void> => {
    this.sendSuccess(res, 'Authentication module ready for implementation', {
      status: 'AUTH_MODULE_INITIALIZED'
    });
  };

  public register = async (_req: Request, res: Response): Promise<void> => {
    this.sendSuccess(res, 'Registration endpoint ready', {
      status: 'REGISTRATION_READY'
    });
  };

  public logout = async (_req: Request, res: Response): Promise<void> => {
    this.sendSuccess(res, 'Logged out successfully', null);
  };

  public getMe = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = req.user;
      if (!user) {
        ApiResponse.error(res, 'Not authenticated', 401, 'UNAUTHORIZED');
        return;
      }

      // 1. Try finding in Admin collection
      const admin = await AdminModel.findById(user.id).lean();
      if (admin) {
        const isSuper =
          admin.role === 'SUPER_ADMIN' ||
          admin.role === 'Super Admin' ||
          admin.email === (process.env.SUPER_ADMIN_EMAIL || 'das01subhamj@gmail.com').toLowerCase();

        const resolvedPermissions = rbacManager.resolvePermissions(admin.role, admin.permissions);

        const adminProfile = {
          id: String(admin._id),
          name: admin.name || admin.displayName || 'Administrator',
          displayName: admin.displayName || admin.name || 'Administrator',
          email: admin.email,
          role: isSuper ? 'SUPER_ADMIN' : admin.role,
          status: admin.status,
          department: admin.department || (isSuper ? 'Executive Operations' : 'Platform Operations'),
          permissions: resolvedPermissions,
          avatar: admin.avatar || '',
          isSuperAdmin: isSuper
        };

        res.status(200).json({
          success: true,
          message: 'Current user profile fetched successfully',
          user: adminProfile,
          permissions: resolvedPermissions,
          role: isSuper ? 'SUPER_ADMIN' : admin.role,
          data: adminProfile
        });
        return;
      }


      // 2. Try finding in Store collection
      const store = await StoreModel.findById(user.id).lean();
      if (store) {
        this.sendSuccess(res, 'Store partner profile fetched successfully', {
          id: String(store._id),
          name: store.name,
          email: store.email,
          role: 'STORE',
          status: store.status,
          phone: store.phone
        });
        return;
      }

      // 3. User / Customer fallback
      const customer = await UserModel.findById(user.id).lean();
      if (customer) {
        this.sendSuccess(res, 'Customer profile fetched successfully', {
          id: String(customer._id),
          name: customer.name,
          email: customer.email,
          role: 'USER',
          phone: customer.phone
        });
        return;
      }

      // 4. Token payload fallback
      this.sendSuccess(res, 'User session profile fetched successfully', {
        id: user.id,
        email: user.email,
        role: user.role,
        permissions: user.permissions
      });
    } catch (error) {
      next(error);
    }
  };
}

export const authController = new AuthController();

const authRouter = Router();
authRouter.post('/login', authController.login);
authRouter.post('/register', authController.register);
authRouter.post('/logout', authController.logout);
authRouter.get('/me', authenticate, authController.getMe);

export default authRouter;
export { authRouter };
