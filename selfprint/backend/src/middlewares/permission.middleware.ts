import { Request, Response, NextFunction } from 'express';
import { rbacManager } from '../permissions/rbac';
import { ApiResponse } from '../responses/ApiResponse';
import { HTTP_STATUS } from '../constants/httpStatusCodes';
import { ERROR_CODES } from '../constants/errorCodes';

/**
 * Enterprise RBAC Authorization Middleware
 * Super Admin has complete unrestricted access (A-Z) to every module and action.
 */
export const authorize = (module: string, action: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return ApiResponse.error(
        res,
        'Authentication required. Please login to access this resource.',
        HTTP_STATUS.UNAUTHORIZED,
        ERROR_CODES.UNAUTHORIZED
      );
    }

    const superAdminEmail = (process.env.SUPER_ADMIN_EMAIL || 'das01subhamj@gmail.com').toLowerCase().trim();
    const cleanEmail = (user.email || '').toLowerCase().trim();
    const cleanRole = (user.role || '').toUpperCase().trim();

    // 1. Super Admin Unrestricted Bypass: A-Z Full Platform Access
    if (
      cleanEmail === superAdminEmail ||
      cleanEmail === 'das01subhamj@gmail.com' ||
      cleanEmail.includes('das01subhamj') ||
      cleanRole === 'SUPER_ADMIN' ||
      cleanRole === 'SUPER ADMIN' ||
      cleanRole === 'SUPERADMIN' ||
      cleanRole.includes('SUPER')
    ) {
      return next();
    }

    // 2. Check if user has FULL_ACCESS flag in permissions
    if (Array.isArray(user.permissions)) {
      if (
        user.permissions.includes('FULL_ACCESS') ||
        user.permissions.includes('*') ||
        user.permissions.includes('all')
      ) {
        return next();
      }
    }


    // 3. Granular RBAC evaluation for non-super-admin staff
    const hasAccess = rbacManager.hasPermission({
      userRole: user.role,
      userEmail: user.email,
      userPermissions: user.permissions,
      module,
      action
    });

    if (!hasAccess) {
      return ApiResponse.error(
        res,
        `Access Forbidden: You do not have '${action}' permission for '${module}'.`,
        HTTP_STATUS.FORBIDDEN,
        ERROR_CODES.FORBIDDEN
      );
    }

    next();
  };
};

export const requirePermission = authorize;

export default authorize;
