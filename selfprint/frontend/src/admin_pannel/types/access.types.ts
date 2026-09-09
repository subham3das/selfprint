export type StaffRole =
  | 'Super Admin'
  | 'Admin'
  | 'Manager'
  | 'Finance'
  | 'Operations'
  | 'Support';

export type StaffStatus =
  | 'Active'
  | 'Inactive'
  | 'Suspended'
  | 'Pending Invitation';

export type PermissionModule =
  | 'Dashboard'
  | 'Stores'
  | 'Users'
  | 'Transactions'
  | 'Revenue'
  | 'Printers'
  | 'Support'
  | 'Analytics'
  | 'Settings'
  | 'Access Control'
  | 'Audit Logs'
  | 'System Configuration';

export type PermissionAction =
  | 'view'
  | 'create'
  | 'edit'
  | 'delete'
  | 'export'
  | 'approve'
  | 'manage';

export type ModulePermission = Record<PermissionAction, boolean>;

export type StaffPermissions = Record<PermissionModule, ModulePermission>;

export const PERMISSION_MODULES: PermissionModule[] = [
  'Dashboard',
  'Stores',
  'Users',
  'Transactions',
  'Revenue',
  'Printers',
  'Support',
  'Analytics',
  'Settings',
  'Access Control',
  'Audit Logs',
  'System Configuration'
];

export const PERMISSION_ACTIONS: { id: PermissionAction; label: string }[] = [
  { id: 'view', label: 'View' },
  { id: 'create', label: 'Create' },
  { id: 'edit', label: 'Edit' },
  { id: 'delete', label: 'Delete' },
  { id: 'export', label: 'Export' },
  { id: 'approve', label: 'Approve' },
  { id: 'manage', label: 'Manage' }
];

export const SUPER_ADMIN_EMAIL = 'das01subhamj@gmail.com';

export const createSuperAdminPermissions = (): StaffPermissions => {
  const perms = {} as StaffPermissions;
  PERMISSION_MODULES.forEach((mod) => {
    perms[mod] = {
      view: true,
      create: true,
      edit: true,
      delete: true,
      export: true,
      approve: true,
      manage: true
    };
  });
  return perms;
};

export const createRolePermissions = (role: StaffRole): StaffPermissions => {
  if (role === 'Super Admin') return createSuperAdminPermissions();

  const perms = {} as StaffPermissions;
  PERMISSION_MODULES.forEach((mod) => {
    let view = false;
    let create = false;
    let edit = false;
    let del = false;
    let exp = false;
    let approve = false;
    let manage = false;

    if (role === 'Admin') {
      view = true;
      create = true;
      edit = true;
      del = mod !== 'Access Control' && mod !== 'System Configuration';
      exp = true;
      approve = true;
      manage = mod !== 'Access Control';
    } else if (role === 'Manager') {
      view = mod !== 'Access Control' && mod !== 'System Configuration' && mod !== 'Settings';
      create = mod === 'Stores' || mod === 'Printers' || mod === 'Support';
      edit = mod === 'Stores' || mod === 'Printers' || mod === 'Support';
      del = false;
      exp = mod === 'Revenue' || mod === 'Transactions' || mod === 'Analytics';
      approve = mod === 'Stores';
      manage = false;
    } else if (role === 'Finance') {
      view = mod === 'Dashboard' || mod === 'Transactions' || mod === 'Revenue' || mod === 'Analytics';
      create = false;
      edit = mod === 'Transactions';
      del = false;
      exp = true;
      approve = mod === 'Transactions' || mod === 'Revenue';
      manage = false;
    } else if (role === 'Operations') {
      view = mod === 'Dashboard' || mod === 'Stores' || mod === 'Printers' || mod === 'Users';
      create = mod === 'Stores' || mod === 'Printers';
      edit = mod === 'Stores' || mod === 'Printers';
      del = false;
      exp = true;
      approve = mod === 'Stores';
      manage = mod === 'Printers';
    } else if (role === 'Support') {
      view = mod === 'Dashboard' || mod === 'Support' || mod === 'Users' || mod === 'Transactions';
      create = mod === 'Support';
      edit = mod === 'Support';
      del = false;
      exp = false;
      approve = false;
      manage = false;
    }

    perms[mod] = { view, create, edit, delete: del, export: exp, approve, manage };
  });

  return perms;
};

export interface StaffMember {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  avatarBg: string;
  avatarText: string;
  role: StaffRole;
  department: string;
  status: StaffStatus;
  lastLogin: string;
  createdAt: string;
  createdBy: string;
  isSuperAdmin?: boolean;
  isActivated?: boolean;
  inviteToken?: string;
  inviteExpiresAt?: string | Date;
  emailStatus?: string;
  permissions: StaffPermissions;
}


export interface AccessStatsData {
  totalStaff: number;
  activeStaff: number;
  admins: number;
  managers: number;
  supportStaff: number;
  pendingInvites: number;
}

export interface AccessFiltersState {
  searchQuery: string;
  role: string;
  status: string;
  department: string;
}

export interface InviteStaffFormValues {
  fullName: string;
  email: string;
  phone: string;
  role: StaffRole;
  department: string;
  sendEmailInvite: boolean;
  generateTempPassword: boolean;
  permissions: StaffPermissions;
}

export interface EditStaffFormValues {
  id: string;
  fullName: string;
  phone: string;
  role: StaffRole;
  department: string;
  status: StaffStatus;
  permissions: StaffPermissions;
}

export interface AccessAuditLog {
  id: string;
  timestamp: string;
  actorName: string;
  actorEmail: string;
  action:
    | 'User Created'
    | 'Permission Changed'
    | 'Role Changed'
    | 'User Deleted'
    | 'User Suspended'
    | 'User Activated'
    | 'Password Reset'
    | 'Login'
    | 'Logout'
    | 'Failed Login';
  targetEmail: string;
  module?: string;
  details: string;
  ipAddress: string;
  status: 'Success' | 'Warning' | 'Failed';
}
