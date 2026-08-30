import { Request, Response, NextFunction } from 'express';
import { UserRole, ROLES } from '../constants/roles';
import { ForbiddenError, UnauthorizedError } from '../errors';

/**
 * Middleware to restrict endpoints to specific authorized roles
 */
export const requireRoles = (...allowedRoles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required.'));
    }

    // SuperAdmin always bypasses role restrictions
    if (req.user.role === ROLES.SUPER_ADMIN) {
      return next();
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ForbiddenError(
          `Access restricted to roles: [${allowedRoles.join(', ')}]. Your role is: ${req.user.role}.`
        )
      );
    }

    next();
  };
};

export default requireRoles;
