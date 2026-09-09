export const PERMISSION_MODULES = {
  DASHBOARD: 'dashboard',
  STORES: 'stores',
  USERS: 'users',
  TRANSACTIONS: 'transactions',
  REVENUE: 'revenue',
  PRINTERS: 'printers',
  SUPPORT: 'support',
  ANALYTICS: 'analytics',
  SETTINGS: 'settings',
  ACCESS: 'access',
  AUDIT: 'audit',
  SYSTEM: 'system'
} as const;

export type PermissionModule =
  (typeof PERMISSION_MODULES)[keyof typeof PERMISSION_MODULES];

export const PERMISSION_ACTIONS = {
  VIEW: 'view',
  CREATE: 'create',
  EDIT: 'edit',
  DELETE: 'delete',
  EXPORT: 'export',
  APPROVE: 'approve',
  MANAGE: 'manage'
} as const;

export type PermissionAction =
  (typeof PERMISSION_ACTIONS)[keyof typeof PERMISSION_ACTIONS];

/**
 * Standard O(1) Object-based Permission Matrix
 * Example: { stores: { view: true, create: true, edit: false, delete: false, approve: true } }
 */
export type PermissionMatrix = Record<string, Record<string, boolean>>;

/**
 * Full Access Template (Used by Super Admin and Admin default)
 */
export const FULL_ACCESS_PERMISSIONS: PermissionMatrix = {
  dashboard: { view: true },
  stores: { view: true, create: true, edit: true, delete: true, export: true, approve: true, manage: true },
  users: { view: true, create: true, edit: true, delete: true, export: true, manage: true },
  transactions: { view: true, export: true, manage: true },
  revenue: { view: true, export: true, manage: true },
  printers: { view: true, create: true, edit: true, delete: true, approve: true, manage: true },
  support: { view: true, create: true, edit: true, delete: true, manage: true },
  analytics: { view: true, export: true },
  settings: { view: true, edit: true, manage: true },
  access: { view: true, create: true, edit: true, delete: true, manage: true },
  audit: { view: true, export: true },
  system: { view: true, edit: true, manage: true }
};

/**
 * Role-Based Default Permission Templates
 */
export const ROLE_DEFAULT_PERMISSIONS: Record<string, PermissionMatrix> = {
  SUPER_ADMIN: FULL_ACCESS_PERMISSIONS,
  'Super Admin': FULL_ACCESS_PERMISSIONS,

  ADMIN: {
    dashboard: { view: true },
    stores: { view: true, create: true, edit: true, delete: false, export: true, approve: true, manage: true },
    users: { view: true, create: true, edit: true, delete: false, export: true, manage: true },
    transactions: { view: true, export: true, manage: true },
    revenue: { view: true, export: true, manage: false },
    printers: { view: true, create: true, edit: true, delete: false, approve: true, manage: true },
    support: { view: true, create: true, edit: true, delete: false, manage: true },
    analytics: { view: true, export: true },
    settings: { view: true, edit: false, manage: false },
    access: { view: true, create: true, edit: true, delete: false, manage: false },
    audit: { view: true, export: true },
    system: { view: false, edit: false, manage: false }
  },
  Admin: {
    dashboard: { view: true },
    stores: { view: true, create: true, edit: true, delete: false, export: true, approve: true, manage: true },
    users: { view: true, create: true, edit: true, delete: false, export: true, manage: true },
    transactions: { view: true, export: true, manage: true },
    revenue: { view: true, export: true, manage: false },
    printers: { view: true, create: true, edit: true, delete: false, approve: true, manage: true },
    support: { view: true, create: true, edit: true, delete: false, manage: true },
    analytics: { view: true, export: true },
    settings: { view: true, edit: false, manage: false },
    access: { view: true, create: true, edit: true, delete: false, manage: false },
    audit: { view: true, export: true },
    system: { view: false, edit: false, manage: false }
  },

  MANAGER: {
    dashboard: { view: true },
    stores: { view: true, create: true, edit: true, delete: false, export: true, approve: true, manage: true },
    users: { view: true, create: false, edit: false, delete: false, export: false },
    transactions: { view: true, export: true },
    revenue: { view: true, export: false },
    printers: { view: true, create: false, edit: true, delete: false, approve: true, manage: true },
    support: { view: true, create: true, edit: true, delete: false, manage: true },
    analytics: { view: true, export: false },
    settings: { view: false },
    access: { view: false },
    audit: { view: false },
    system: { view: false }
  },
  Manager: {
    dashboard: { view: true },
    stores: { view: true, create: true, edit: true, delete: false, export: true, approve: true, manage: true },
    users: { view: true, create: false, edit: false, delete: false, export: false },
    transactions: { view: true, export: true },
    revenue: { view: true, export: false },
    printers: { view: true, create: false, edit: true, delete: false, approve: true, manage: true },
    support: { view: true, create: true, edit: true, delete: false, manage: true },
    analytics: { view: true, export: false },
    settings: { view: false },
    access: { view: false },
    audit: { view: false },
    system: { view: false }
  },

  FINANCE: {
    dashboard: { view: true },
    stores: { view: true, create: false, edit: false, delete: false, export: true, approve: false },
    users: { view: false },
    transactions: { view: true, export: true, manage: true },
    revenue: { view: true, export: true, manage: true },
    printers: { view: false },
    support: { view: false },
    analytics: { view: true, export: true },
    settings: { view: false },
    access: { view: false },
    audit: { view: true, export: true },
    system: { view: false }
  },
  Finance: {
    dashboard: { view: true },
    stores: { view: true, create: false, edit: false, delete: false, export: true, approve: false },
    users: { view: false },
    transactions: { view: true, export: true, manage: true },
    revenue: { view: true, export: true, manage: true },
    printers: { view: false },
    support: { view: false },
    analytics: { view: true, export: true },
    settings: { view: false },
    access: { view: false },
    audit: { view: true, export: true },
    system: { view: false }
  },

  OPERATIONS: {
    dashboard: { view: true },
    stores: { view: true, create: true, edit: true, delete: false, approve: true },
    users: { view: true, create: false, edit: false, delete: false },
    transactions: { view: true, export: false },
    revenue: { view: false },
    printers: { view: true, create: true, edit: true, delete: false, approve: true, manage: true },
    support: { view: true, create: true, edit: true, delete: false, manage: true },
    analytics: { view: false },
    settings: { view: false },
    access: { view: false },
    audit: { view: false },
    system: { view: false }
  },
  Operations: {
    dashboard: { view: true },
    stores: { view: true, create: true, edit: true, delete: false, approve: true },
    users: { view: true, create: false, edit: false, delete: false },
    transactions: { view: true, export: false },
    revenue: { view: false },
    printers: { view: true, create: true, edit: true, delete: false, approve: true, manage: true },
    support: { view: true, create: true, edit: true, delete: false, manage: true },
    analytics: { view: false },
    settings: { view: false },
    access: { view: false },
    audit: { view: false },
    system: { view: false }
  },

  SUPPORT: {
    dashboard: { view: true },
    stores: { view: true, create: false, edit: false, delete: false, approve: false },
    users: { view: true, create: false, edit: false, delete: false },
    transactions: { view: true, export: false },
    revenue: { view: false },
    printers: { view: true, create: false, edit: false, delete: false, approve: false, manage: false },
    support: { view: true, create: true, edit: true, delete: false, manage: true },
    analytics: { view: false },
    settings: { view: false },
    access: { view: false },
    audit: { view: false },
    system: { view: false }
  },
  Support: {
    dashboard: { view: true },
    stores: { view: true, create: false, edit: false, delete: false, approve: false },
    users: { view: true, create: false, edit: false, delete: false },
    transactions: { view: true, export: false },
    revenue: { view: false },
    printers: { view: true, create: false, edit: false, delete: false, approve: false, manage: false },
    support: { view: true, create: true, edit: true, delete: false, manage: true },
    analytics: { view: false },
    settings: { view: false },
    access: { view: false },
    audit: { view: false },
    system: { view: false }
  }
};
