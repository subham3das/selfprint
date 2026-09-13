import mongoose, { Schema, Model } from 'mongoose';

export interface IStoreSettings {
  _id: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  pricing: {
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
  };
  operatingHours: {
    openTime: string;
    closeTime: string;
    isOpenSunday: boolean;
  };
  branding: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    description: string;
    website: string;
    supportNumber: string;
  };
  receipt: {
    headerText: string;
    footerText: string;
    invoicePrefix: string;
    notes: string;
    autoPrint: boolean;
    paperWidth: string;
    showTaxBreakdown: boolean;
  };
  notifications: {
    soundOnNewJob: boolean;
    browserNotifications: boolean;
    emailNotifications: boolean;
    lowPaperAlert: boolean;
    lowInkAlert: boolean;
    printerOfflineAlert: boolean;
  };
  preferences: {
    autoRefreshInterval: string;
    theme: string;
    language: string;
    showLowStockAlerts: boolean;
    showRevenueOnDashboard: boolean;
  };
  security: {
    twoFactorAuth: boolean;
    sessionTimeoutMinutes: number;
    autoLogout: boolean;
  };
  printer: {
    selectedPrinter: string;
    printerModel: string;
    defaultPaperSize: string;
    defaultPrintType: string;
    autoStartAfterPayment: boolean;
    doubleSidedDefault: boolean;
    paperSaveMode: boolean;
    isPaused: boolean;
    testMode?: boolean;
  };
  maxFileUploadSizeMB: number;
  allowGuestPrints: boolean;
  autoPrintQueue: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const storeSettingsSchema = new Schema<IStoreSettings>(
  {
    storeId: {
      type: Schema.Types.ObjectId,
      ref: 'Store',
      required: [true, 'Store reference is required']
    },
    pricing: {
      bwA4Price: { type: Number, default: 2.0 },
      bwA3Price: { type: Number, default: 4.0 },
      colorA4Price: { type: Number, default: 6.0 },
      colorA3Price: { type: Number, default: 12.0 },
      extraCopyA4Price: { type: Number, default: 1.0 },
      extraCopyA3Price: { type: Number, default: 2.0 },
      minimumOrderPrice: { type: Number, default: 2.0 },
      serviceCharge: { type: Number, default: 0.0 },
      duplexDiscount: { type: Number, default: 0.5 },
      emergencyPrintCharge: { type: Number, default: 5.0 }
    },
    operatingHours: {
      openTime: { type: String, default: '08:00 AM' },
      closeTime: { type: String, default: '10:00 PM' },
      isOpenSunday: { type: Boolean, default: true }
    },
    branding: {
      primaryColor: { type: String, default: '#6366F1' },
      secondaryColor: { type: String, default: '#1E293B' },
      accentColor: { type: String, default: '#EC4899' },
      description: { type: String, default: 'High quality instant document printing & binding kiosk.' },
      website: { type: String, default: '' },
      supportNumber: { type: String, default: '' }
    },
    receipt: {
      headerText: { type: String, default: 'Thank you for printing with us!' },
      footerText: { type: String, default: 'Keep this receipt for job collection.' },
      invoicePrefix: { type: String, default: 'INV' },
      notes: { type: String, default: 'No refunds once printing has commenced.' },
      autoPrint: { type: Boolean, default: true },
      paperWidth: { type: String, default: '80mm' },
      showTaxBreakdown: { type: Boolean, default: true }
    },
    notifications: {
      soundOnNewJob: { type: Boolean, default: true },
      browserNotifications: { type: Boolean, default: true },
      emailNotifications: { type: Boolean, default: false },
      lowPaperAlert: { type: Boolean, default: true },
      lowInkAlert: { type: Boolean, default: true },
      printerOfflineAlert: { type: Boolean, default: true }
    },
    preferences: {
      autoRefreshInterval: { type: String, default: '10 Seconds' },
      theme: { type: String, default: 'Light' },
      language: { type: String, default: 'English' },
      showLowStockAlerts: { type: Boolean, default: true },
      showRevenueOnDashboard: { type: Boolean, default: true }
    },
    security: {
      twoFactorAuth: { type: Boolean, default: false },
      sessionTimeoutMinutes: { type: Number, default: 60 },
      autoLogout: { type: Boolean, default: true }
    },
    printer: {
      selectedPrinter: { type: String, default: 'No Printer Selected' },
      printerModel: { type: String, default: 'Not Configured' },
      defaultPaperSize: { type: String, default: 'A4' },
      defaultPrintType: { type: String, default: 'Black & White' },
      autoStartAfterPayment: { type: Boolean, default: true },
      doubleSidedDefault: { type: Boolean, default: false },
      paperSaveMode: { type: Boolean, default: false },
      isPaused: { type: Boolean, default: false },
      testMode: { type: Boolean, default: false }
    },
    maxFileUploadSizeMB: { type: Number, default: 50 },
    allowGuestPrints: { type: Boolean, default: true },
    autoPrintQueue: { type: Boolean, default: true }
  },
  {
    timestamps: true,
    collection: 'store_settings'
  }
);

storeSettingsSchema.index({ storeId: 1 }, { unique: true });

export const StoreSettingsModel: Model<IStoreSettings> =
  mongoose.models.StoreSettings ||
  mongoose.model<IStoreSettings>('StoreSettings', storeSettingsSchema);

export default StoreSettingsModel;
