import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { usePermission } from '../context/PermissionContext';

interface AdminProtectedRouteProps {
  module: string;
  action?: string;
  children: React.ReactNode;
}

export const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({
  module,
  action = 'view',
  children
}) => {
  const location = useLocation();
  const { can, isSuperAdmin } = usePermission();

  const token =
    localStorage.getItem('selfprint_admin_token') ||
    localStorage.getItem('admin_token') ||
    localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // If Super Admin, immediately permit
  if (isSuperAdmin) {
    return <>{children}</>;
  }

  // Check required permission
  const hasPermission = can(module, action);

  if (!hasPermission) {
    return <Navigate to="/admin/403" state={{ deniedModule: module, from: location }} replace />;
  }

  return <>{children}</>;
};

export default AdminProtectedRoute;
