export type StorePlan = 'Basic' | 'Pro' | 'Enterprise';

export type StoreStatus =
  | 'Online'
  | 'Active'
  | 'Busy'
  | 'Offline'
  | 'Pending'
  | 'Suspended'
  | 'Blocked'
  | 'Deleted';

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
  rawStatus?: string;
  blocked?: boolean;
  blockReason?: string;
  blockedAt?: string;
  isDeleted?: boolean;
  deletedAt?: string;
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
  blockedStores?: number;
  blockedPercent?: string;
  deletedStores?: number;
  deletedPercent?: string;
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


export interface StoreBankDetails {
  storeId: string;
  storeName: string;
  accountHolderName: string;
  bankName: string;
  branchName?: string;
  accountNumber: string;
  ifscCode: string;
  upiId?: string;
  settlementMethod: 'Bank Transfer' | 'UPI' | string;
  verificationStatus: 'Verified' | 'Pending' | 'Rejected' | string;
  isVerified: boolean;
  verifiedAt?: string;
  updatedAt?: string;
  isMasked: boolean;
}

export interface SettlementSummaryData {
  completedOrders?: number;
  failedOrders?: number;
  cancelledOrders?: number;
  grossRevenue?: number;
  gstOnCommission?: number;
  refundAmount?: number;

  storeId: string;
  storeName: string;
  totalOrders: number;
  totalRevenue: number;
  commission: number;
  platformCommission: number;
  pendingSettlement: number;
  alreadySettled: number;
  settledAmount: number;
  netMerchantShare: number;
  nextSettlementDate: string;
}

export interface SettlementRecord {
  utr?: string;
  bankReference?: string;
  grossRevenue?: number;
  platformCommission?: number;
  gstOnCommission?: number;
  netSettlement?: number;

  id: string;
  storeId: string;
  amount: number;
  commission?: number;
  netAmount?: number;
  referenceNo: string;
  transactionReference: string;
  paymentMethod: string;
  status: 'Completed' | 'Pending' | 'Failed' | 'COMPLETED' | 'PENDING' | 'FAILED' | string;
  processedBy: string;
  processedAt: string;
  date: string;
  notes?: string;
}

export interface CreateSettlementInput {
  amount: number;
  transactionReference: string;
  paymentMethod?: string;
  notes?: string;
}
