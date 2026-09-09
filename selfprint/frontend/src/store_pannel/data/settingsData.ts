import { StoreFullSettings } from '../types/settings.types';

export const emptyStoreSettings: StoreFullSettings = {
  general: {
    storeName: '',
    branchName: '',
    storeOwnerName: '',
    storePhone: '',
    storeEmail: '',
    storeLocation: '',
    storeAddress: '',
    gstNumber: '',
    openingTime: '08:00 AM',
    closingTime: '10:00 PM',
    timezone: 'Asia/Kolkata (IST)'
  },
  printer: {
    selectedPrinter: 'No Printer Selected',
    printerModel: 'Not Configured',
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
    upiId: '',
    merchantName: '',
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

export const initialStoreSettings = emptyStoreSettings;
