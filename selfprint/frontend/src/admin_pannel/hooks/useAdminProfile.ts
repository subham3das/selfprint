import { useQuery } from '@tanstack/react-query';
import { adminAuthService } from '../services/auth.service';
import { AdminAuthUser } from '../types/auth.types';

export const useAdminProfile = () => {
  const cachedUser = adminAuthService.getCurrentUser();
  const token = adminAuthService.getToken();

  const {
    data: user = cachedUser,
    isLoading,
    isError,
    refetch
  } = useQuery<AdminAuthUser | null>({
    queryKey: ['admin-current-profile'],
    queryFn: async () => {
      if (!token) return cachedUser || null;
      try {
        return await adminAuthService.getProfile();
      } catch {
        return cachedUser || null;
      }
    },
    staleTime: 60000,
    refetchOnWindowFocus: false
  });

  const activeUser = user || cachedUser || {
    id: 'admin-user',
    name: 'Administrator',
    displayName: 'Administrator',
    email: '',
    role: 'STAFF',
    department: 'Platform Operations',
    avatarBg: 'bg-gradient-to-tr from-indigo-600 to-blue-600',
    avatarText: 'AD',
    avatar: '',
    permissions: {},
    lastLogin: new Date().toISOString(),
    token: ''
  };

  const isSuperAdmin =
    activeUser.role === 'SUPER_ADMIN' ||
    String(activeUser.role || '').toUpperCase() === 'SUPER ADMIN' ||
    activeUser.email?.toLowerCase().trim() === 'das01subhamj@gmail.com';

  const roleLabel = isSuperAdmin
    ? 'Super Administrator'
    : activeUser.role === 'ADMIN'
    ? 'Platform Administrator'
    : activeUser.role === 'MANAGER'
    ? 'Store Manager'
    : activeUser.role === 'FINANCE'
    ? 'Finance Officer'
    : activeUser.role === 'OPERATIONS'
    ? 'Operations Support'
    : 'Staff Member';

  const roleBadge = isSuperAdmin
    ? 'SUPER ADMIN'
    : String(activeUser.role || 'STAFF').toUpperCase();

  const lastActiveFormatted = activeUser.lastLogin
    ? formatLastActive(activeUser.lastLogin)
    : 'Updated just now';

  return {
    user: activeUser,
    isLoading: isLoading && !cachedUser,
    isError,
    isSuperAdmin,
    roleLabel,
    roleBadge,
    lastActiveFormatted,
    refetch
  };
};


function formatLastActive(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffMins < 2) return 'Updated just now';
    if (diffMins < 60) return `Active ${diffMins}m ago`;
    if (diffHours < 24) return `Active ${diffHours}h ago`;
    return `Last active ${d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}`;
  } catch {
    return 'Updated just now';
  }
}

export default useAdminProfile;
