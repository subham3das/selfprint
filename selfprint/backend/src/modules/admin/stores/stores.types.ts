export type AdminStoreStatus =
  | 'ACTIVE'
  | 'INACTIVE'
  | 'SUSPENDED'
  | 'PENDING'
  | 'BLOCKED'
  | 'DELETED'
  | 'Online'
  | 'Offline'
  | 'Busy'
  | 'Suspended'
  | 'Pending'
  | 'Blocked'
  | 'Deleted'
  | 'Active';

export type AdminStorePlan = 'Basic' | 'Pro' | 'Enterprise';

export interface AdminStoreFilterQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  city?: string;
  plan?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface AdminStoreStatsResponse {
  totalStores: number;
  activeStores: number;
  activePercent: string;
  offlineStores: number;
  offlinePercent: string;
  pendingApproval: number;
  pendingPercent: string;
  suspendedStores: number;
  suspendedPercent: string;
  blockedStores: number;
  blockedPercent: string;
  deletedStores: number;
  deletedPercent: string;
  totalCities: number;
}

export interface AdminStoreListItem {
  id: string;
  storeIdCode: string;
  name: string;
  email: string;
  logoText: string;
  logoBgColor: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  city: string;
  state: string;
  fullAddress: string;
  pincode: string;
  plan: AdminStorePlan;
  ordersCount: number;
  revenueRaw: number;
  revenueFormatted: string;
  commissionRaw: number;
  commissionFormatted: string;
  commissionRate: number;
  status: 'Online' | 'Offline' | 'Busy' | 'Suspended' | 'Pending' | 'Blocked' | 'Deleted';
  rawStatus: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING' | 'BLOCKED' | 'DELETED';
  blocked?: boolean;
  blockReason?: string;
  blockedAt?: Date | string;
  isDeleted?: boolean;
  deletedAt?: Date | string;
  lastActive: string;
  printerCount: number;
  qrGenerated: boolean;
  joinedDate: string;
}

export interface CreateAdminStoreInput {
  name: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  password?: string;
  city: string;
  state?: string;
  fullAddress: string;
  pincode: string;
  plan?: AdminStorePlan;
  commissionRate?: number;
  status?: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  printerCount?: number;
}

export interface UpdateAdminStoreInput {
  name?: string;
  ownerName?: string;
  ownerPhone?: string;
  ownerEmail?: string;
  city?: string;
  state?: string;
  fullAddress?: string;
  pincode?: string;
  plan?: AdminStorePlan;
  commissionRate?: number;
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING' | 'BLOCKED' | 'DELETED' | 'Online' | 'Offline' | 'Suspended' | 'Pending' | 'Blocked' | 'Deleted';
  printerCount?: number;
}
