import { Request, Response, NextFunction } from 'express';
import { BaseController } from '../../../controllers/BaseController';
import { adminAuthService, AdminAuthService } from './adminAuth.service';
import { AuthenticatedRequest } from '../../../middlewares/auth.middleware';
import { UnauthorizedError } from '../../../errors';

export class AdminAuthController extends BaseController {
  private service: AdminAuthService;

  constructor(service: AdminAuthService = adminAuthService) {
    super();
    this.service = service;
  }

  /**
   * POST /api/v1/admin/auth/login
   * Authenticate administrator against the dedicated `admins` collection
   */
  public login = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { email, password } = req.body;
      const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '';
      const userAgent = req.headers['user-agent'] || '';

      const result = await this.service.login({ email, password }, ipAddress, userAgent);
      this.sendSuccess(res, 'Administrator logged in successfully.', result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST / GET /api/v1/admin/auth/google
   * Authenticate administrator via Google OAuth with strict authorization
   */
  public googleLogin = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { credential, accessToken, email, name, picture } = { ...req.query, ...req.body };
      const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '';
      const userAgent = req.headers['user-agent'] || '';

      if (!credential && !accessToken && !email) {
        // Return Google OAuth Client Info if accessed directly via GET
        this.sendSuccess(res, 'Google OAuth client ready.', {
          clientId: process.env.GOOGLE_CLIENT_ID || '1022044993805-ttq61oaubkt448frstjejd5na2tcd4gf.apps.googleusercontent.com'
        });
        return;
      }

      const result = await this.service.googleLogin(
        { credential, accessToken, email, name, picture },
        ipAddress,
        userAgent
      );
      this.sendSuccess(res, 'Administrator authenticated successfully via Google.', result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/admin/auth/me
   * Get authenticated administrator's profile with resolved O(1) object permissions
   */
  public getMe = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const adminIdentifier = req.user?.id || req.user?.email;
      if (!adminIdentifier) {
        throw new UnauthorizedError('Unauthorized administrator.');
      }

      const profile = await this.service.getProfile(adminIdentifier);

      const user = {
        id: profile.id,
        name: profile.name,
        displayName: profile.displayName || profile.name,
        email: profile.email,
        avatar: profile.avatar || '',
        role: profile.role,
        department: profile.department || 'Executive Operations',
        permissions: profile.permissions,
        status: profile.status,
        lastLogin: profile.lastLogin
      };

      res.status(200).json({
        success: true,
        message: 'Admin profile retrieved successfully.',
        user,
        permissions: profile.permissions,
        role: profile.role,
        data: user
      });
    } catch (error) {
      next(error);
    }
  };


  /**
   * GET /api/v1/admin/auth/activate/:token
   * GET /api/v1/admin/auth/verify-invitation/:token
   * Verify invitation token and return profile preview for activation page
   */
  public verifyInvitation = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const token = req.params.token || (req.query.token as string) || '';
      const result = await this.service.verifyInvitation(token);
      this.sendSuccess(res, 'Invitation verified successfully.', result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/v1/admin/auth/activate-google
   * Authenticate and activate an invited staff member with matching Google OAuth account
   */
  public activateGoogle = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { token, credential, accessToken, email, name, picture } = req.body;
      const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '';
      const userAgent = req.headers['user-agent'] || '';

      const result = await this.service.activateGoogle(
        token,
        { credential, accessToken, email, name, picture },
        ipAddress,
        userAgent
      );

      res.status(200).json({
        success: true,
        message: 'Account activated successfully.',
        token: result.token,
        user: result.admin,
        permissions: result.admin.permissions,
        role: result.admin.role,
        data: result.admin
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/v1/admin/auth/logout
   * Record admin logout audit
   */
  public logout = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const adminId = req.user?.id || '';
      const email = req.user?.email || '';
      const role = req.user?.role || 'ADMIN';
      const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '';
      const userAgent = req.headers['user-agent'] || '';

      if (adminId) {
        await this.service.logout(adminId, email, role, ipAddress, userAgent);
      }

      this.sendSuccess(res, 'Logged out successfully.', { success: true });
    } catch (error) {
      next(error);
    }
  };
}

export const adminAuthController = new AdminAuthController();
export default adminAuthController;

