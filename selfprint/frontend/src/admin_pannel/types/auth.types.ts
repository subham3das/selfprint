export interface AdminAuthUser {
  id: string;
  name: string;
  displayName: string;
  email: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'FINANCE' | 'OPERATIONS' | 'SUPPORT' | 'STAFF' | string;
  department?: string;
  avatarBg?: string;
  avatarText?: string;
  avatar?: string;
  permissions?: any;
  lastLogin?: string;
  token?: string;
}


export interface LoginRequestPayload {
  email: string;
  password?: string;
}

export interface LoginResponse {
  success: boolean;
  token?: string;
  user?: AdminAuthUser;
  message?: string;
}

export interface AdminLoginState {
  isLoading: boolean;
  isSuccess: boolean;
  errorMessage: string | null;
}
