import jwt, { SignOptions, Secret } from 'jsonwebtoken';
import { jwtConfig } from '../config/jwt.config';
import { UserRole } from '../constants/roles';

export interface TokenPayload {
  sub: string; // User/Admin/Store ID
  email: string;
  role: UserRole;
  storeId?: string;
  permissions?: string[];
  [key: string]: any;
}

export const jwtUtils = {
  /**
   * Generate signed JWT access token
   */
  generateToken(
    payload: TokenPayload,
    expiresIn: string | number = jwtConfig.expiresIn
  ): string {
    const options: SignOptions = {
      expiresIn: expiresIn as any,
      issuer: jwtConfig.issuer,
      audience: jwtConfig.audience
    };

    return jwt.sign(payload, jwtConfig.secret as Secret, options);
  },

  /**
   * Verify and decode JWT token
   */
  verifyToken<T extends TokenPayload = TokenPayload>(token: string): T {
    return jwt.verify(token, jwtConfig.secret as Secret, {
      issuer: jwtConfig.issuer,
      audience: jwtConfig.audience
    }) as T;
  }
};

export default jwtUtils;
