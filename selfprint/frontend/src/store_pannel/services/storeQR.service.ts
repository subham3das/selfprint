import { apiClient } from '@/lib/axios';
import { QRConfig, QRHistoryItem } from '../types/qr.types';

export interface QRAnalyticsData {
  totalScans: number;
  todayScans: number;
  weeklyScans: number;
  monthlyScans: number;
  uniqueVisitors: number;
  successfulUploads: number;
  ordersCreated: number;
  conversionRate: number;
}

export const storeQRService = {
  /**
   * Fetches real store QR configuration from MongoDB
   */
  async fetchQRConfig(): Promise<QRConfig> {
    const res = await apiClient.get('/qr/config');
    const data = res.data?.data?.config;
    return {
      storeName: data?.storeName || 'My Print Store',
      branchName: data?.branchName || 'Main Branch',
      storeLocation: data?.storeLocation || 'Store Location',
      storeId: data?.storeId || 'SP1001',
      storeUrl: data?.storeUrl || `https://selfprint.in/store/${data?.storeId || 'SP1001'}`,
      qrToken: data?.qrToken,
      version: data?.version || 1,
      primaryColor: data?.primaryColor || '#6366F1',
      secondaryColor: data?.secondaryColor || '#1E293B',
      uploadLimitMb: data?.uploadLimitMb || 50,
      expiry: data?.expiry || 'No Expiry',
      welcomeMessage: data?.welcomeMessage || 'Scan to upload documents instantly & pick up your high quality prints!',
      logoUrl: data?.logoUrl,
      template: data?.template || 'default'
    };
  },

  /**
   * Updates store QR branding, styling, and colors in MongoDB
   */
  async updateQRConfig(config: Partial<QRConfig>): Promise<QRConfig> {
    const res = await apiClient.post('/qr/update-config', config);
    const data = res.data?.data?.config;
    return {
      storeName: data?.storeName || 'My Print Store',
      branchName: data?.branchName || 'Main Branch',
      storeLocation: data?.storeLocation || 'Store Location',
      storeId: data?.storeId || 'SP1001',
      storeUrl: data?.storeUrl || `https://selfprint.in/store/${data?.storeId || 'SP1001'}`,
      qrToken: data?.qrToken,
      version: data?.version || 1,
      primaryColor: data?.primaryColor || '#6366F1',
      secondaryColor: data?.secondaryColor || '#1E293B',
      uploadLimitMb: data?.uploadLimitMb || 50,
      expiry: data?.expiry || 'No Expiry',
      welcomeMessage: data?.welcomeMessage || 'Scan to upload documents instantly & pick up your high quality prints!',
      logoUrl: data?.logoUrl,
      template: data?.template || 'default'
    };
  },

  /**
   * Regenerates a new QR version entry in MongoDB history
   */
  async regenerateQR(): Promise<QRConfig> {
    const res = await apiClient.post('/qr/regenerate');
    const data = res.data?.data?.config;
    return {
      storeName: data?.storeName || 'My Print Store',
      branchName: data?.branchName || 'Main Branch',
      storeLocation: data?.storeLocation || 'Store Location',
      storeId: data?.storeId || 'SP1001',
      storeUrl: data?.storeUrl || `https://selfprint.in/store/${data?.storeId || 'SP1001'}`,
      qrToken: data?.qrToken,
      version: data?.version || 1,
      primaryColor: data?.primaryColor || '#6366F1',
      secondaryColor: data?.secondaryColor || '#1E293B',
      uploadLimitMb: data?.uploadLimitMb || 50,
      expiry: data?.expiry || 'No Expiry',
      welcomeMessage: data?.welcomeMessage || 'Scan to upload documents instantly & pick up your high quality prints!',
      logoUrl: data?.logoUrl,
      template: data?.template || 'default'
    };
  },

  /**
   * Fetches real QR version history from MongoDB
   */
  async fetchQRHistory(): Promise<QRHistoryItem[]> {
    const res = await apiClient.get('/qr/history');
    return res.data?.data?.history || [];
  },

  /**
   * Deletes a QR version history entry
   */
  async deleteQRHistory(id: string): Promise<void> {
    await apiClient.delete(`/qr/history/${id}`);
  },

  /**
   * Fetches real scan telemetry and conversion analytics
   */
  async fetchQRAnalytics(): Promise<QRAnalyticsData> {
    const res = await apiClient.get('/qr/analytics');
    return (
      res.data?.data?.analytics || {
        totalScans: 0,
        todayScans: 0,
        weeklyScans: 0,
        monthlyScans: 0,
        uniqueVisitors: 0,
        successfulUploads: 0,
        ordersCreated: 0,
        conversionRate: 0
      }
    );
  }
};
