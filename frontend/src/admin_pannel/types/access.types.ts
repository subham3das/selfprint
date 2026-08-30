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
