import { UserRole } from '../constants/roles';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
  storeId?: string;
  permissions?: string[];
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}
