import { StaffRole, StaffStatus, StaffPermissions } from '../../../models/staff.model';

export interface AccessStatsResponse {
  totalStaff: number;
  activeStaff: number;
  admins: number;
  managers: number;
  supportStaff: number;
  pendingInvites: number;
}

export interface StaffItemDTO {
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


export interface AccessListResponse {
  staffList: StaffItemDTO[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface GetStaffQuery {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
  department?: string;
}

export interface InviteStaffInput {
  fullName: string;
  email: string;
  phone?: string;
  role: StaffRole;
  department: string;
  sendEmailInvite?: boolean;
  generateTempPassword?: boolean;
  permissions: StaffPermissions;
}

export interface EditStaffInput {
  fullName: string;
  phone?: string;
  role: StaffRole;
  department: string;
  status: StaffStatus;
  permissions: StaffPermissions;
}

export interface AccessFiltersResponse {
  roles: string[];
  departments: string[];
  statuses: string[];
}

export interface AccessAuditLogDTO {
  id: string;
  timestamp: string;
  actorName: string;
  actorEmail: string;
  action: string;
  targetEmail: string;
  details: string;
  ipAddress: string;
  status: 'Success' | 'Warning' | 'Failed';
}
