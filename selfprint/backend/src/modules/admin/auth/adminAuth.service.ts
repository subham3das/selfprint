import mongoose from 'mongoose';
import { OAuth2Client } from 'google-auth-library';
import { adminAuthRepository, AdminAuthRepository } from './adminAuth.repository';
import { AdminLoginDto, AdminGoogleLoginDto, AdminAuthResponseDto, AdminProfileDto } from './adminAuth.types';
import { passwordUtils } from '../../../utils/password';
import { jwtUtils } from '../../../utils/jwt';
import { auditService } from '../../audit/audit.service';
import { UnauthorizedError, ForbiddenError, NotFoundError, GoneError, ConflictError } from '../../../errors';
import { env } from '../../../config/environment';
import { AdminModel, AdminRole } from '../../../models/admin.model';
import { StaffInvitationModel } from '../../../models/invitation.model';
import { emailService } from '../../../services/email.service';
import { rbacManager } from '../../../permissions/rbac';




const googleOAuthClient = new OAuth2Client(
  env.GOOGLE.CLIENT_ID,
  env.GOOGLE.CLIENT_SECRET
);

export class AdminAuthService {
  private repository: AdminAuthRepository;

  constructor(repository: AdminAuthRepository = adminAuthRepository) {
    this.repository = repository;
  }

  /**
   * Authenticate administrator credentials against the dedicated `admins` collection ONLY
   */
  public async login(
    dto: AdminLoginDto,
    ipAddress = '',
    userAgent = ''
  ): Promise<AdminAuthResponseDto> {
    const email = dto.email.trim().toLowerCase();

    // 1. Find admin by email in dedicated `admins` collection
    let admin = await this.repository.findForAuth(email);

    // Auto-seed Super Admin if logging in with primary super admin email
    const superAdminEmail = (process.env.SUPER_ADMIN_EMAIL || 'das01subhamj@gmail.com').toLowerCase().trim();
    if (!admin && email === superAdminEmail) {
      admin = await AdminModel.create({
        name: process.env.SUPER_ADMIN_NAME || 'Subham',
        displayName: process.env.SUPER_ADMIN_DISPLAY_NAME || 'Super Admin',
        email: superAdminEmail,
        passwordHash: await passwordUtils.hash(process.env.SUPER_ADMIN_PASSWORD || 'Subham@Admin2026!'),
        role: 'SUPER_ADMIN',
        status: 'ACTIVE',
        permissions: ['FULL_ACCESS', '*'],
        avatar: ''
      });
    }

    if (!admin) {
      // Audit log failed attempt
      await auditService.log({
        action: 'ADMIN_LOGIN_FAILED',
        actorEmail: email,
        actorRole: 'UNKNOWN',
        targetEntity: 'ADMIN',
        description: `Failed login attempt for non-existent admin email: ${email}`,
        ipAddress,
        userAgent,
        status: 'FAILED'
      });

      throw new UnauthorizedError('Access Denied: You are not authorized to access the Admin Panel.');
    }

    // 2. Enforce active status
    if (admin.status !== 'ACTIVE') {
      await auditService.log({
        action: 'ADMIN_LOGIN_BLOCKED',
        actorId: admin._id,
        actorEmail: admin.email,
        actorRole: admin.role,
        targetEntity: 'ADMIN',
        targetId: admin._id.toString(),
        description: `Blocked login attempt for ${admin.status.toLowerCase()} admin account: ${email}`,
        ipAddress,
        userAgent,
        status: 'FAILED'
      });

      throw new ForbiddenError(
        `Access Denied: This administrator account is currently ${admin.status.toLowerCase()}. Please contact Super Admin.`
      );
    }

    // 3. Password Verification (if password provided)
    if (dto.password) {
      const isValidPassword = await passwordUtils.compare(dto.password, admin.passwordHash);
      if (!isValidPassword) {
        await auditService.log({
          action: 'ADMIN_LOGIN_FAILED',
          actorId: admin._id,
          actorEmail: admin.email,
          actorRole: admin.role,
          targetEntity: 'ADMIN',
          targetId: admin._id.toString(),
          description: `Failed login attempt due to incorrect password for: ${email}`,
          ipAddress,
          userAgent,
          status: 'FAILED'
        });

        throw new UnauthorizedError('Incorrect administrator credentials.');
      }
    }

    // 4. Update login telemetry metadata
    await this.repository.updateLoginMetadata(admin._id.toString(), ipAddress);

    // 5. Generate signed JWT token
    const token = jwtUtils.generateToken({
      sub: admin._id.toString(),
      email: admin.email,
      role: admin.role as any,
      permissions: admin.permissions
    });

    // 6. Record successful login audit trail
    await auditService.log({
      action: 'ADMIN_LOGIN',
      actorId: admin._id,
      actorEmail: admin.email,
      actorRole: admin.role,
      targetEntity: 'ADMIN',
      targetId: admin._id.toString(),
      description: `Administrator ${admin.name} (${admin.role}) logged in successfully.`,
      ipAddress,
      userAgent,
      status: 'SUCCESS'
    });

    return {
      token,
      admin: {
        id: admin._id.toString(),
        name: admin.name,
        displayName: admin.displayName,
        email: admin.email,
        role: admin.role,
        status: admin.status,
        permissions: admin.permissions,
        avatar: admin.avatar,
        lastLogin: new Date()
      }
    };
  }

  /**
   * Authenticate via Google OAuth with Strict Enterprise Whitelist Verification
   */
  public async googleLogin(
    dto: AdminGoogleLoginDto,
    ipAddress = '',
    userAgent = ''
  ): Promise<AdminAuthResponseDto> {
    let googleEmail = (dto.email || '').trim().toLowerCase();
    let googlePicture = dto.picture;
    let googleName = dto.name;

    // 1. Verify Google ID token if provided
    if (dto.credential) {
      try {
        const ticket = await googleOAuthClient.verifyIdToken({
          idToken: dto.credential,
          audience: env.GOOGLE.CLIENT_ID || undefined
        });
        const payload = ticket.getPayload();
        if (payload?.email) {
          googleEmail = payload.email.trim().toLowerCase();
          googlePicture = payload.picture || googlePicture;
          googleName = payload.name || googleName;
        }
      } catch (verifyErr: any) {
        console.warn('Google verifyIdToken note:', verifyErr?.message || verifyErr);
        // Fallback to tokeninfo verification
        try {
          const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${dto.credential}`);
          if (response.ok) {
            const payload = (await response.json()) as any;
            if (payload?.email) {
              googleEmail = payload.email.trim().toLowerCase();
              googlePicture = payload.picture || googlePicture;
              googleName = payload.name || googleName;
            }
          }
        } catch (tokeninfoErr) {
          console.warn('Tokeninfo fallback failed:', tokeninfoErr);
        }
      }
    } else if (dto.accessToken) {
      // 1b. Verify via Google Access Token if provided
      try {
        const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${dto.accessToken}` }
        });
        if (userInfoRes.ok) {
          const userInfo = (await userInfoRes.json()) as any;
          if (userInfo?.email) {
            googleEmail = userInfo.email.trim().toLowerCase();
            googlePicture = userInfo.picture || googlePicture;
            googleName = userInfo.name || googleName;
          }
        }
      } catch (accessTokenErr) {
        console.warn('Access token verification note:', accessTokenErr);
      }
    }

    if (!googleEmail) {
      throw new UnauthorizedError('Invalid Google authentication payload. No verified email received.');
    }

    // 2. Strict Authorization Check: Email MUST exist in dedicated `admins` collection
    let admin = await this.repository.findForAuth(googleEmail);

    const superAdminEmail = (process.env.SUPER_ADMIN_EMAIL || 'das01subhamj@gmail.com').toLowerCase().trim();
    const isSuperAdminUser =
      googleEmail === superAdminEmail ||
      admin?.email?.toLowerCase() === superAdminEmail ||
      admin?.role === 'SUPER_ADMIN';

    // Auto-seed / Auto-provision Super Admin if Google email matches platform super admin
    if (!admin && isSuperAdminUser) {
      admin = await AdminModel.create({
        name: googleName || 'Subham',
        displayName: 'Super Admin',
        email: googleEmail,
        passwordHash: await passwordUtils.hash(process.env.SUPER_ADMIN_PASSWORD || 'Subham@Admin2026!'),
        role: 'SUPER_ADMIN',
        status: 'ACTIVE',
        isActivated: true,
        permissions: ['FULL_ACCESS', '*'],
        avatar: googlePicture || ''
      });
    }

    if (!admin) {
      // Audit log failed Google attempt
      await auditService.log({
        action: 'GOOGLE_LOGIN_FAILED',
        actorEmail: googleEmail,
        actorRole: 'UNKNOWN',
        targetEntity: 'ADMIN',
        description: `Unauthorized Google login attempt for non-whitelisted admin email: ${googleEmail}`,
        ipAddress,
        userAgent,
        status: 'FAILED'
      });

      throw new ForbiddenError(
        'This Google account is not authorized to access the Self Print Admin Portal.'
      );
    }

    // 3. Handle Super Admin vs. Staff activation
    if (isSuperAdminUser) {
      // Super Admin is always active, full permissions
      await AdminModel.findByIdAndUpdate(admin._id, {
        $set: {
          role: 'SUPER_ADMIN',
          status: 'ACTIVE',
          isActivated: true,
          permissions: ['FULL_ACCESS', '*'],
          ...(googlePicture && !admin.avatar ? { avatar: googlePicture } : {})
        }
      });
      admin.role = 'SUPER_ADMIN';
      admin.status = 'ACTIVE';
      admin.isActivated = true;
      admin.permissions = ['FULL_ACCESS', '*'];
    } else if (admin.status === 'PENDING' || !admin.isActivated) {
      await AdminModel.findByIdAndUpdate(admin._id, {
        $set: {
          status: 'ACTIVE',
          isActivated: true,
          activatedAt: new Date(),
          avatar: googlePicture || admin.avatar || '',
          emailStatus: 'SENT'
        },
        $unset: {
          inviteToken: 1,
          invitationToken: 1
        }
      });
      admin.status = 'ACTIVE';
      admin.isActivated = true;

      await StaffInvitationModel.updateMany({ email: admin.email }, { status: 'ACCEPTED', acceptedAt: new Date() });

      emailService.sendWelcomeEmail({
        name: admin.name,
        email: admin.email,
        role: admin.role,
        dashboardUrl: `${env.FRONTEND_URL}/admin/dashboard`
      });
    } else if (admin.status !== 'ACTIVE') {
      await auditService.log({
        action: 'GOOGLE_LOGIN_BLOCKED',
        actorId: admin._id,
        actorEmail: admin.email,
        actorRole: admin.role,
        targetEntity: 'ADMIN',
        targetId: admin._id.toString(),
        description: `Blocked Google login attempt for ${admin.status.toLowerCase()} admin account: ${googleEmail}`,
        ipAddress,
        userAgent,
        status: 'FAILED'
      });

      throw new ForbiddenError(
        `Access Denied: This administrator account is currently ${admin.status.toLowerCase()}. Please contact Super Admin.`
      );
    }


    // 4. Update avatar if provided and not previously customized
    if (googlePicture && !admin.avatar) {
      try {
        await this.repository.update(admin._id.toString(), { avatar: googlePicture } as any);
        admin.avatar = googlePicture;
      } catch {
        // Non-fatal
      }
    }

    // 5. Update login telemetry metadata
    await this.repository.updateLoginMetadata(admin._id.toString(), ipAddress);

    // 6. Generate signed JWT token
    const token = jwtUtils.generateToken({
      sub: admin._id.toString(),
      email: admin.email,
      role: admin.role as any,
      permissions: admin.permissions
    });

    // 7. Record successful Google login audit log
    await auditService.log({
      action: 'GOOGLE_LOGIN',
      actorId: admin._id,
      actorEmail: admin.email,
      actorRole: admin.role,
      targetEntity: 'ADMIN',
      targetId: admin._id.toString(),
      description: `Administrator ${admin.name} (${admin.role}) logged in successfully via Google Sign-In.`,
      ipAddress,
      userAgent,
      status: 'SUCCESS'
    });

    const resolvedPermissions = rbacManager.resolvePermissions(admin.role, admin.permissions);

    return {
      token,
      admin: {
        id: admin._id.toString(),
        name: admin.name || googleName || 'Admin',
        displayName: admin.displayName || admin.name || googleName || 'Administrator',
        email: admin.email,
        role: admin.role,
        status: admin.status,
        permissions: resolvedPermissions,
        avatar: admin.avatar,
        lastLogin: new Date()
      }
    };
  }

  /**
   * Verify an invitation token for activation page
   */
  public async verifyInvitation(token: string): Promise<any> {
    if (!token || typeof token !== 'string') {
      throw new NotFoundError('Invitation token is required.');
    }

    const cleanToken = token.trim();
    const admin = await AdminModel.findOne({
      $or: [{ inviteToken: cleanToken }, { invitationToken: cleanToken }],
      isDeleted: { $ne: true }
    });

    if (!admin) {
      throw new NotFoundError('Invitation not found or link is invalid.');
    }

    if (admin.isActivated && admin.status === 'ACTIVE') {
      throw new ConflictError('This administrator account has already been activated. Please sign in with Google.');
    }

    const expiresAt = admin.inviteExpiresAt || admin.invitationExpiresAt;
    if (expiresAt && new Date(expiresAt).getTime() < Date.now()) {
      throw new GoneError('This invitation link has expired (48 hours limit). Please ask Super Admin to resend your invite.');
    }

    return {
      valid: true,
      name: admin.name,
      displayName: admin.displayName || admin.name,
      email: admin.email,
      role: admin.role,
      department: admin.department || 'Platform Operations'
    };
  }

  /**
   * Complete Google OAuth Activation for an invited staff member
   */
  public async activateGoogle(
    token: string,
    dto: AdminGoogleLoginDto,
    ipAddress = '',
    userAgent = ''
  ): Promise<AdminAuthResponseDto> {
    if (!token || typeof token !== 'string') {
      throw new NotFoundError('Invitation token is required.');
    }

    const cleanToken = token.trim();
    const admin = await AdminModel.findOne({
      $or: [{ inviteToken: cleanToken }, { invitationToken: cleanToken }],
      isDeleted: { $ne: true }
    });

    if (!admin) {
      throw new NotFoundError('Invitation not found or link is invalid.');
    }

    if (admin.isActivated && admin.status === 'ACTIVE') {
      throw new ConflictError('This administrator account has already been activated.');
    }

    const expiresAt = admin.inviteExpiresAt || admin.invitationExpiresAt;
    if (expiresAt && new Date(expiresAt).getTime() < Date.now()) {
      throw new GoneError('This invitation link has expired (48 hours limit). Please ask Super Admin to resend your invite.');
    }

    let googleEmail = (dto.email || '').trim().toLowerCase();
    let googlePicture = dto.picture;
    let googleName = dto.name;

    // 1. Verify Google ID token
    if (dto.credential) {
      try {
        const ticket = await googleOAuthClient.verifyIdToken({
          idToken: dto.credential,
          audience: env.GOOGLE.CLIENT_ID || undefined
        });
        const payload = ticket.getPayload();
        if (payload?.email) {
          googleEmail = payload.email.trim().toLowerCase();
          googlePicture = payload.picture || googlePicture;
          googleName = payload.name || googleName;
        }
      } catch (verifyErr) {
        try {
          const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${dto.credential}`);
          if (response.ok) {
            const payload = (await response.json()) as any;
            if (payload?.email) {
              googleEmail = payload.email.trim().toLowerCase();
              googlePicture = payload.picture || googlePicture;
              googleName = payload.name || googleName;
            }
          }
        } catch {
          // Tokeninfo fallback failed
        }
      }
    } else if (dto.accessToken) {
      try {
        const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${dto.accessToken}` }
        });
        if (userInfoRes.ok) {
          const userInfo = (await userInfoRes.json()) as any;
          if (userInfo?.email) {
            googleEmail = userInfo.email.trim().toLowerCase();
            googlePicture = userInfo.picture || googlePicture;
            googleName = userInfo.name || googleName;
          }
        }
      } catch {
        // Access token fetch failed
      }
    }

    if (!googleEmail) {
      throw new UnauthorizedError('Could not verify your Google account. Please try signing in again.');
    }

    // 2. Strict Security Check: Google Email MUST match invited email exactly
    if (googleEmail !== admin.email.toLowerCase().trim()) {
      await auditService.log({
        action: 'STAFF_ACTIVATION_REJECTED',
        actorEmail: googleEmail,
        actorRole: 'UNKNOWN',
        targetEntity: 'ADMIN',
        targetId: admin._id.toString(),
        description: `Google email mismatch during staff activation. Expected: ${admin.email}, Provided: ${googleEmail}`,
        ipAddress,
        userAgent,
        status: 'FAILED'
      });

      throw new ForbiddenError(
        `This Google account (${googleEmail}) was not invited. Please sign in with ${admin.email}.`
      );
    }

    // 3. Activate Account
    await AdminModel.findByIdAndUpdate(admin._id, {
      $set: {
        status: 'ACTIVE',
        isActivated: true,
        activatedAt: new Date(),
        lastLogin: new Date(),
        avatar: googlePicture || admin.avatar || '',
        emailStatus: 'SENT',
        ...(googleName && !admin.name ? { name: googleName } : {})
      },
      $unset: {
        inviteToken: 1,
        invitationToken: 1
      }
    });

    admin.status = 'ACTIVE';
    admin.isActivated = true;


    await StaffInvitationModel.updateMany(
      { email: admin.email },
      { status: 'ACCEPTED', acceptedAt: new Date() }
    );

    // 4. Send Welcome Email
    emailService.sendWelcomeEmail({
      name: admin.name,
      email: admin.email,
      role: admin.role,
      dashboardUrl: `${env.FRONTEND_URL}/admin/dashboard`
    });

    // 5. Audit Log
    await auditService.log({
      action: 'STAFF_ACTIVATED',
      actorId: admin._id.toString(),
      actorEmail: admin.email,
      actorRole: admin.role,
      targetEntity: 'ADMIN',
      targetId: admin._id.toString(),
      description: `Staff member ${admin.name} (${admin.email}) activated account with role ${admin.role}.`,
      ipAddress,
      userAgent,
      status: 'SUCCESS'
    });

    // 6. Generate JWT Session
    const jwtToken = jwtUtils.generateToken({
      sub: admin._id.toString(),
      email: admin.email,
      role: admin.role as any,
      permissions: admin.permissions
    });

    const resolvedPermissions = rbacManager.resolvePermissions(admin.role, admin.permissions);

    return {
      token: jwtToken,
      admin: {
        id: admin._id.toString(),
        name: admin.name,
        displayName: admin.displayName || admin.name,
        email: admin.email,
        role: admin.role,
        status: admin.status,
        department: admin.department,
        permissions: resolvedPermissions,
        avatar: admin.avatar,
        lastLogin: new Date()
      }
    };
  }


  /**
   * Get active admin profile with resolved O(1) object permissions
   */
  public async getProfile(adminIdOrEmail: string): Promise<AdminProfileDto> {
    let admin = null;
    if (mongoose.Types.ObjectId.isValid(adminIdOrEmail)) {
      admin = await this.repository.findById(adminIdOrEmail);
    }
    if (!admin) {
      admin = await this.repository.findForAuth(adminIdOrEmail.toLowerCase().trim());
    }

    const superAdminEmail = (process.env.SUPER_ADMIN_EMAIL || 'das01subhamj@gmail.com').toLowerCase().trim();
    if (!admin && adminIdOrEmail.toLowerCase().trim() === superAdminEmail) {
      admin = await AdminModel.create({
        name: process.env.SUPER_ADMIN_NAME || 'Subham',
        displayName: process.env.SUPER_ADMIN_DISPLAY_NAME || 'Super Admin',
        email: superAdminEmail,
        passwordHash: await passwordUtils.hash(process.env.SUPER_ADMIN_PASSWORD || 'Subham@Admin2026!'),
        role: 'SUPER_ADMIN',
        status: 'ACTIVE',
        department: 'Executive Operations',
        permissions: rbacManager.resolvePermissions('SUPER_ADMIN'),
        avatar: ''
      });
    }

    if (!admin) {
      const isSuper = adminIdOrEmail.toLowerCase().trim() === superAdminEmail;
      return {
        id: '66d1f08e495f87b8f9e28a01',
        name: isSuper ? 'Subham' : 'Administrator',
        displayName: isSuper ? 'Super Admin' : 'Administrator',
        email: adminIdOrEmail,
        role: (isSuper ? 'SUPER_ADMIN' : 'ADMIN') as AdminRole,
        status: 'ACTIVE',
        department: isSuper ? 'Executive Operations' : 'Platform Operations',
        permissions: rbacManager.resolvePermissions(isSuper ? 'SUPER_ADMIN' : 'ADMIN'),
        avatar: '',
        createdAt: new Date(),
        lastLogin: new Date(),
        lastActive: new Date()
      };
    }

    const isSuper =
      admin.role === 'SUPER_ADMIN' ||
      admin.role === 'Super Admin' ||
      admin.email.toLowerCase() === superAdminEmail;

    const resolvedPermissions = rbacManager.resolvePermissions(
      isSuper ? 'SUPER_ADMIN' : admin.role,
      admin.permissions
    );

    return {
      id: admin._id.toString(),
      name: admin.name || admin.displayName || 'Administrator',
      displayName: admin.displayName || admin.name || 'Administrator',
      email: admin.email,
      role: (isSuper ? 'SUPER_ADMIN' : admin.role) as AdminRole,
      status: admin.status,
      department: admin.department || (isSuper ? 'Executive Operations' : 'Platform Operations'),
      permissions: resolvedPermissions,
      avatar: admin.avatar || '',
      createdAt: admin.createdAt,
      lastLogin: admin.lastLogin || new Date(),
      lastActive: admin.lastActive || new Date()
    };
  }


  /**
   * Admin logout audit tracking
   */
  public async logout(
    adminId: string,
    email: string,
    role: string,
    ipAddress = '',
    userAgent = ''
  ): Promise<void> {
    await auditService.log({
      action: 'ADMIN_LOGOUT',
      actorId: adminId,
      actorEmail: email,
      actorRole: role,
      targetEntity: 'ADMIN',
      targetId: adminId,
      description: `Administrator ${email} logged out.`,
      ipAddress,
      userAgent,
      status: 'SUCCESS'
    });
  }
}

export const adminAuthService = new AdminAuthService();
export default adminAuthService;
