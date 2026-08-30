export type SettingsTab =
  | 'General'
  | 'Platform'
  | 'Stores'
  | 'Users'
  | 'Printing'
  | 'Security'
  | 'Notifications'
  | 'Billing'
  | 'Integrations'
  | 'System';

export interface GeneralSettingsFormValues {
  platformName: string;
  platformTagline: string;
  timeZone: string;
  dateFormat: string;
  currency: string;
  language: string;
}

export interface ContactInfoFormValues {
  supportEmail: string;
  supportPhone: string;
  companyAddress: string;
}

export interface EmailSettingsFormValues {
  fromEmail: string;
  fromName: string;
  emailProvider: string;
  enableEmailNotifications: boolean;
}

export interface SystemPreferencesFormValues {
  allowNewStoreRegistration: boolean;
  autoApproveStores: boolean;
  maintenanceMode: boolean;
  enableCaptcha: boolean;
  defaultStoreStatus: 'Active' | 'Pending' | 'Suspended';
}

export interface SessionSettingsFormValues {
  sessionTimeout: string;
  rememberMeDuration: string;
  maxLoginAttempts: number;
  lockoutDuration: string;
}

export interface SystemOverviewData {
  platformVersion: string;
  environment: string;
  databaseStatus: 'Connected' | 'Degraded' | 'Disconnected';
  storageUsedPercent: number;
  activeUsers: number;
  totalStores: number;
  totalPrinters: number;
}

export interface IntegrationItem {
  id: string;
  name: string;
  category: string;
  iconType: 'razorpay' | 'sendgrid' | 'firebase' | 'cloudinary';
  status: 'Connected' | 'Pending' | 'Disconnected';
}

export interface PlatformSettingsState {
  general: GeneralSettingsFormValues;
  contact: ContactInfoFormValues;
  email: EmailSettingsFormValues;
  systemPreferences: SystemPreferencesFormValues;
  session: SessionSettingsFormValues;
  systemOverview: SystemOverviewData;
  integrations: IntegrationItem[];
}
