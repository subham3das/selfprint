export const ROLES = {
  SUPER_ADMIN: 'SuperAdmin',
  ADMIN: 'Admin',
  STAFF: 'Staff',
  STORE: 'Store',
  USER: 'User',
  GUEST: 'Guest'
} as const;

export type UserRole = (typeof ROLES)[keyof typeof ROLES];

export const ALL_ROLES: UserRole[] = Object.values(ROLES);
