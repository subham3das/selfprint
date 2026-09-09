export type QRTemplateType =
  | 'default'
  | 'minimal'
  | 'rounded'
  | 'dark'
  | 'colorful'
  | 'classic';

export interface QRConfig {
  storeName: string;
  branchName: string;
  storeLocation: string;
  storeId: string;
  storeUrl: string;
  qrToken?: string;
  version?: number;
  primaryColor: string;
  secondaryColor: string;
  uploadLimitMb: number;
  expiry: string;
  welcomeMessage: string;
  logoUrl?: string;
  template: QRTemplateType;
}

export interface QRTemplateOption {
  id: QRTemplateType;
  name: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  bgColor: string;
  fgColor: string;
  dotStyle: 'square' | 'dots' | 'rounded' | 'classy';
  badgeBg: string;
  badgeBorder: string;
}

export interface QRHistoryItem {
  id: string;
  name: string;
  location: string;
  createdOn: string;
  expiry: string;
  version?: number;
  qrToken?: string;
  status: 'Active' | 'Expired' | 'Revoked';
  url: string;
  downloadsCount: number;
}

export type ExportFormat = 'png' | 'jpg' | 'svg' | 'pdf';
