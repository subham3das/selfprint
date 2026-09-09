import crypto from 'crypto';
import mongoose from 'mongoose';
import { AdminModel, IAdmin, AdminRole, AdminStatus } from '../../../models/admin.model';
import { StaffInvitationModel } from '../../../models/invitation.model';
import { AuditLogModel } from '../../../models/auditLog.model';
import { socketManager } from '../../../socket';
import { emailService } from '../../../services/email.service';
import { env } from '../../../config/environment';
import { NotFoundError, ValidationError, ConflictError } from '../../../errors';
import {
  AccessStatsResponse,
  StaffItemDTO,
  AccessListResponse,
  GetStaffQuery,
  InviteStaffInput,
  EditStaffInput,
  AccessFiltersResponse,
  AccessAuditLogDTO
} from './access.types';
import { StaffRole, StaffStatus, StaffPermissions, PermissionModule } from '../../../models/staff.model';
import { rbacManager } from '../../../permissions/rbac';
import { logger } from '../../../utils/logger';



const PERMISSION_MODULES: PermissionModule[] = [
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

export const createFullPermissions = (): StaffPermissions => {
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

export const createRolePermissionsMatrix = (role: string): StaffPermissions => {
  const normalized = normalizeRole(role);
  if (normalized === 'Super Admin') return createFullPermissions();

  const perms = {} as StaffPermissions;
  PERMISSION_MODULES.forEach((mod) => {
    let view = false;
    let create = false;
    let edit = false;
    let del = false;
    let exp = false;
    let approve = false;
    let manage = false;

    if (normalized === 'Admin') {
      view = true;
      create = true;
      edit = true;
      del = mod !== 'Access Control' && mod !== 'System Configuration';
      exp = true;
      approve = true;
      manage = mod !== 'Access Control';
    } else if (normalized === 'Manager') {
      view = mod !== 'Access Control' && mod !== 'System Configuration' && mod !== 'Settings';
      create = mod === 'Stores' || mod === 'Printers' || mod === 'Support';
      edit = mod === 'Stores' || mod === 'Printers' || mod === 'Support';
      del = false;
      exp = mod === 'Revenue' || mod === 'Transactions' || mod === 'Analytics';
      approve = mod === 'Stores';
      manage = false;
    } else if (normalized === 'Finance') {
      view = mod === 'Dashboard' || mod === 'Transactions' || mod === 'Revenue' || mod === 'Analytics';
      create = false;
      edit = mod === 'Transactions';
      del = false;
      exp = true;
      approve = mod === 'Transactions' || mod === 'Revenue';
      manage = false;
    } else if (normalized === 'Operations') {
      view = mod === 'Dashboard' || mod === 'Stores' || mod === 'Printers' || mod === 'Users';
      create = mod === 'Stores' || mod === 'Printers';
      edit = mod === 'Stores' || mod === 'Printers';
      del = false;
      exp = true;
      approve = mod === 'Stores';
      manage = mod === 'Printers';
    } else if (normalized === 'Support') {
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

export class AdminAccessService {
  /**
   * 1. 6 KPI Cards Aggregation from selfprint.admins
   */
  public async getStats(): Promise<AccessStatsResponse> {
    const [totalStaff, activeStaff, admins, managers, supportStaff, pendingInvites] =
      await Promise.all([
        AdminModel.countDocuments({ isDeleted: { $ne: true } }),
        AdminModel.countDocuments({
          isDeleted: { $ne: true },
          status: { $in: ['ACTIVE', 'Active'] }
        }),
        AdminModel.countDocuments({
          isDeleted: { $ne: true },
          role: { $in: ['SUPER_ADMIN', 'ADMIN', 'Super Admin', 'Admin'] }
        }),
        AdminModel.countDocuments({
          isDeleted: { $ne: true },
          role: { $in: ['MANAGER', 'Manager'] }
        }),
        AdminModel.countDocuments({
          isDeleted: { $ne: true },
          role: { $in: ['SUPPORT', 'Support', 'STAFF'] }
        }),
        AdminModel.countDocuments({
          isDeleted: { $ne: true },
          status: { $in: ['PENDING', 'Pending Invitation'] }
        })
      ]);

    return {
      totalStaff,
      activeStaff,
      admins,
      managers,
      supportStaff,
      pendingInvites
    };
  }

  /**
   * 2. Paginated, Searchable & Filtered Staff Ledger from selfprint.admins
   */
  public async getStaffList(query: GetStaffQuery): Promise<AccessListResponse> {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 10));
    const skip = (page - 1) * limit;

    const filter: any = { isDeleted: { $ne: true } };

    if (query.role && query.role !== 'All Roles') {
      const dbRoles = mapRoleToDb(query.role);
      filter.role = { $in: dbRoles };
    }

    if (query.status && query.status !== 'All Status') {
      const dbStatuses = mapStatusToDb(query.status);
      filter.status = { $in: dbStatuses };
    }

    if (query.department && query.department !== 'All Departments') {
      filter.department = query.department;
    }

    if (query.search && query.search.trim()) {
      const regex = new RegExp(query.search.trim(), 'i');
      filter.$or = [
        { name: regex },
        { displayName: regex },
        { email: regex },
        { phone: regex },
        { department: regex },
        { role: regex }
      ];
    }

    const [total, adminDocs] = await Promise.all([
      AdminModel.countDocuments(filter),
      AdminModel.find(filter)
        .sort({ role: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
    ]);

    const mappedStaff: StaffItemDTO[] = adminDocs.map((s: any) => this.mapAdminToDTO(s));

    return {
      staffList: mappedStaff,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit) || 1
      }
    };
  }

  /**
   * 3. Single Staff Details
   */
  public async getStaffById(id: string): Promise<StaffItemDTO> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('Invalid Staff ID format');
    }

    const adminDoc = await AdminModel.findOne({ _id: id, isDeleted: { $ne: true } }).lean();
    if (!adminDoc) {
      throw new Error('Staff member not found');
    }

    return this.mapAdminToDTO(adminDoc);
  }

  /**
   * 4. Invite / Create Staff Member in selfprint.admins
   */
  /**
   * 4. Invite / Create Staff Member in selfprint.admins & Dispatch Email
   */
  public async inviteStaff(
    input: InviteStaffInput,
    actorEmail: string = 'das01subhamj@gmail.com',
    ipAddress: string = '127.0.0.1',
    userAgent: string = ''
  ): Promise<StaffItemDTO> {
    const existing = await AdminModel.findOne({
      email: input.email.toLowerCase().trim(),
      isDeleted: { $ne: true }
    });

    if (existing) {
      throw new ConflictError(`A staff account with email "${input.email}" already exists.`);
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours

    const dbRole: AdminRole = (mapRoleToDb(input.role)[0] || 'ADMIN') as AdminRole;
    const dbStatus: AdminStatus = (input.sendEmailInvite ? 'PENDING' : 'ACTIVE') as AdminStatus;

    // Resolve O(1) object permissions from input or role template
    const resolvedPermissions = rbacManager.resolvePermissions(input.role, input.permissions);

    const newAdmin: any = await AdminModel.create({
      name: input.fullName.trim(),
      displayName: input.fullName.trim(),
      email: input.email.toLowerCase().trim(),
      phone: input.phone || '',
      department: input.department || 'Platform Operations',
      designation: 'Staff Member',
      role: dbRole,
      status: dbStatus,
      isActivated: !input.sendEmailInvite,
      permissions: resolvedPermissions,
      createdBy: actorEmail,
      inviteToken: token,
      inviteExpiresAt: expiresAt,
      inviteSentAt: new Date(),
      emailStatus: input.sendEmailInvite ? 'PENDING' : 'SENT',
      invitationToken: token,
      invitationExpiresAt: expiresAt
    });

    // Record Invitation
    await StaffInvitationModel.create({
      email: newAdmin.email,
      fullName: newAdmin.name,
      phone: newAdmin.phone,
      role: input.role,
      department: newAdmin.department,
      token,
      invitedBy: actorEmail,
      expiresAt,
      status: 'PENDING',
      permissions: resolvedPermissions
    });

    // Send Invitation Email if sendEmailInvite is true
    if (input.sendEmailInvite) {
      const activationUrl = `${env.FRONTEND_URL}/admin/activate?token=${token}`;
      try {
        await emailService.sendStaffInvitation({
          name: newAdmin.name,
          email: newAdmin.email,
          role: input.role,
          department: newAdmin.department,
          invitedBy: actorEmail === 'das01subhamj@gmail.com' ? 'Super Admin' : actorEmail,
          activationUrl,
          expiresHours: 48
        });
        newAdmin.emailStatus = 'SENT';
        await newAdmin.save();
      } catch (emailErr: any) {
        newAdmin.emailStatus = 'FAILED';
        await newAdmin.save();
        logger.error(`Failed to send invitation email to ${newAdmin.email}:`, emailErr);
        throw new Error(`Staff created, but failed to deliver invitation email: ${emailErr.message}`);
      }
    }

    // Log Audit Trail
    await AuditLogModel.create({
      action: 'STAFF_INVITED',
      module: 'Access Control',
      severity: 'Info',
      status: 'Completed',
      riskLevel: 'Low',
      actorName: actorEmail === 'das01subhamj@gmail.com' ? 'Super Admin' : 'Admin',
      actorEmail,
      actorRole: 'SUPER_ADMIN',
      targetEntity: 'STAFF',
      targetResource: 'Staff Directory',
      targetId: String(newAdmin._id),
      description: `Invited new staff member ${newAdmin.name} (${input.role}) to ${newAdmin.department}.`,
      ipAddress,
      userAgent,
      details: {
        changedBy: actorEmail,
        changedUser: newAdmin.email,
        newPermissions: resolvedPermissions,
        emailStatus: newAdmin.emailStatus,
        time: new Date()
      }
    });

    try {
      socketManager.emitToStore('admin', 'STAFF_INVITED', {
        id: String(newAdmin._id),
        email: newAdmin.email
      });
    } catch {
      // Socket offline
    }

    return this.mapAdminToDTO(newAdmin);
  }

  /**
   * Resend Invitation Email to a pending staff member
   */
  public async resendInvitation(
    id: string,
    actorEmail: string = 'das01subhamj@gmail.com',
    ipAddress: string = '127.0.0.1',
    userAgent: string = ''
  ): Promise<StaffItemDTO> {
    const admin = await AdminModel.findOne({
      _id: id,
      isDeleted: { $ne: true }
    });

    if (!admin) {
      throw new NotFoundError('Staff account not found.');
    }

    if (admin.isActivated || admin.status === 'ACTIVE') {
      throw new ConflictError('This staff member has already activated their account.');
    }

    const newToken = crypto.randomBytes(32).toString('hex');
    const newExpiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours

    admin.inviteToken = newToken;
    admin.invitationToken = newToken;
    admin.inviteExpiresAt = newExpiresAt;
    admin.invitationExpiresAt = newExpiresAt;
    admin.inviteSentAt = new Date();
    admin.emailStatus = 'PENDING';
    admin.status = 'PENDING';
    await admin.save();

    await StaffInvitationModel.findOneAndUpdate(
      { email: admin.email, status: 'PENDING' },
      {
        token: newToken,
        expiresAt: newExpiresAt,
        invitedBy: actorEmail,
        createdAt: new Date()
      },
      { upsert: true }
    );

    const activationUrl = `${env.FRONTEND_URL}/admin/activate?token=${newToken}`;
    try {
      await emailService.sendStaffInvitation({
        name: admin.name,
        email: admin.email,
        role: admin.role,
        department: admin.department || 'Platform Operations',
        invitedBy: actorEmail === 'das01subhamj@gmail.com' ? 'Super Admin' : actorEmail,
        activationUrl,
        expiresHours: 48
      });
      admin.emailStatus = 'SENT';
      await admin.save();
    } catch (emailErr: any) {
      admin.emailStatus = 'FAILED';
      await admin.save();
      throw new Error(`Failed to resend invitation email: ${emailErr.message}`);
    }

    // Audit Log
    await AuditLogModel.create({
      action: 'STAFF_INVITE_RESENT',
      module: 'Access Control',
      severity: 'Info',
      status: 'Completed',
      riskLevel: 'Low',
      actorName: actorEmail === 'das01subhamj@gmail.com' ? 'Super Admin' : 'Admin',
      actorEmail,
      actorRole: 'SUPER_ADMIN',
      targetEntity: 'STAFF',
      targetResource: 'Staff Directory',
      targetId: String(admin._id),
      description: `Resent invitation email to ${admin.name} (${admin.email}).`,
      ipAddress,
      userAgent
    });

    return this.mapAdminToDTO(admin);
  }

  /**
   * Cancel / Revoke a pending invitation
   */
  public async cancelInvitation(
    id: string,
    actorEmail: string = 'das01subhamj@gmail.com',
    ipAddress: string = '127.0.0.1',
    userAgent: string = ''
  ): Promise<void> {
    const admin = await AdminModel.findOne({
      _id: id,
      isDeleted: { $ne: true }
    });

    if (!admin) {
      throw new NotFoundError('Staff account not found.');
    }

    if (admin.isActivated || admin.status === 'ACTIVE') {
      throw new ValidationError('Cannot cancel an invitation for an active staff member.');
    }

    admin.isDeleted = true;
    admin.deletedAt = new Date();
    admin.deletedBy = actorEmail;
    admin.inviteToken = undefined;
    admin.invitationToken = undefined;
    await admin.save();

    await StaffInvitationModel.updateMany(
      { email: admin.email, status: 'PENDING' },
      { status: 'REVOKED' }
    );

    // Audit Log
    await AuditLogModel.create({
      action: 'STAFF_INVITE_CANCELLED',
      module: 'Access Control',
      severity: 'Warning',
      status: 'Completed',

      riskLevel: 'Low',
      actorName: actorEmail === 'das01subhamj@gmail.com' ? 'Super Admin' : 'Admin',
      actorEmail,
      actorRole: 'SUPER_ADMIN',
      targetEntity: 'STAFF',
      targetResource: 'Staff Directory',
      targetId: String(admin._id),
      description: `Cancelled invitation for ${admin.name} (${admin.email}).`,
      ipAddress,
      userAgent
    });
  }


  /**
   * 5. Edit Staff Profile & Permissions
   */
  public async updateStaff(
    id: string,
    input: EditStaffInput,
    actorEmail: string = 'das01subhamj@gmail.com',
    ipAddress: string = '127.0.0.1',
    userAgent: string = ''
  ): Promise<StaffItemDTO> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('Invalid Staff ID format');
    }

    const adminDoc = await AdminModel.findById(id);
    if (!adminDoc || adminDoc.isDeleted) {
      throw new Error('Staff member not found');
    }

    const isSuper = isSuperAdminUser(adminDoc);
    if (isSuper && input.role !== 'Super Admin') {
      throw new Error('Super Admin role cannot be modified.');
    }

    const oldPermissions = adminDoc.permissions;
    const resolvedPermissions = rbacManager.resolvePermissions(input.role, input.permissions);

    adminDoc.name = input.fullName.trim();
    adminDoc.displayName = input.fullName.trim();
    if (input.phone !== undefined) adminDoc.phone = input.phone;
    adminDoc.role = (mapRoleToDb(input.role)[0] || 'ADMIN') as AdminRole;
    adminDoc.department = input.department;
    adminDoc.status = (mapStatusToDb(input.status)[0] || 'ACTIVE') as AdminStatus;
    adminDoc.permissions = resolvedPermissions;
    adminDoc.deletedBy = actorEmail;

    await adminDoc.save();

    await AuditLogModel.create({
      action: 'PERMISSIONS_UPDATED',
      module: 'Access Control',
      severity: 'Warning',
      status: 'Completed',
      riskLevel: 'Medium',
      actorName: actorEmail === 'das01subhamj@gmail.com' ? 'Super Admin' : 'Admin',
      actorEmail,
      actorRole: 'SUPER_ADMIN',
      targetEntity: 'STAFF',
      targetResource: 'Staff Directory',
      targetId: String(adminDoc._id),
      description: `Updated permissions & profile for ${adminDoc.name} (${input.role}).`,
      ipAddress,
      userAgent,
      details: {
        changedBy: actorEmail,
        changedUser: adminDoc.email,
        oldPermissions,
        newPermissions: resolvedPermissions,
        time: new Date()
      }
    });


    try {
      socketManager.emitToStore('admin', 'STAFF_UPDATED', {
        id: String(adminDoc._id),
        email: adminDoc.email
      });
    } catch {
      // Socket offline
    }

    return this.mapAdminToDTO(adminDoc);
  }

  /**
   * 6. Toggle Status (Active <-> Suspended)

   */
  public async toggleStatus(id: string, actorEmail: string = 'superadmin@selfprint.com'): Promise<StaffItemDTO> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('Invalid Staff ID format');
    }

    const adminDoc = await AdminModel.findById(id);
    if (!adminDoc || adminDoc.isDeleted) {
      throw new Error('Staff member not found');
    }

    if (isSuperAdminUser(adminDoc)) {
      throw new Error('Super Admin account status cannot be modified.');
    }

    const currentStatus = normalizeStatus(adminDoc.status);
    const nextStatus: StaffStatus = currentStatus === 'Active' ? 'Suspended' : 'Active';
    adminDoc.status = (mapStatusToDb(nextStatus)[0] || 'ACTIVE') as AdminStatus;
    await adminDoc.save();

    await AuditLogModel.create({
      action: nextStatus === 'Active' ? 'User Activated' : 'User Suspended',
      module: 'Access Control',
      severity: nextStatus === 'Active' ? 'Success' : 'Warning',
      status: 'Completed',
      riskLevel: nextStatus === 'Active' ? 'Low' : 'Medium',
      actorName: 'Super Admin',
      actorEmail,
      actorRole: 'SUPER_ADMIN',
      targetResource: 'Staff Directory',
      targetId: String(adminDoc._id),
      description: `Changed account status for ${adminDoc.email} from ${currentStatus} to ${nextStatus}.`
    });

    try {
      socketManager.emitToStore('admin', 'STAFF_UPDATED', {
        id: String(adminDoc._id),
        status: nextStatus
      });
    } catch {
      // Socket offline
    }

    return this.mapAdminToDTO(adminDoc);
  }

  /**
   * 7. Soft Delete Staff
   */
  public async deleteStaff(id: string, actorEmail: string = 'superadmin@selfprint.com'): Promise<boolean> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('Invalid Staff ID format');
    }

    const adminDoc = await AdminModel.findById(id);
    if (!adminDoc || adminDoc.isDeleted) {
      throw new Error('Staff member not found');
    }

    if (isSuperAdminUser(adminDoc)) {
      throw new Error('Super Admin account cannot be deleted.');
    }

    adminDoc.isDeleted = true;
    adminDoc.deletedAt = new Date();
    await adminDoc.save();

    await AuditLogModel.create({
      action: 'User Deleted',
      module: 'Access Control',
      severity: 'Warning',
      status: 'Completed',
      riskLevel: 'Medium',
      actorName: 'Super Admin',
      actorEmail,
      actorRole: 'SUPER_ADMIN',
      targetResource: 'Staff Directory',
      targetId: String(adminDoc._id),
      description: `Deleted staff account ${adminDoc.name} (${adminDoc.email}).`
    });

    try {
      socketManager.emitToStore('admin', 'STAFF_DELETED', {
        id: String(adminDoc._id)
      });
    } catch {
      // Socket offline
    }

    return true;
  }

  /**
   * 8. Trigger Password Reset
   */
  public async resetPassword(id: string, actorEmail: string = 'superadmin@selfprint.com'): Promise<boolean> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('Invalid Staff ID format');
    }

    const adminDoc = await AdminModel.findById(id);
    if (!adminDoc || adminDoc.isDeleted) {
      throw new Error('Staff member not found');
    }

    await AuditLogModel.create({
      action: 'Password Reset',
      module: 'Access Control',
      severity: 'Info',
      status: 'Completed',
      riskLevel: 'Low',
      actorName: 'Super Admin',
      actorEmail,
      actorRole: 'SUPER_ADMIN',
      targetResource: 'Staff Directory',
      targetId: String(adminDoc._id),
      description: `Triggered temporary password reset link for ${adminDoc.email}.`
    });

    return true;
  }

  /**
   * 9. Filter Options (Roles, Departments, Statuses)
   */
  public async getFilters(): Promise<AccessFiltersResponse> {
    const [departments] = await Promise.all([
      AdminModel.distinct('department', { isDeleted: { $ne: true } })
    ]);

    const defaultDepts = [
      'Executive',
      'Platform Operations',
      'Operations',
      'Engineering',
      'Finance',
      'Customer Support',
      'IT'
    ];

    const uniqueDepts = Array.from(new Set([...defaultDepts, ...departments.filter(Boolean)])).sort();

    return {
      roles: ['All Roles', 'Super Admin', 'Admin', 'Manager', 'Finance', 'Operations', 'Support'],
      departments: ['All Departments', ...uniqueDepts],
      statuses: ['All Status', 'Active', 'Inactive', 'Suspended', 'Pending Invitation']
    };
  }

  /**
   * 10. Audit Logs
   */
  public async getAuditLogs(): Promise<AccessAuditLogDTO[]> {
    const logs = await AuditLogModel.find({
      $or: [{ targetEntity: 'STAFF' }, { module: 'Access Control' }]
    })
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    return logs.map((l: any) => ({
      id: String(l._id),
      timestamp: formatRelativeTime(l.createdAt),
      actorName: l.actorName || 'Super Admin',
      actorEmail: l.actorEmail || 'admin@selfprint.com',
      action: l.action,
      targetEmail: l.details?.targetEmail || 'Staff',
      details: l.description || '',
      ipAddress: l.ipAddress || '127.0.0.1',
      status: l.status === 'SUCCESS' || l.status === 'Completed' ? 'Success' : 'Failed'
    }));
  }

  private mapAdminToDTO(s: any): StaffItemDTO {
    const createdDate = s.createdAt ? new Date(s.createdAt) : new Date();
    const lastLoginStr = s.lastLogin
      ? formatRelativeTime(s.lastLogin)
      : 'Never';

    const isSuper = isSuperAdminUser(s);
    const roleNormalized = normalizeRole(s.role, isSuper);
    const statusNormalized = normalizeStatus(s.status);

    const displayName = s.displayName || s.name || 'Super Admin';
    const initials = displayName
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'SA';

    // Permissions: If super admin or full access, generate full matrix
    let permissions: StaffPermissions;
    if (isSuper || (Array.isArray(s.permissions) && s.permissions.includes('FULL_ACCESS'))) {
      permissions = createFullPermissions();
    } else if (s.permissions && typeof s.permissions === 'object' && !Array.isArray(s.permissions)) {
      permissions = s.permissions;
    } else {
      permissions = createRolePermissionsMatrix(roleNormalized);
    }

    return {
      id: String(s._id),
      fullName: displayName,
      email: s.email,
      phone: s.phone || '',
      avatarUrl: s.avatar || '',
      avatarBg: isSuper ? 'bg-purple-600' : 'bg-indigo-600',
      avatarText: initials,
      role: roleNormalized,
      department: s.department || (isSuper ? 'Executive Operations' : 'Platform Operations'),
      status: statusNormalized,
      lastLogin: lastLoginStr,
      createdAt: createdDate.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }),
      createdBy: s.createdBy ? String(s.createdBy) : 'Super Admin',
      isSuperAdmin: isSuper,
      isActivated: s.isActivated ?? (statusNormalized === 'Active'),
      inviteToken: s.inviteToken || s.invitationToken,
      inviteExpiresAt: s.inviteExpiresAt || s.invitationExpiresAt,
      emailStatus: s.emailStatus || (statusNormalized === 'Pending Invitation' ? 'SENT' : 'SENT'),
      permissions
    };
  }

}

function isSuperAdminUser(s: any): boolean {
  if (!s) return false;
  const roleStr = String(s.role || '').toUpperCase();
  const emailStr = String(s.email || '').toLowerCase();
  return (
    roleStr === 'SUPER_ADMIN' ||
    roleStr === 'SUPER ADMIN' ||
    emailStr === 'das01subhamj@gmail.com' ||
    s.isSuperAdmin === true
  );
}

function normalizeRole(role: string, isSuper: boolean = false): StaffRole {
  if (isSuper) return 'Super Admin';
  const upper = String(role || '').toUpperCase();
  if (upper.includes('SUPER')) return 'Super Admin';
  if (upper.includes('ADMIN')) return 'Admin';
  if (upper.includes('MANAGER')) return 'Manager';
  if (upper.includes('FINANCE')) return 'Finance';
  if (upper.includes('OPERATION')) return 'Operations';
  if (upper.includes('SUPPORT')) return 'Support';
  if (upper.includes('STAFF')) return 'Support';
  return 'Admin';
}

function normalizeStatus(status: string): StaffStatus {
  const upper = String(status || '').toUpperCase();
  if (upper === 'ACTIVE') return 'Active';
  if (upper === 'INACTIVE') return 'Inactive';
  if (upper === 'SUSPENDED') return 'Suspended';
  if (upper === 'PENDING' || upper.includes('INVIT')) return 'Pending Invitation';
  return 'Active';
}

function mapRoleToDb(role: string): string[] {
  const upper = String(role || '').toUpperCase();
  if (upper === 'SUPER ADMIN' || upper === 'SUPER_ADMIN') return ['SUPER_ADMIN', 'Super Admin'];
  if (upper === 'ADMIN') return ['ADMIN', 'Admin'];
  if (upper === 'MANAGER') return ['MANAGER', 'Manager'];
  if (upper === 'FINANCE') return ['FINANCE', 'Finance'];
  if (upper === 'OPERATIONS') return ['OPERATIONS', 'Operations'];
  if (upper === 'SUPPORT') return ['SUPPORT', 'Support', 'STAFF'];
  return [role];
}

function mapStatusToDb(status: string): string[] {
  const upper = String(status || '').toUpperCase();
  if (upper === 'ACTIVE') return ['ACTIVE', 'Active'];
  if (upper === 'INACTIVE') return ['INACTIVE', 'Inactive'];
  if (upper === 'SUSPENDED') return ['SUSPENDED', 'Suspended'];
  if (upper.includes('PENDING') || upper.includes('INVIT')) return ['PENDING', 'Pending Invitation'];
  return [status];
}

function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 2) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
}

export const adminAccessService = new AdminAccessService();
export default adminAccessService;
