import { ROLES, UserRole } from '../constants/roles';
import { PermissionModule, PermissionAction } from '../constants/permissions';

export interface UserPermissionCheckParams {
  userRole: UserRole;
  userPermissions?: string[];
  module: PermissionModule;
  action: PermissionAction;
}

export const rbacManager = {
  /**
   * Evaluates whether a user role or granular permission grant allows a specific action on a module
   */
  hasPermission({
    userRole,
    userPermissions = [],
    module,
    action
  }: UserPermissionCheckParams): boolean {
    // 1. Root SuperAdmin has unrestricted access to all modules and actions
    if (userRole === ROLES.SUPER_ADMIN) {
      return true;
    }

    // 2. Format permission key e.g. "Stores:create", "Audit Logs:view"
    const requiredPermissionKey = `${module}:${action}`;
    const moduleWildcardKey = `${module}:*`;

    // 3. Check granular permissions array
    if (
      userPermissions.includes(requiredPermissionKey) ||
      userPermissions.includes(moduleWildcardKey) ||
      userPermissions.includes('*')
    ) {
      return true;
    }

    // 4. Role-based default policies
    if (userRole === ROLES.ADMIN) {
      // Platform Admins have full access except Access Control management & Audit Logs deletion
      if (module === 'Access Control' && (action === 'delete' || action === 'manage')) {
        return false;
      }
      return action !== 'delete' || module !== 'Audit Logs';
    }

    if (userRole === ROLES.STORE) {
      // Stores manage their own Store settings, Queue, Printers, QR, and Transactions
      const storeAllowedModules: PermissionModule[] = [
        'Dashboard',
        'Stores',
        'Transactions',
        'Revenue',
        'Printers',
        'Settings',
        'Support'
      ];
      return storeAllowedModules.includes(module) && action !== 'delete';
    }

    if (userRole === ROLES.USER) {
      // Direct kiosk users can only upload files and view job progress
      return action === 'view' || action === 'create';
    }

    return false;
  }
};

export default rbacManager;
