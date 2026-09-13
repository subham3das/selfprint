export interface StoreGeneralInfo {
  storeName: string;
  branchName: string;
  storeOwnerName: string;
  storePhone: string;
  storeEmail: string;
  storeLocation: string;
  storeAddress: string;
  gstNumber?: string;
  openingTime: string;
  closingTime: string;
  timezone: string;
  logoUrl?: string;
}

export interface PrinterSettingsConfig {
  selectedPrinter: string;
  printerModel: string;
  defaultPaperSize: 'A4' | 'A3' | 'Letter' | 'Legal';
  defaultPrintType: 'Black & White' | 'Color';
  autoStartAfterPayment: boolean;
  doubleSidedDefault: boolean;
  paperSaveMode: boolean;
  isPaused: boolean;
  testMode?: boolean;
  paperStatus: 'Full' | 'Medium' | 'Low';
  inkStatus: 'Full' | 'Medium' | 'Low';
}

export interface PricingSettingsConfig {
  bwA4Price: number;
  bwA3Price: number;
  colorA4Price: number;
  colorA3Price: number;
  extraCopyA4Price: number;
  extraCopyA3Price: number;
  minimumOrderPrice: number;
  serviceCharge: number;
  duplexDiscount: number;
  emergencyPrintCharge: number;
}

export interface PaymentSettingsConfig {
  upiId: string;
  merchantName: string;
  upiQrUrl?: string;
  paymentGateway: 'Direct UPI' | 'Razorpay' | 'PhonePe' | 'Cashfree';
  autoPaymentVerification: boolean;
  autoStartPrintingAfterPayment: boolean;
  cashAccepted: boolean;
}

export interface PreferencesSettingsConfig {
  autoRefreshInterval: '5 Seconds' | '10 Seconds' | '30 Seconds' | '60 Seconds';
  theme: 'Light' | 'Dark' | 'System';
  language: 'English' | 'Hindi' | 'Kannada' | 'Tamil' | 'Telugu';
  showLowStockAlerts: boolean;
  showRevenueOnDashboard: boolean;
}

export interface NotificationSettingsConfig {
  soundOnNewJob: boolean;
  browserNotifications: boolean;
  emailNotifications: boolean;
  lowPaperAlert: boolean;
  lowInkAlert: boolean;
  printerOfflineAlert: boolean;
}

export interface SecuritySettingsConfig {
  twoFactorAuth: boolean;
  sessionTimeoutMinutes: number;
  autoLogout: boolean;
}

export interface StoreFullSettings {
  general: StoreGeneralInfo;
  printer: PrinterSettingsConfig;
  pricing: PricingSettingsConfig;
  payment: PaymentSettingsConfig;
  preferences: PreferencesSettingsConfig;
  notifications: NotificationSettingsConfig;
  security: SecuritySettingsConfig;
}
