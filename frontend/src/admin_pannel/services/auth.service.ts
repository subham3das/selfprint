import { LoginRequestPayload, LoginResponse, AdminAuthUser } from '../types/auth.types';
import { INITIAL_STAFF_MOCK, SUPER_ADMIN_EMAIL } from '../data/access.mock';

export const adminAuthService = {
  async login(payload: LoginRequestPayload): Promise<LoginResponse> {
    // Simulate network latency (400ms)
    await new Promise((resolve) => setTimeout(resolve, 400));

    const normalizedEmail = payload.email.trim().toLowerCase();

    // Check if the user is the immutable Super Admin
    if (normalizedEmail === SUPER_ADMIN_EMAIL.toLowerCase()) {
      const superAdminUser: AdminAuthUser = {
        id: 'super-admin-01',
        name: 'Subham Das',
        email: SUPER_ADMIN_EMAIL,
        role: 'Super Admin',
        department: 'Executive Operations',
        avatarBg: 'bg-gradient-to-tr from-purple-600 to-indigo-600',
        avatarText: 'SD',
        lastLogin: new Date().toISOString(),
        token: `jwt_super_admin_${Date.now()}`
      };

      try {
        localStorage.setItem('selfprint_admin_token', superAdminUser.token);
        localStorage.setItem('selfprint_admin_user', JSON.stringify(superAdminUser));
      } catch (err) {
        console.warn('LocalStorage error:', err);
      }

      return {
        success: true,
        token: superAdminUser.token,
        user: superAdminUser
      };
    }

    // Check if email matches any staff member in the database
    const matchedStaff = INITIAL_STAFF_MOCK.find(
      (staff) => staff.email.toLowerCase() === normalizedEmail
    );

    if (matchedStaff) {
      if (matchedStaff.status === 'Suspended') {
        return {
          success: false,
          message: 'Access Denied: This administrator account has been suspended.'
        };
      }

      const authUser: AdminAuthUser = {
        id: matchedStaff.id,
        name: matchedStaff.fullName,
        email: matchedStaff.email,
        role: matchedStaff.role,
        department: matchedStaff.department,

        avatarBg: matchedStaff.avatarBg,
        avatarText: matchedStaff.avatarText,
        lastLogin: new Date().toISOString(),
        token: `jwt_admin_${matchedStaff.id}_${Date.now()}`
      };

      try {
        localStorage.setItem('selfprint_admin_token', authUser.token);
        localStorage.setItem('selfprint_admin_user', JSON.stringify(authUser));
      } catch (err) {
        console.warn('LocalStorage error:', err);
      }

      return {
        success: true,
        token: authUser.token,
        user: authUser
      };
    }

    // Email not registered in administrator directory
    return {
      success: false,
      message: 'Access Denied: You are not authorized to access the Admin Panel.'
    };
  },

  getCurrentUser(): AdminAuthUser | null {
    try {
      const stored = localStorage.getItem('selfprint_admin_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  logout(): void {
    try {
      localStorage.removeItem('selfprint_admin_token');
      localStorage.removeItem('selfprint_admin_user');
    } catch (err) {
      console.warn('LocalStorage error:', err);
    }
  }
};
