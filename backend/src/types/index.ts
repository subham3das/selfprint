/**
 * Global backend types and interfaces
 */

export interface AuthenticatedUser {
  id: string;
  email: string;
  role?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}
