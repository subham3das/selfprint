import { PlatformSettingsState } from '../types/settings.types';

export const INITIAL_SETTINGS_MOCK: PlatformSettingsState = {
  general: {
    platformName: 'Self Print Platform',
    platformTagline: 'All your print services managed in one place.',
    timeZone: 'Asia/Kolkata (GMT+05:30)',
    dateFormat: '29 May 2025 (DD MMM YYYY)',
    currency: 'Indian Rupee (₹)',
    language: 'English'
  },
  contact: {
    supportEmail: 'support@selfprint.com',
    supportPhone: '+91 98765 43210',
    companyAddress: 'Self Print Platform\n123 Print Street, Dibrugarh\nAssam, India - 786001'
  },
  email: {
    fromEmail: 'noreply@selfprint.com',
    fromName: 'Self Print Platform',
    emailProvider: 'Gmail SMTP',
    enableEmailNotifications: true
  },
  systemPreferences: {
    allowNewStoreRegistration: true,
    autoApproveStores: false,
    maintenanceMode: false,
    enableCaptcha: true,
    defaultStoreStatus: 'Pending'
  },
  session: {
    sessionTimeout: '30 Minutes',
    rememberMeDuration: '7 Days',
    maxLoginAttempts: 5,
    lockoutDuration: '30 Minutes'
  },
  systemOverview: {
    platformVersion: 'v2.4.1',
    environment: 'Production',
    databaseStatus: 'Connected',
    storageUsedPercent: 62,
    activeUsers: 10428,
    totalStores: 248,
    totalPrinters: 542
  },
  integrations: [
    {
      id: 'int-razorpay',
      name: 'Razorpay',
      category: 'Payment Gateway',
      iconType: 'razorpay',
      status: 'Connected'
    },
    {
      id: 'int-sendgrid',
      name: 'SendGrid',
      category: 'Email Service',
      iconType: 'sendgrid',
      status: 'Connected'
    },
    {
      id: 'int-firebase',
      name: 'Firebase',
      category: 'Push Notifications',
      iconType: 'firebase',
      status: 'Connected'
    },
    {
      id: 'int-cloudinary',
      name: 'Cloudinary',
      category: 'Media Storage',
      iconType: 'cloudinary',
      status: 'Pending'
    }
  ]
};
