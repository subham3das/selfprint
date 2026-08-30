export const PERMISSION_MODULES = {
  DASHBOARD: 'Dashboard',
  STORES: 'Stores',
  USERS: 'Users',
  TRANSACTIONS: 'Transactions',
  REVENUE: 'Revenue',
  PRINTERS: 'Printers',
  SUPPORT: 'Support',
  ANALYTICS: 'Analytics',
  SETTINGS: 'Settings',
  ACCESS_CONTROL: 'Access Control',
  AUDIT_LOGS: 'Audit Logs',
  SYSTEM_CONFIG: 'System Configuration'
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
