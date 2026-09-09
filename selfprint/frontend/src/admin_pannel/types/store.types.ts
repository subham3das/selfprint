export type StorePlan = 'Basic' | 'Pro' | 'Enterprise';

export type StoreStatus =
  | 'Online'
  | 'Busy'
  | 'Offline'
  | 'Pending'
  | 'Suspended';

export interface AdminStoreItem {
  id: string;
  storeIdCode: string; // e.g. "SP-10239"
  name: string;
  email: string;
  logoText: string;
  logoBgColor: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail?: string;
  city: string;
  state: string;
  fullAddress: string;
  pincode?: string;
  plan: StorePlan;
  ordersCount: number;
  revenueRaw: number;
  revenueFormatted: string;
  commissionRaw: number;
  commissionFormatted: string;
  commissionRate: number; // e.g. 10
  status: StoreStatus;
  lastActive: string;
  printerCount: number;
  qrGenerated: boolean;
  joinedDate: string;
}

export interface StoreStatsData {
  totalStores: number;
  activeStores: number;
  activePercent: string;
  offlineStores: number;
  offlinePercent: string;
  pendingApproval: number;
  pendingPercent: string;
  suspendedStores: number;
  suspendedPercent: string;
  totalCities: number;
}

export interface StoreFilterState {
  searchQuery: string;
  status: string; // 'All' | StoreStatus
  city: string; // 'All' | string
  plan: string; // 'All' | StorePlan
}

export interface StoreFormValues {
  name: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  city: string;
  state: string;
  fullAddress: string;
  pincode: string;
  commissionRate: number;
  plan: StorePlan;
  printerCount: number;
  status: StoreStatus;
}
