import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware';
import { ForbiddenError } from '../errors';
import { AdminModel } from '../models/admin.model';

/**
 * Middleware ensuring that the Super Admin account cannot be modified,
 * deleted, demoted, disabled, or banned by any other admin or staff member.
 */
export const protectSuperAdmin = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const targetAdminId = req.params.id || req.params.adminId;
    const actor = req.user;

    if (!targetAdminId) {
      return next();
    }

    const targetAdmin = await AdminModel.findById(targetAdminId).lean().exec();

    if (!targetAdmin) {
      return next();
    }

    // Check if the target is a Super Admin
    if (targetAdmin.role === 'SUPER_ADMIN') {
      // Deletion is strictly prohibited for the Super Admin
      if (req.method === 'DELETE') {
        throw new ForbiddenError(
          'Security Violation: The primary Super Admin account cannot be deleted.'
        );
      }

      // Demotion, banning, or status alteration is prohibited
      if (req.body?.role && req.body.role !== 'SUPER_ADMIN') {
        throw new ForbiddenError(
          'Security Violation: The Super Admin account cannot be demoted.'
        );
      }

      if (req.body?.status && req.body.status !== 'ACTIVE') {
        throw new ForbiddenError(
          'Security Violation: The Super Admin account cannot be suspended or deactivated.'
        );
      }

      // Only the Super Admin themselves can edit their own profile
      if (actor && actor.id !== targetAdmin._id.toString()) {
        throw new ForbiddenError(
          'Security Violation: Only the Super Admin can edit their own profile.'
        );
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};

export default protectSuperAdmin;
