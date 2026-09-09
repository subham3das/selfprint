import mongoose from 'mongoose';
import { qrRepository, QRRepository } from './qr.repository';
import {
  QRConfigDto,
  QRHistoryItemDto,
  QRAnalyticsDto,
  QRTemplateType
} from './qr.types';

export class QRService {
  private repository: QRRepository;

  constructor(repository: QRRepository = qrRepository) {
    this.repository = repository;
  }

  public async getQRConfig(storeIdParam?: string): Promise<QRConfigDto | null> {
    const store = await this.repository.getStore(storeIdParam);
    if (!store) return null;

    const qr = await this.repository.getOrCreateQRLink(store);
    const storeCode = store.storeCode || `SP-${String(store._id).slice(-4).toUpperCase()}`;
    const location = `${store.city || ''}, ${store.state || ''}`.trim() || 'Store Location';

    return {
      storeName: store.name,
      branchName: store.city || 'Main Branch',
      storeLocation: location,
      storeId: storeCode,
      storeCode,
      storeUrl: qr.targetUrl || `https://selfprint.in/store/${storeCode}?qr=${qr.token}`,
      qrToken: qr.token,
      version: qr.version || 1,
      primaryColor: qr.primaryColor || '#6366F1',
      secondaryColor: qr.secondaryColor || '#1E293B',
      uploadLimitMb: qr.uploadLimitMb || 50,
      expiry: qr.expiry || 'No Expiry',
      welcomeMessage: qr.welcomeMessage || 'Scan to upload documents instantly & pick up your high quality prints!',
      logoUrl: qr.logoUrl || (store as any).logo || undefined,
      template: (qr.templateName as QRTemplateType) || 'default',
      totalScans: qr.totalScans || 0,
      downloadsCount: qr.downloadsCount || 1
    };
  }

  public async updateQRConfig(
    storeIdParam: string | undefined,
    data: {
      primaryColor?: string;
      secondaryColor?: string;
      template?: QRTemplateType;
      uploadLimitMb?: number;
      welcomeMessage?: string;
      logoUrl?: string;
      expiry?: string;
    }
  ): Promise<QRConfigDto | null> {
    const store = await this.repository.getStore(storeIdParam);
    if (!store) return null;

    const updates: any = {};
    if (data.primaryColor) updates.primaryColor = data.primaryColor;
    if (data.secondaryColor) updates.secondaryColor = data.secondaryColor;
    if (data.template) updates.templateName = data.template;
    if (data.uploadLimitMb) updates.uploadLimitMb = data.uploadLimitMb;
    if (data.welcomeMessage) updates.welcomeMessage = data.welcomeMessage;
    if (data.logoUrl !== undefined) updates.logoUrl = data.logoUrl;
    if (data.expiry) updates.expiry = data.expiry;

    const updatedQR = await this.repository.updateQRLink(store._id, updates);
    if (!updatedQR) return null;

    return this.getQRConfig(storeIdParam);
  }

  public async regenerateQR(storeIdParam?: string): Promise<QRConfigDto | null> {
    const store = await this.repository.getStore(storeIdParam);
    if (!store) return null;

    await this.repository.regenerateQR(store);
    return this.getQRConfig(storeIdParam);
  }

  public async getQRHistory(storeIdParam?: string): Promise<QRHistoryItemDto[]> {
    const store = await this.repository.getStore(storeIdParam);
    if (!store) return [];

    const history = await this.repository.getQRHistory(store._id);
    return history.map((item) => ({
      id: String(item._id),
      name: item.name,
      location: item.location,
      createdOn: item.createdOn,
      expiry: item.expiry,
      version: item.version || 1,
      qrToken: item.qrToken,
      status: item.status,
      url: item.url,
      downloadsCount: item.downloadsCount
    }));
  }

  public async deleteQRHistory(
    storeIdParam: string | undefined,
    historyId: string
  ): Promise<{ success: boolean; message?: string }> {
    const store = await this.repository.getStore(storeIdParam);
    if (!store) return { success: false, message: 'Store not found' };
    return this.repository.deleteHistoryEntry(store._id, historyId);
  }

  public async getQRAnalytics(storeIdParam?: string): Promise<QRAnalyticsDto> {
    const store = await this.repository.getStore(storeIdParam);
    if (!store) {
      return {
        totalScans: 0,
        todayScans: 0,
        weeklyScans: 0,
        monthlyScans: 0,
        uniqueVisitors: 0,
        successfulUploads: 0,
        ordersCreated: 0,
        conversionRate: 0
      };
    }

    return this.repository.getQRAnalytics(store._id);
  }

  public async resolveStoreForUploadPortal(tokenOrCode: string): Promise<any> {
    const result = await this.repository.resolveQR(tokenOrCode);
    if (!result.available) {
      return result;
    }

    const { store, qr, settings, printer } = result;

    if (!store) {
      return { available: false, message: 'Store not found' };
    }

    const storeCode = store.storeCode || `SP-${String(store._id).slice(-4).toUpperCase()}`;

    return {
      available: true,
      store: {
        id: String(store._id),
        storeCode,
        name: store.name,
        ownerName: store.ownerName,
        phone: store.phone,
        email: store.email,
        address: store.address,
        city: store.city,
        state: store.state,
        pincode: store.pincode,
        logo: qr?.logoUrl || (store as any).logo || null,
        uploadLimitMb: qr?.uploadLimitMb || 50,
        welcomeMessage: qr?.welcomeMessage || 'Upload your documents to print instantly',
        primaryColor: qr?.primaryColor || '#6366F1',
        secondaryColor: qr?.secondaryColor || '#1E293B'
      },
      pricing: settings?.pricing || {
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
      printer: printer
        ? {
            name: printer.printerName,
            brand: printer.brand,
            model: printer.model,
            isColor: printer.capabilities?.isColor ?? true,
            status: printer.status
          }
        : null
    };
  }
}

export const qrService = new QRService();
export default qrService;
