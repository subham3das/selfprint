import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '../errors';
import { jwtUtils } from '../utils/jwt';
import { AuthenticatedUser } from '../auth/auth.interface';

/**
 * Middleware to authenticate requests via Bearer JWT token
 */
export const authenticate = (
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
    const decoded = jwtUtils.verifyToken(token);
    const user: AuthenticatedUser = {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role,
      storeId: decoded.storeId,
      permissions: decoded.permissions || []
    };

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

export default authenticate;
