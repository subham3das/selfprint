export type QRTemplateType =
  | 'default'
  | 'minimal'
  | 'rounded'
  | 'dark'
  | 'colorful'
  | 'classic';

export interface QRConfigDto {
  storeName: string;
  branchName: string;
  storeLocation: string;
  storeId: string;
  storeCode: string;
  storeUrl: string;
  qrToken: string;
  version: number;
  primaryColor: string;
  secondaryColor: string;
  uploadLimitMb: number;
  expiry: string;
  welcomeMessage: string;
  logoUrl?: string;
  template: QRTemplateType;
  totalScans: number;
  downloadsCount: number;
}

export interface QRHistoryItemDto {
  id: string;
  name: string;
  location: string;
  createdOn: string;
  expiry: string;
  version: number;
  qrToken?: string;
  status: 'Active' | 'Expired' | 'Revoked';
  url: string;
  downloadsCount: number;
}

export interface QRAnalyticsDto {
  totalScans: number;
  todayScans: number;
  weeklyScans: number;
  monthlyScans: number;
  uniqueVisitors: number;
  successfulUploads: number;
  ordersCreated: number;
  conversionRate: number;
}
