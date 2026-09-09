import { apiClient } from '@/lib/axios';
import {
  StoreFullSettings,
  StoreGeneralInfo,
  PricingSettingsConfig,
  PaymentSettingsConfig,
  PrinterSettingsConfig,
  PreferencesSettingsConfig,
  NotificationSettingsConfig
} from '../types/settings.types';

export interface SystemInfo {
  appVersion: string;
  backendVersion: string;
  apiVersion: string;
  databaseStatus: string;
  uptimeSeconds: number;
  nodeVersion: string;
  environment: string;
  buildNumber: string;
  lastUpdated: string;
}

export const storeSettingsService = {
  /**
   * Fetches full store settings from MongoDB
   */
  async fetchFullSettings(): Promise<StoreFullSettings> {
    const res = await apiClient.get('/store/settings');
    return res.data?.data?.settings;
  },

  /**
   * Updates General Store Info & Branding
   */
  async updateGeneralSettings(general: Partial<StoreGeneralInfo>): Promise<StoreFullSettings> {
    const res = await apiClient.patch('/store/settings', general);
    return res.data?.data?.settings;
  },

  /**
   * Updates Print Pricing Config
   */
  async updatePricingSettings(pricing: Partial<PricingSettingsConfig>): Promise<StoreFullSettings> {
    const res = await apiClient.patch('/store/settings/pricing', pricing);
    return res.data?.data?.settings;
  },

  /**
   * Updates Payment Settings & UPI
   */
  async updatePaymentSettings(payment: Partial<PaymentSettingsConfig>): Promise<StoreFullSettings> {
    const res = await apiClient.patch('/store/settings/payment', payment);
    return res.data?.data?.settings;
  },

  /**
   * Updates Printer Spooler & Preferences
   */
  async updatePrinterSettings(printer: Partial<PrinterSettingsConfig>): Promise<StoreFullSettings> {
    const res = await apiClient.patch('/store/settings/printer', printer);
    return res.data?.data?.settings;
  },

  /**
   * Updates User UI Preferences
   */
  async updatePreferencesSettings(
    preferences: Partial<PreferencesSettingsConfig>
  ): Promise<StoreFullSettings> {
    const res = await apiClient.patch('/store/settings/preferences', preferences);
    return res.data?.data?.settings;
  },

  /**
   * Updates Notification & Alert Preferences
   */
  async updateNotificationSettings(
    notifications: Partial<NotificationSettingsConfig>
  ): Promise<StoreFullSettings> {
    const res = await apiClient.patch('/store/settings/notifications', notifications);
    return res.data?.data?.settings;
  },

  /**
   * Updates Receipt Formatting Settings
   */
  async updateReceiptSettings(receipt: any): Promise<StoreFullSettings> {
    const res = await apiClient.patch('/store/settings/receipt', receipt);
    return res.data?.data?.settings;
  },

  /**
   * Exports Store Configuration JSON Backup
   */
  async exportBackup(): Promise<void> {
    const res = await apiClient.get('/store/settings/backup', { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `store_settings_backup_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  /**
   * Restores Store Configuration from JSON Backup
   */
  async restoreBackup(backupData: any): Promise<StoreFullSettings> {
    const res = await apiClient.post('/store/settings/restore', backupData);
    return res.data?.data?.settings;
  },

  /**
   * Reads System Info & Diagnostics
   */
  async fetchSystemInfo(): Promise<SystemInfo> {
    const res = await apiClient.get('/store/settings/system-info');
    return res.data?.data?.systemInfo;
  }
};
