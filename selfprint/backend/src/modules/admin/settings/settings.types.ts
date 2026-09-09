import {
  IGeneralSettings,
  IPlatformBehaviorSettings,
  IStoreDefaultsSettings,
  IUserSettingsPolicy,
  IPrintingDefaultsSettings,
  ISecuritySettings,
  INotificationChannelSettings,
  IBillingSettings,
  IIntegrationConfig,
  IAppearanceSettings
} from '../../../models/platformSettings.model';

export type SettingsSectionKey =
  | 'general'
  | 'platform'
  | 'store'
  | 'user'
  | 'printing'
  | 'security'
  | 'notifications'
  | 'billing'
  | 'integrations'
  | 'appearance'
  | 'contact'
  | 'email'
  | 'systemPreferences'
  | 'session';

export interface SystemOverviewDTO {
  platformVersion: string;
  nodeVersion: string;
  environment: string;
  databaseStatus: 'Connected' | 'Degraded' | 'Disconnected';
  storageUsedPercent: number;
  activeUsers: number;
  totalStores: number;
  totalPrinters: number;
  lastBackupDate: string;
}

export interface PlatformSettingsDTO {
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
  systemOverview: SystemOverviewDTO;
}

export interface TestEmailRequest {
  host?: string;
  port?: number;
  recipientEmail: string;
}

export interface TestIntegrationRequest {
  provider: string;
  publicKey?: string;
}

export interface DangerActionRequest {
  action: 'clear_cache' | 'clear_sessions' | 'reset_settings' | 'purge_test_data';
  passwordConfirmation?: string;
}
