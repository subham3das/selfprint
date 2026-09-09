import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { UnauthorizedError } from '../errors';
import { jwtUtils } from '../utils/jwt';
import { AuthenticatedUser } from '../auth/auth.interface';
import { AdminModel } from '../models/admin.model';
import { FULL_ACCESS_PERMISSIONS } from '../constants/permissions';

export type AuthenticatedRequest = Request & {
  user?: AuthenticatedUser;
};

/**
 * Middleware to authenticate requests via Bearer JWT token
 */
export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(
      new UnauthorizedError(
        'Authentication required. Please provide a valid Bearer token.'
      )
    );
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded: any = jwtUtils.verifyToken(token);
    let email = (decoded.email || decoded.user?.email || '').toLowerCase().trim();
    let role = (decoded.role || decoded.user?.role || '').toUpperCase().trim();
    const id = decoded.sub || decoded.id || decoded.userId || decoded._id;

    const superAdminEmail = (process.env.SUPER_ADMIN_EMAIL || 'das01subhamj@gmail.com').toLowerCase().trim();

    // If ID is available, hydrate authentic user details from database
    if (id && mongoose.Types.ObjectId.isValid(id)) {
      try {
        const adminDoc = await AdminModel.findById(id).lean();
        if (adminDoc) {
          if (adminDoc.email) {
            email = adminDoc.email.toLowerCase().trim();
          }
          if (adminDoc.role) {
            role = adminDoc.role.toUpperCase().trim();
          }
        }
      } catch {
        // Fallback silently to decoded values
      }
    }

    const isSuper =
      email === superAdminEmail ||
      email === 'das01subhamj@gmail.com' ||
      role === 'SUPER_ADMIN' ||
      role === 'SUPER ADMIN' ||
      role === 'SUPERADMIN' ||
      role.includes('SUPER');

    if (isSuper) {
      role = 'SUPER_ADMIN';
    }

    const user: AuthenticatedUser = {
      id,
      email,
      role,
      storeId: decoded.storeId,
      permissions: isSuper ? FULL_ACCESS_PERMISSIONS : (decoded.permissions || decoded.user?.permissions || [])
    };

    req.user = user;
    next();

  } catch (error) {
    next(error);
  }
};

export default authenticate;

