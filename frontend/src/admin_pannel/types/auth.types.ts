export interface AdminAuthUser {
  id: string;
  name: string;
  email: string;
  role: 'Super Admin' | 'Admin' | 'Manager' | 'Finance' | 'Operations' | 'Support';
  department: string;
  avatarBg: string;
  avatarText: string;
  lastLogin?: string;
  token: string;
}

export interface LoginRequestPayload {
  email: string;
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
