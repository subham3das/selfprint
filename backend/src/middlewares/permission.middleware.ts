import { Request, Response, NextFunction } from 'express';
import { PermissionModule, PermissionAction } from '../constants/permissions';
import { ForbiddenError, UnauthorizedError } from '../errors';
import { rbacManager } from '../permissions/rbac';

/**
 * Middleware ensuring current user possesses granular permissions for target module & action
 */
export const requirePermission = (
  module: PermissionModule,
  action: PermissionAction
) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required.'));
    }

    const hasAccess = rbacManager.hasPermission({
      userRole: req.user.role,
      userPermissions: req.user.permissions,
      module,
      action
    });

    if (!hasAccess) {
      return next(
        new ForbiddenError(
          `Permission denied: You do not have '${action}' permission on '${module}'.`
        )
      );
    }

    next();
  };
};

export default requirePermission;
