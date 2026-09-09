import mongoose, { Schema, Model } from 'mongoose';

export interface IGeneralSettings {
  platformName: string;
  platformTagline: string;
  logoUrl?: string;
  faviconUrl?: string;
  timeZone: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  currency: string;
  currencySymbol: string;
  language: string;
  country: string;
  region: string;
  companyName: string;
  gstNumber: string;
  registrationNumber: string;
  websiteUrl: string;
  supportEmail: string;
  supportPhone: string;
  companyAddress: string;
  copyrightFooter: string;
}

export interface IPlatformBehaviorSettings {
  maintenanceMode: boolean;
  maintenanceBannerText: string;
  publicRegistration: boolean;
  allowNewStores: boolean;
  autoApproveStores: boolean;
  enableGuestPrinting: boolean;
  defaultUserRole: string;
  platformVisibility: 'Public' | 'Restricted' | 'Private';
  maxUploadSizeMb: number;
  allowedFileTypes: string[];
  defaultPrintExpiryHours: number;
  autoDeleteExpiredFiles: boolean;
  storageProvider: 'Local' | 'Cloudinary' | 'AWS_S3';
}

export interface IStoreDefaultsSettings {
  defaultCommissionRate: number; // percentage, e.g. 10%
  storeApprovalWorkflow: 'Automatic' | 'Manual Review';
  storeVerificationRequired: boolean;
  businessHoursStart: string;
  businessHoursEnd: string;
  maxPrintersPerStore: number;
  maxStaffPerStore: number;
  storeCategories: string[];
  taxRate: number;
  invoicePrefix: string;
  invoiceFooter: string;
}

export interface IUserSettingsPolicy {
  registrationEnabled: boolean;
  emailVerificationRequired: boolean;
  phoneVerificationRequired: boolean;
  otpLoginEnabled: boolean;
  socialLoginEnabled: boolean;
  passwordMinLength: number;
  requireSpecialChar: boolean;
  defaultUserStatus: 'ACTIVE' | 'PENDING';
  allowAccountDeletion: boolean;
  sessionExpiryMinutes: number;
  allowMultiDeviceLogin: boolean;
}

export interface IPrintingDefaultsSettings {
  defaultPaperSize: 'A4' | 'A3' | 'Letter' | 'Legal';
  colorPrintingEnabled: boolean;
  duplexEnabled: boolean;
  defaultMargin: 'Normal' | 'Narrow' | 'Wide';
  printQueueTimeoutSecs: number;
  autoCancelFailedJobs: boolean;
  retryFailedJobsLimit: number;
  fileRetentionDays: number;
  watermarkEnabled: boolean;
  defaultWatermarkText: string;
  maxPagesPerJob: number;
  maxCopies: number;
  pricePerPageBw: number;
  pricePerPageColor: number;
  gstRate: number;
  defaultDpi: number;
}

export interface ISecuritySettings {
  twoFactorRequired: boolean;
  passwordExpiryDays: number;
  failedLoginLimit: number;
  lockoutDurationMins: number;
  sessionTimeoutMins: number;
  ipWhitelist: string[];
  allowedDomains: string[];
  jwtExpiryMinutes: number;
  rateLimitRequestsPerMin: number;
  forceHttps: boolean;
}

export interface INotificationChannelSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  inAppNotifications: boolean;
  webhookEnabled: boolean;
  webhookUrl: string;
  events: {
    newUser: boolean;
    newStore: boolean;
    printerOffline: boolean;
    paymentSuccess: boolean;
    paymentFailure: boolean;
    securityAlert: boolean;
  };
}

export interface IBillingSettings {
  currency: string;
  gstEnabled: boolean;
  gstNumber: string;
  defaultGstRate: number;
  invoicePrefix: string;
  invoiceFooter: string;
  paymentTermsDays: number;
  lateFeePercent: number;
  commissionModel: 'Percentage' | 'Fixed Per Print' | 'Tiered';
  refundPolicyDays: number;
}

export interface IIntegrationConfig {
  id: string;
  name: string;
  category: 'Payment' | 'OAuth' | 'Storage' | 'Communication' | 'Maps';
  provider: string;
  status: 'Connected' | 'Pending' | 'Disconnected';
  isConfigured: boolean;
  publicKey?: string;
  secretKeyMasked?: string;
  secretKeyEncrypted?: string;
  extraConfig?: Record<string, any>;
  lastTestedAt?: Date;
  testStatus?: 'Success' | 'Failed' | 'Never';
}

export interface IAppearanceSettings {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  defaultTheme: 'Light' | 'Dark' | 'System';
  sidebarStyle: 'Expanded' | 'Compact';
  animationsEnabled: boolean;
}

export interface IPlatformSettings {
  _id: mongoose.Types.ObjectId;
  key: string; // 'platform_global_settings'
  general: IGeneralSettings;
  platform: IPlatformBehaviorSettings;
  store: IStoreDefaultsSettings;
  user: IUserSettingsPolicy;
  printing: IPrintingDefaultsSettings;
  security: ISecuritySettings;
  notifications: INotificationChannelSettings;
  billing: IBillingSettings;
  integrations: IIntegrationConfig[];
  appearance: IAppearanceSettings;
  systemOverview: {
    platformVersion: string;
    nodeVersion: string;
    environment: string;
    databaseStatus: 'Connected' | 'Degraded' | 'Disconnected';
    storageUsedPercent: number;
    lastBackupDate?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const platformSettingsSchema = new Schema<IPlatformSettings>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: 'platform_global_settings'
    },
    general: {
      platformName: { type: String, default: 'Self Print Platform' },
      platformTagline: { type: String, default: 'Automated Cloud Printing Ecosystem' },
      logoUrl: { type: String, default: '' },
      faviconUrl: { type: String, default: '' },
      timeZone: { type: String, default: 'Asia/Kolkata (IST +5:30)' },
      dateFormat: { type: String, default: 'DD/MM/YYYY' },
      timeFormat: { type: String, default: '12h' },
      currency: { type: String, default: 'INR' },
      currencySymbol: { type: String, default: '₹' },
      language: { type: String, default: 'English (US)' },
      country: { type: String, default: 'India' },
      region: { type: String, default: 'Assam, Northeast' },
      companyName: { type: String, default: 'Self Print Technologies Pvt. Ltd.' },
      gstNumber: { type: String, default: '18AABCS1234F1Z5' },
      registrationNumber: { type: String, default: 'U72900AS2024PTC021948' },
      websiteUrl: { type: String, default: 'https://selfprint.com' },
      supportEmail: { type: String, default: 'support@selfprint.com' },
      supportPhone: { type: String, default: '+91 (0361) 234-5678' },
      companyAddress: { type: String, default: 'Tech Hub Guwahati, G.S. Road, Guwahati 781005' },
      copyrightFooter: { type: String, default: '© 2026 Self Print Platform. All rights reserved.' }
    },
    platform: {
      maintenanceMode: { type: Boolean, default: false },
      maintenanceBannerText: { type: String, default: 'Scheduled system maintenance in progress.' },
      publicRegistration: { type: Boolean, default: true },
      allowNewStores: { type: Boolean, default: true },
      autoApproveStores: { type: Boolean, default: false },
      enableGuestPrinting: { type: Boolean, default: true },
      defaultUserRole: { type: String, default: 'Customer' },
      platformVisibility: { type: String, default: 'Public' },
      maxUploadSizeMb: { type: Number, default: 50 },
      allowedFileTypes: { type: [String], default: ['.pdf', '.docx', '.jpg', '.png'] },
      defaultPrintExpiryHours: { type: Number, default: 24 },
      autoDeleteExpiredFiles: { type: Boolean, default: true },
      storageProvider: { type: String, default: 'Local' }
    },
    store: {
      defaultCommissionRate: { type: Number, default: 10 },
      storeApprovalWorkflow: { type: String, default: 'Manual Review' },
      storeVerificationRequired: { type: Boolean, default: true },
      businessHoursStart: { type: String, default: '08:00 AM' },
      businessHoursEnd: { type: String, default: '10:00 PM' },
      maxPrintersPerStore: { type: Number, default: 10 },
      maxStaffPerStore: { type: Number, default: 5 },
      storeCategories: { type: [String], default: ['Print Hub', 'Cyber Cafe', 'Stationery', 'University'] },
      taxRate: { type: Number, default: 18 },
      invoicePrefix: { type: String, default: 'SP-INV' },
      invoiceFooter: { type: String, default: 'Thank you for printing with Self Print.' }
    },
    user: {
      registrationEnabled: { type: Boolean, default: true },
      emailVerificationRequired: { type: Boolean, default: true },
      phoneVerificationRequired: { type: Boolean, default: true },
      otpLoginEnabled: { type: Boolean, default: true },
      socialLoginEnabled: { type: Boolean, default: false },
      passwordMinLength: { type: Number, default: 8 },
      requireSpecialChar: { type: Boolean, default: true },
      defaultUserStatus: { type: String, default: 'ACTIVE' },
      allowAccountDeletion: { type: Boolean, default: true },
      sessionExpiryMinutes: { type: Number, default: 1440 },
      allowMultiDeviceLogin: { type: Boolean, default: true }
    },
    printing: {
      defaultPaperSize: { type: String, default: 'A4' },
      colorPrintingEnabled: { type: Boolean, default: true },
      duplexEnabled: { type: Boolean, default: true },
      defaultMargin: { type: String, default: 'Normal' },
      printQueueTimeoutSecs: { type: Number, default: 300 },
      autoCancelFailedJobs: { type: Boolean, default: true },
      retryFailedJobsLimit: { type: Number, default: 3 },
      fileRetentionDays: { type: Number, default: 7 },
      watermarkEnabled: { type: Boolean, default: false },
      defaultWatermarkText: { type: String, default: 'SELFPRINT CONFIDENTIAL' },
      maxPagesPerJob: { type: Number, default: 200 },
      maxCopies: { type: Number, default: 20 },
      pricePerPageBw: { type: Number, default: 2.0 },
      pricePerPageColor: { type: Number, default: 10.0 },
      gstRate: { type: Number, default: 18 },
      defaultDpi: { type: Number, default: 300 }
    },
    security: {
      twoFactorRequired: { type: Boolean, default: false },
      passwordExpiryDays: { type: Number, default: 90 },
      failedLoginLimit: { type: Number, default: 5 },
      lockoutDurationMins: { type: Number, default: 15 },
      sessionTimeoutMins: { type: Number, default: 480 },
      ipWhitelist: { type: [String], default: [] },
      allowedDomains: { type: [String], default: ['selfprint.com', 'localhost'] },
      jwtExpiryMinutes: { type: Number, default: 1440 },
      rateLimitRequestsPerMin: { type: Number, default: 120 },
      forceHttps: { type: Boolean, default: true }
    },
    notifications: {
      emailNotifications: { type: Boolean, default: true },
      smsNotifications: { type: Boolean, default: true },
      pushNotifications: { type: Boolean, default: true },
      inAppNotifications: { type: Boolean, default: true },
      webhookEnabled: { type: Boolean, default: false },
      webhookUrl: { type: String, default: '' },
      events: {
        newUser: { type: Boolean, default: true },
        newStore: { type: Boolean, default: true },
        printerOffline: { type: Boolean, default: true },
        paymentSuccess: { type: Boolean, default: true },
        paymentFailure: { type: Boolean, default: true },
        securityAlert: { type: Boolean, default: true }
      }
    },
    billing: {
      currency: { type: String, default: 'INR' },
      gstEnabled: { type: Boolean, default: true },
      gstNumber: { type: String, default: '18AABCS1234F1Z5' },
      defaultGstRate: { type: Number, default: 18 },
      invoicePrefix: { type: String, default: 'SP-INV' },
      invoiceFooter: { type: String, default: 'Computer generated invoice. No signature required.' },
      paymentTermsDays: { type: Number, default: 7 },
      lateFeePercent: { type: Number, default: 2 },
      commissionModel: { type: String, default: 'Percentage' },
      refundPolicyDays: { type: Number, default: 3 }
    },
    integrations: {
      type: [
        {
          id: String,
          name: String,
          category: String,
          provider: String,
          status: { type: String, default: 'Connected' },
          isConfigured: { type: Boolean, default: true },
          publicKey: String,
          secretKeyMasked: String,
          secretKeyEncrypted: String,
          extraConfig: Schema.Types.Mixed,
          lastTestedAt: Date,
          testStatus: { type: String, default: 'Success' }
        }
      ],
      default: [
        {
          id: 'int-razorpay',
          name: 'Razorpay Gateway',
          category: 'Payment',
          provider: 'Razorpay',
          status: 'Connected',
          isConfigured: true,
          publicKey: 'rzp_live_9a8B7c6D5e4F3g',
          secretKeyMasked: '••••••••••••••••••••••••',
          testStatus: 'Success'
        },
        {
          id: 'int-sendgrid',
          name: 'SendGrid Email API',
          category: 'Communication',
          provider: 'SendGrid',
          status: 'Connected',
          isConfigured: true,
          publicKey: 'SG.live_auth_token_key',
          secretKeyMasked: '••••••••••••••••••••••••',
          testStatus: 'Success'
        },
        {
          id: 'int-firebase',
          name: 'Firebase Push Messaging',
          category: 'Communication',
          provider: 'Firebase',
          status: 'Connected',
          isConfigured: true,
          publicKey: 'selfprint-fcm-prod',
          secretKeyMasked: '••••••••••••••••••••••••',
          testStatus: 'Success'
        },
        {
          id: 'int-cloudinary',
          name: 'Cloudinary CDN Asset Storage',
          category: 'Storage',
          provider: 'Cloudinary',
          status: 'Connected',
          isConfigured: true,
          publicKey: 'selfprint-cloud-storage',
          secretKeyMasked: '••••••••••••••••••••••••',
          testStatus: 'Success'
        }
      ]
    },
    appearance: {
      primaryColor: { type: String, default: '#4F46E5' },
      secondaryColor: { type: String, default: '#7C3AED' },
      accentColor: { type: String, default: '#10B981' },
      defaultTheme: { type: String, default: 'Light' },
      sidebarStyle: { type: String, default: 'Expanded' },
      animationsEnabled: { type: Boolean, default: true }
    },
    systemOverview: {
      platformVersion: { type: String, default: 'v2.4.0-prod' },
      nodeVersion: { type: String, default: 'v20.18.0' },
      environment: { type: String, default: 'Production (AWS ap-south-1)' },
      databaseStatus: { type: String, default: 'Connected' },
      storageUsedPercent: { type: Number, default: 28 },
      lastBackupDate: { type: Date, default: Date.now }
    }
  },
  {
    timestamps: true,
    collection: 'platform_settings'
  }
);

export const PlatformSettingsModel: Model<IPlatformSettings> =
  mongoose.models.PlatformSettings ||
  mongoose.model<IPlatformSettings>('PlatformSettings', platformSettingsSchema);

export default PlatformSettingsModel;
