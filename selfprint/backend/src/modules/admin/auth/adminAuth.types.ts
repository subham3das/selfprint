import { AdminRole, AdminStatus } from '../../../models/admin.model';

export interface AdminLoginDto {
  email: string;
  password?: string;
}

export interface AdminGoogleLoginDto {
  credential?: string; // Google ID Token
  accessToken?: string; // Google OAuth access token
  email?: string; // Verified email
  name?: string;
  picture?: string;
}

export interface AdminAuthResponseDto {
  token: string;
  admin: {
    id: string;
    name: string;
    displayName: string;
    email: string;
    role: AdminRole;
    status: AdminStatus;
    department?: string;
    permissions: any;
    avatar?: string;
    lastLogin?: Date;
  };
}

export interface AdminProfileDto {
  id: string;
  name: string;
  displayName: string;
  email: string;
  role: AdminRole;
  status: AdminStatus;
  department?: string;
  permissions: any;
  avatar?: string;
  createdAt: Date;
  lastLogin?: Date;
  lastActive?: Date;
}
