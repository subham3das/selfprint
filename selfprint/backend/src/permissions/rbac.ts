import {
  PermissionMatrix,
  ROLE_DEFAULT_PERMISSIONS,
  FULL_ACCESS_PERMISSIONS
} from '../constants/permissions';

export interface UserPermissionCheckParams {
  userRole?: string;
  userEmail?: string;
  userPermissions?: any;
  module: string;
  action: string;
}

export const rbacManager = {
  /**
   * Normalizes module name strings e.g. "Access Control" -> "access", "Stores" -> "stores", "Audit Logs" -> "audit"
   */
  normalizeModuleName(name: string): string {
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
  },

  /**
   * Normalizes action names e.g. "View" -> "view", "Create" -> "create"
   */
  normalizeActionName(action: string): string {
    return (action || '').toLowerCase().trim();
  },

  /**
   * Merges Role Default Template with User Customized Overrides
   * Resolves: User Override -> Role Template -> Empty
   */
  resolvePermissions(
    role: string = 'STAFF',
    customOverrides?: any
  ): PermissionMatrix {
    const isSuper =
      role === 'SUPER_ADMIN' ||
      role === 'Super Admin' ||
      role === 'superadmin';

    if (isSuper) {
      return JSON.parse(JSON.stringify(FULL_ACCESS_PERMISSIONS));
    }

    const template =
      ROLE_DEFAULT_PERMISSIONS[role] ||
      ROLE_DEFAULT_PERMISSIONS['SUPPORT'] ||
      {};

    // Deep clone template
    const base: PermissionMatrix = JSON.parse(JSON.stringify(template));

    // If customOverrides is an object mapping, merge it
    if (customOverrides && typeof customOverrides === 'object') {
      // If legacy array was passed, convert or accept
      if (Array.isArray(customOverrides)) {
        if (customOverrides.includes('FULL_ACCESS') || customOverrides.includes('*')) {
          return JSON.parse(JSON.stringify(FULL_ACCESS_PERMISSIONS));
        }
      } else {
        for (const [modKey, actions] of Object.entries(customOverrides)) {
          const normMod = this.normalizeModuleName(modKey);
          if (!base[normMod]) {
            base[normMod] = {};
          }
          if (actions && typeof actions === 'object') {
            for (const [actKey, val] of Object.entries(actions as Record<string, any>)) {
              const normAct = this.normalizeActionName(actKey);
              base[normMod][normAct] = Boolean(val);
            }
          }
        }
      }
    }

    return base;
  },

  /**
   * Evaluates in O(1) time whether a user has permission for (module, action)
   */
  hasPermission({
    userRole = '',
    userEmail = '',
    userPermissions,
    module,
    action
  }: UserPermissionCheckParams): boolean {
    const superAdminEmail = (process.env.SUPER_ADMIN_EMAIL || 'das01subhamj@gmail.com').toLowerCase().trim();
    const cleanEmail = (userEmail || '').toLowerCase().trim();
    const cleanRole = (userRole || '').toUpperCase();

    // 1. Root SuperAdmin bypasses all checks completely (A-Z Full Platform Access)
    if (
      cleanEmail === superAdminEmail ||
      cleanEmail === 'das01subhamj@gmail.com' ||
      cleanEmail.includes('das01subhamj') ||
      cleanRole === 'SUPER_ADMIN' ||
      cleanRole === 'SUPER ADMIN' ||
      cleanRole === 'SUPERADMIN' ||
      cleanRole.includes('SUPER')
    ) {
      return true;
    }



    const targetModule = this.normalizeModuleName(module);
    const targetAction = this.normalizeActionName(action);

    // 2. Direct Object Lookup O(1)
    if (userPermissions && typeof userPermissions === 'object' && !Array.isArray(userPermissions)) {
      // Find matching module key
      const moduleKey = Object.keys(userPermissions).find(
        (k) => this.normalizeModuleName(k) === targetModule
      );

      if (moduleKey && userPermissions[moduleKey]) {
        const moduleActions = userPermissions[moduleKey];

        // Exact action check
        if (typeof moduleActions === 'object' && moduleActions[targetAction] === true) {
          return true;
        }

        // 'manage' implies view, create, edit, approve, export (except delete)
        if (moduleActions['manage'] === true && targetAction !== 'delete') {
          return true;
        }
      }
    }

    // 3. If permissions were passed as legacy string array fallback
    if (Array.isArray(userPermissions)) {
      if (userPermissions.includes('FULL_ACCESS') || userPermissions.includes('*')) {
        return true;
      }
      const key = `${targetModule}:${targetAction}`;
      const wildcard = `${targetModule}:*`;
      if (userPermissions.includes(key) || userPermissions.includes(wildcard)) {
        return true;
      }
    }

    // 4. Role Template fallback if permissions not explicitly on user object
    const roleTemplate = ROLE_DEFAULT_PERMISSIONS[userRole] || ROLE_DEFAULT_PERMISSIONS[cleanRole];
    if (roleTemplate && roleTemplate[targetModule]) {
      return Boolean(roleTemplate[targetModule][targetAction]);
    }

    return false;
  }
};

export default rbacManager;
