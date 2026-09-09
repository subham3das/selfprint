import { apiClient } from '@/lib/axios';
import { LoginRequestPayload, LoginResponse, AdminAuthUser } from '../types/auth.types';

export const adminAuthService = {
  /**
   * Authenticate administrator against live backend dedicated `admins` collection
   */
  async login(payload: LoginRequestPayload): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<{
        success: boolean;
        message: string;
        data: {
          token: string;
          admin: {
            id: string;
            name: string;
            displayName: string;
            email: string;
            role: 'SUPER_ADMIN' | 'ADMIN' | 'STAFF' | string;
            status: string;
            permissions: string[];
            avatar?: string;
            lastLogin?: string;
          };
        };
      }>('/admin/auth/login', {
        email: payload.email.trim().toLowerCase(),
        password: payload.password
      });

      const { token, admin } = response.data.data;
      const isSuper = admin.role === 'SUPER_ADMIN' || admin.email === 'das01subhamj@gmail.com';
      const displayName = admin.displayName || admin.name || 'Administrator';

      const authUser: AdminAuthUser = {
        id: admin.id,
        name: admin.name || 'Admin',
        displayName,
        email: admin.email,
        role: (admin.role as any) || 'SUPER_ADMIN',
        department: isSuper ? 'Executive Operations' : 'Administration',
        avatarBg: isSuper
          ? 'bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-600'
          : 'bg-gradient-to-tr from-indigo-600 to-blue-600',
        avatarText: displayName
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2) || 'AD',
        avatar: admin.avatar,
        permissions: admin.permissions || ['FULL_ACCESS'],
        lastLogin: admin.lastLogin,
        token
      };

      try {
        localStorage.setItem('selfprint_admin_token', token);
        localStorage.setItem('selfprint_admin_user', JSON.stringify(authUser));
      } catch (err) {
        console.warn('LocalStorage error:', err);
      }

      return {
        success: true,
        token,
        user: authUser,
        message: response.data.message
      };
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Access Denied: You are not authorized to access the Admin Panel.';
      return {
        success: false,
        message
      };
    }
  },

  /**
   * Authenticate administrator with Google OAuth
   */
  async googleLogin(payload: {
    credential?: string;
    accessToken?: string;
    email?: string;
    name?: string;
    picture?: string;
  }): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<{
        success: boolean;
        message: string;
        data: {
          token: string;
          admin: {
            id: string;
            name: string;
            displayName: string;
            email: string;
            role: 'SUPER_ADMIN' | 'ADMIN' | 'STAFF' | string;
            status: string;
            permissions: string[];
            avatar?: string;
            lastLogin?: string;
          };
        };
      }>('/admin/auth/google', payload);

      const { token, admin } = response.data.data;
      const isSuper = admin.role === 'SUPER_ADMIN' || admin.email === 'das01subhamj@gmail.com';
      const displayName = admin.displayName || admin.name || 'Administrator';

      const authUser: AdminAuthUser = {
        id: admin.id,
        name: admin.name || 'Admin',
        displayName,
        email: admin.email,
        role: (admin.role as any) || 'SUPER_ADMIN',
        department: isSuper ? 'Executive Operations' : 'Administration',
        avatarBg: isSuper
          ? 'bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-600'
          : 'bg-gradient-to-tr from-indigo-600 to-blue-600',
        avatarText: displayName
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2) || 'AD',
        avatar: admin.avatar,
        permissions: admin.permissions || ['FULL_ACCESS'],
        lastLogin: admin.lastLogin,
        token
      };

      try {
        localStorage.setItem('selfprint_admin_token', token);
        localStorage.setItem('selfprint_admin_user', JSON.stringify(authUser));
      } catch (err) {
        console.warn('LocalStorage error:', err);
      }

      return {
        success: true,
        token,
        user: authUser,
        message: response.data.message
      };
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.message ||
        'This Google account is not authorized to access the Self Print Admin Portal.';
      return {
        success: false,
        message
      };
    }
  },

  /**
   * Fetch authenticated admin profile from /admin/auth/me
   */
  async getProfile(): Promise<AdminAuthUser> {
    const response = await apiClient.get<any>('/admin/auth/me');
    const resData = response.data;
    const admin = resData?.user || resData?.data || resData;

    if (!admin) {
      throw new Error('No admin profile returned');
    }

    const isSuper =
      admin.role === 'SUPER_ADMIN' ||
      admin.role === 'Super Admin' ||
      admin.email?.toLowerCase().trim() === 'das01subhamj@gmail.com';

    const displayName = admin.displayName || admin.name || (isSuper ? 'Super Admin' : 'Staff Member');

    const authUser: AdminAuthUser = {
      id: admin.id || admin._id,
      name: admin.name || (isSuper ? 'Super Admin' : 'Staff Member'),
      displayName,
      email: admin.email,
      role: (isSuper ? 'SUPER_ADMIN' : admin.role || 'STAFF') as any,
      department: admin.department || (isSuper ? 'Executive Operations' : 'Platform Operations'),
      avatarBg: isSuper
        ? 'bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-600'
        : 'bg-gradient-to-tr from-indigo-600 to-blue-600',
      avatarText: displayName
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || (isSuper ? 'SA' : 'ST'),
      avatar: admin.avatar || '',
      permissions: resData?.permissions || admin.permissions || (isSuper ? { "*": { "*": true } } : {}),
      lastLogin: admin.lastLogin || admin.lastActive,
      token: this.getToken() || ''
    };


    try {
      localStorage.setItem('selfprint_admin_user', JSON.stringify(authUser));
    } catch {
      // Storage unavailable
    }

    return authUser;
  },


  /**
   * Retrieve active admin user from storage
   */
  getCurrentUser(): AdminAuthUser | null {
    try {
      const stored = localStorage.getItem('selfprint_admin_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  /**
   * Retrieve active admin JWT token
   */
  getToken(): string | null {
    try {
      return localStorage.getItem('selfprint_admin_token');
    } catch {
      return null;
    }
  },

  /**
   * Log out active admin
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post('/admin/auth/logout').catch(() => {});
    } finally {
      try {
        localStorage.removeItem('selfprint_admin_token');
        localStorage.removeItem('selfprint_admin_user');
      } catch (err) {
        console.warn('LocalStorage error:', err);
      }
    }
  }
};

export default adminAuthService;
