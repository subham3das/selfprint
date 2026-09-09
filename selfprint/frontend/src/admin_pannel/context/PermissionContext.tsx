import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { adminAuthService } from '../services/auth.service';

export type PermissionMatrix = Record<string, Record<string, boolean>>;

export interface AdminUser {
  id: string;
  name: string;
  displayName: string;
  email: string;
  role: string;
  status?: string;
  department?: string;
  permissions?: PermissionMatrix | any;
  avatar?: string;
  isSuperAdmin?: boolean;
}


export interface PermissionContextType {
  user: AdminUser | null;
  role: string;
  department: string;
  permissions: PermissionMatrix;
  isSuperAdmin: boolean;
  isLoading: boolean;
  can: (module: string, action?: string) => boolean;
  hasModuleAccess: (module: string) => boolean;
  refreshPermissions: () => Promise<void>;
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

const normalizeModuleName = (name: string): string => {
  const cleaned = (name || '').toLowerCase().trim();
  if (cleaned === 'access control' || cleaned === 'access_control' || cleaned === 'access-control' || cleaned === 'access') {
    return 'access';
  }
  if (cleaned === 'audit logs' || cleaned === 'audit_logs' || cleaned === 'audit-logs' || cleaned === 'audit') {
    return 'audit';
  }
  if (cleaned === 'system config' || cleaned === 'system configuration' || cleaned === 'system_config' || cleaned === 'system') {
    return 'system';
  }
  return cleaned.replace(/[\s-_]+/g, '');
};

const normalizeActionName = (action: string): string => {
  return (action || 'view').toLowerCase().trim();
};

export const PermissionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(() => {
    try {
      const stored =
        localStorage.getItem('selfprint_admin_user') ||
        localStorage.getItem('admin_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(false);

  const isSuperAdmin = useMemo(() => {
    if (!user) return false;
    const roleUpper = (user.role || '').toUpperCase();
    const emailLower = (user.email || '').toLowerCase().trim();
    return (
      roleUpper === 'SUPER_ADMIN' ||
      roleUpper === 'SUPER ADMIN' ||
      emailLower === 'das01subhamj@gmail.com' ||
      user.isSuperAdmin === true
    );
  }, [user]);

  const permissions: PermissionMatrix = useMemo(() => {
    if (!user) return {};
    if (isSuperAdmin) {
      // Super Admin has all true for all modules
      const full: PermissionMatrix = {};
      const allMods = [
        'dashboard',
        'stores',
        'users',
        'transactions',
        'revenue',
        'printers',
        'support',
        'analytics',
        'settings',
        'access',
        'audit',
        'system'
      ];
      allMods.forEach((m) => {
        full[m] = {
          view: true,
          create: true,
          edit: true,
          delete: true,
          export: true,
          approve: true,
          manage: true
        };
      });
      return full;
    }

    if (user.permissions && typeof user.permissions === 'object' && !Array.isArray(user.permissions)) {
      return user.permissions;
    }

    return {};
  }, [user, isSuperAdmin]);

  const refreshPermissions = useCallback(async () => {
    const token =
      localStorage.getItem('selfprint_admin_token') ||
      localStorage.getItem('admin_token') ||
      localStorage.getItem('token');
    if (!token) return;

    try {
      setIsLoading(true);
      const adminProfile = await adminAuthService.getProfile();
      if (adminProfile) {
        setUser((prev) => ({
          ...prev,
          ...adminProfile,
          permissions: adminProfile.permissions
        }));
        localStorage.setItem('selfprint_admin_user', JSON.stringify(adminProfile));
      }
    } catch (err) {
      console.warn('Could not refresh admin permissions from server:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshPermissions();
  }, [refreshPermissions]);

  /**
   * O(1) Fast Memoized Permission Evaluation
   * can('stores', 'create') -> true / false
   */
  const can = useCallback(
    (module: string, action: string = 'view'): boolean => {
      // 1. Super Admin bypasses ALL checks
      if (isSuperAdmin) {
        return true;
      }

      if (!module) return false;

      const normMod = normalizeModuleName(module);
      const normAct = normalizeActionName(action);

      const modulePerms = permissions[normMod];
      if (!modulePerms || typeof modulePerms !== 'object') {
        return false;
      }

      // Exact action match
      if (modulePerms[normAct] === true) {
        return true;
      }

      // 'manage' grants view, create, edit, approve, export (except delete)
      if (modulePerms['manage'] === true && normAct !== 'delete') {
        return true;
      }

      return false;
    },
    [isSuperAdmin, permissions]
  );

  const hasModuleAccess = useCallback(
    (module: string): boolean => {
      return can(module, 'view');
    },
    [can]
  );

  const contextValue = useMemo<PermissionContextType>(
    () => ({
      user,
      role: user?.role || (isSuperAdmin ? 'SUPER_ADMIN' : 'STAFF'),
      department: user?.department || 'Platform Operations',
      permissions,
      isSuperAdmin,
      isLoading,
      can,
      hasModuleAccess,
      refreshPermissions
    }),
    [user, permissions, isSuperAdmin, isLoading, can, hasModuleAccess, refreshPermissions]
  );

  return (
    <PermissionContext.Provider value={contextValue}>
      {children}
    </PermissionContext.Provider>
  );
};

export const usePermission = (): PermissionContextType => {
  const context = useContext(PermissionContext);
  if (!context) {
    return {
      user: null,
      role: 'SUPER_ADMIN',
      department: 'Platform Operations',
      permissions: {},
      isSuperAdmin: true,
      isLoading: false,
      can: () => true,
      hasModuleAccess: () => true,
      refreshPermissions: async () => {}
    };
  }
  return context;
};

export default PermissionContext;
