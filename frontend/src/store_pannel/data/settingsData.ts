import { StoreFullSettings } from '../types/settings.types';

export const initialStoreSettings: StoreFullSettings = {
  general: {
    storeName: 'Demo Print Store',
    branchName: 'Main Branch',
    storeOwnerName: 'Subham Das',
    storePhone: '9876543210',
    storeEmail: 'contact@demoprintstore.com',
    storeLocation: 'Koramangala, Bengaluru, Karnataka 560034',
    storeAddress:
      'Shop No. 12, 1st Floor, 8th Main, Koramangala 4th Block, Bengaluru, Karnataka 560034',
    gstNumber: '29ABCDE1234F1Z5',
    openingTime: '08:00 AM',
    closingTime: '10:00 PM',
    timezone: 'Asia/Kolkata (IST)'
  },
  printer: {
    selectedPrinter: 'HP LaserJet 1020',
    printerModel: 'HP LaserJet 1020 Plus Series',
    defaultPaperSize: 'A4',
    defaultPrintType: 'Black & White',
    autoStartAfterPayment: true,
    doubleSidedDefault: false,
    paperSaveMode: false,
    isPaused: false,
    paperStatus: 'Full',
    inkStatus: 'Full'
  },
  pricing: {
    bwA4Price: 2.0,
    bwA3Price: 4.0,
    colorA4Price: 6.0,
    colorA3Price: 12.0,
    extraCopyA4Price: 1.0,
    extraCopyA3Price: 2.0,
    minimumOrderPrice: 2.0,
    serviceCharge: 0.0,
    duplexDiscount: 0.5,
    emergencyPrintCharge: 5.0
  },
  payment: {
    upiId: 'demoprintstore@okhdfcbank',
    merchantName: 'Demo Print Store',
    paymentGateway: 'Direct UPI',
    autoPaymentVerification: true,
    autoStartPrintingAfterPayment: true,
    cashAccepted: true
  },
  preferences: {
    autoRefreshInterval: '10 Seconds',
    theme: 'Light',
    language: 'English',
    showLowStockAlerts: true,
    showRevenueOnDashboard: true
  },
  notifications: {
    soundOnNewJob: true,
    browserNotifications: true,
    emailNotifications: false,
    lowPaperAlert: true,
    lowInkAlert: true,
    printerOfflineAlert: true
  },
  security: {
    twoFactorAuth: false,
    sessionTimeoutMinutes: 60,
    autoLogout: true
  }
};

let globalStoreSettings: StoreFullSettings = { ...initialStoreSettings };

export const getSharedStoreSettings = (): StoreFullSettings => {
  return globalStoreSettings;
};

export const updateSharedStoreSettings = (
  newSettings: Partial<StoreFullSettings>
) => {
  globalStoreSettings = {
    ...globalStoreSettings,
    ...newSettings
  };
};

export const resetSharedStoreSettings = () => {
  globalStoreSettings = { ...initialStoreSettings };
};
