import { apiClient } from '@/lib/axios';
import {
  PlatformSettingsState,
  SettingsSectionKey
} from '../types/settings.types';

export const adminSettingsService = {
  /**
   * Fetch all global platform settings from MongoDB
   */
  async fetchSettings(): Promise<PlatformSettingsState> {
    const res = await apiClient.get('/admin/settings');
    const data = res.data?.data;

    return {
      general: {
        platformName: data?.general?.platformName || 'Self Print Platform',
        platformTagline: data?.general?.platformTagline || 'Automated Cloud Printing Ecosystem',
        timeZone: data?.general?.timeZone || 'Asia/Kolkata (IST +5:30)',
        dateFormat: data?.general?.dateFormat || 'DD/MM/YYYY',
        currency: data?.general?.currency || 'INR',
        language: data?.general?.language || 'English (US)'
      },
      contact: {
        supportEmail: data?.general?.supportEmail || 'support@selfprint.com',
        supportPhone: data?.general?.supportPhone || '+91 (0361) 234-5678',
        companyAddress: data?.general?.companyAddress || 'Tech Hub Guwahati, G.S. Road, Guwahati 781005'
      },
      email: {
        fromEmail: data?.general?.supportEmail || 'noreply@selfprint.com',
        fromName: data?.general?.platformName || 'Self Print Notifications',
        emailProvider: 'SendGrid Web API',
        enableEmailNotifications: data?.notifications?.emailNotifications ?? true
      },
      systemPreferences: {
        allowNewStoreRegistration: data?.platform?.allowNewStores ?? true,
        autoApproveStores: data?.platform?.autoApproveStores ?? false,
        maintenanceMode: data?.platform?.maintenanceMode ?? false,
        enableCaptcha: data?.security?.twoFactorRequired ?? false,
        defaultStoreStatus: (data?.store?.storeApprovalWorkflow === 'Automatic' ? 'Active' : 'Pending') as any
      },
      session: {
        sessionTimeout: `${Math.floor((data?.security?.sessionTimeoutMins || 480) / 60)} Hours`,
        rememberMeDuration: '30 Days',
        maxLoginAttempts: data?.security?.failedLoginLimit || 5,
        lockoutDuration: `${data?.security?.lockoutDurationMins || 15} Minutes`
      },
      systemOverview: {
        platformVersion: data?.systemOverview?.platformVersion || 'v2.4.0-prod',
        environment: data?.systemOverview?.environment || 'Production (AWS ap-south-1)',
        databaseStatus: data?.systemOverview?.databaseStatus || 'Connected',
        storageUsedPercent: data?.systemOverview?.storageUsedPercent || 28,
        activeUsers: data?.systemOverview?.activeUsers || 0,
        totalStores: data?.systemOverview?.totalStores || 0,
        totalPrinters: data?.systemOverview?.totalPrinters || 0
      },
      integrations: (data?.integrations || []).map((i: any) => ({
        id: i.id,
        name: i.name,
        category: i.category,
        iconType: i.provider?.toLowerCase().includes('razor')
          ? 'razorpay'
          : i.provider?.toLowerCase().includes('sendgrid')
          ? 'sendgrid'
          : i.provider?.toLowerCase().includes('firebase')
          ? 'firebase'
          : 'cloudinary',
        status: i.status || 'Connected'
      }))
    };
  },

  /**
   * Update a specific section in MongoDB
   */
  async updateSection(section: SettingsSectionKey, data: any): Promise<void> {
    await apiClient.patch(`/admin/settings/${section}`, data);
  },

  /**
   * Dispatch test email
   */
  async testEmail(recipientEmail: string): Promise<{ success: boolean; message: string }> {
    const res = await apiClient.post('/admin/settings/test-email', { recipientEmail });
    return res.data;
  },

  /**
   * Test third-party integration connection
   */
  async testIntegration(provider: string): Promise<{ success: boolean; latencyMs: number }> {
    const res = await apiClient.post('/admin/settings/test-integration', { provider });
    return res.data?.data;
  },

  /**
   * Trigger platform database snapshot backup
   */
  async triggerBackup(): Promise<{ backupId: string; sizeMb: number }> {
    const res = await apiClient.post('/admin/settings/backup');
    return res.data?.data;
  },

  /**
   * Perform Danger Zone Action
   */
  async dangerAction(action: 'clear_cache' | 'clear_sessions' | 'reset_settings' | 'purge_test_data'): Promise<{ message: string }> {
    const res = await apiClient.post('/admin/settings/danger-action', { action });
    return res.data;
  }
};

export default adminSettingsService;
