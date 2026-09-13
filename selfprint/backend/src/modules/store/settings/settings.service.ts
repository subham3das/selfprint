import mongoose from 'mongoose';
import { settingsRepository, SettingsRepository } from './settings.repository';
import { StoreFullSettingsDto, SystemInfoDto } from './settings.types';
import { socketManager } from '../../../socket';
import { logger } from '../../../utils/logger';

export class SettingsService {
  private repository: SettingsRepository;

  constructor(repository: SettingsRepository = settingsRepository) {
    this.repository = repository;
  }

  public async getFullSettings(storeIdParam?: string): Promise<StoreFullSettingsDto | null> {
    const store = await this.repository.getStore(storeIdParam);
    if (!store) return null;

    const [settingsDoc, bankDoc, printerDoc] = await Promise.all([
      this.repository.getOrCreateStoreSettings(store._id),
      this.repository.getOrCreateStoreBankAccount(store._id),
      this.repository.getStorePrinter(store._id)
    ]);

    const location = `${store.city || ''}, ${store.state || ''}`.trim() || 'Store Location';

    const printerConfig = {
      selectedPrinter: printerDoc ? printerDoc.printerName : settingsDoc.printer?.selectedPrinter || 'No Printer Selected',
      printerModel: printerDoc ? printerDoc.model || printerDoc.brand || 'Connected' : settingsDoc.printer?.printerModel || 'Not Configured',
      defaultPaperSize: (settingsDoc.printer?.defaultPaperSize as any) || 'A4',
      defaultPrintType: (settingsDoc.printer?.defaultPrintType as any) || 'Black & White',
      autoStartAfterPayment: settingsDoc.printer?.autoStartAfterPayment ?? true,
      doubleSidedDefault: settingsDoc.printer?.doubleSidedDefault ?? false,
      paperSaveMode: settingsDoc.printer?.paperSaveMode ?? false,
      isPaused: settingsDoc.printer?.isPaused ?? false,
      testMode: Boolean(store.testMode ?? settingsDoc.printer?.testMode ?? false),
      paperStatus: (printerDoc?.paperLevel && printerDoc.paperLevel < 20 ? 'Low' : 'Full') as any,
      inkStatus: (printerDoc?.tonerLevel && printerDoc.tonerLevel < 20 ? 'Low' : 'Full') as any
    };

    return {
      general: {
        storeName: store.name,
        branchName: store.city || 'Main Branch',
        storeOwnerName: store.ownerName,
        storePhone: store.phone,
        storeEmail: store.email,
        storeLocation: location,
        storeAddress: store.address || '',
        gstNumber: store.gstNumber || '',
        openingTime: settingsDoc.operatingHours?.openTime || '08:00 AM',
        closingTime: settingsDoc.operatingHours?.closeTime || '10:00 PM',
        timezone: 'Asia/Kolkata (IST)',
        logoUrl: (store as any).logo || undefined
      },
      printer: printerConfig,
      pricing: {
        bwA4Price: settingsDoc.pricing?.bwA4Price ?? 2.0,
        bwA3Price: settingsDoc.pricing?.bwA3Price ?? 4.0,
        colorA4Price: settingsDoc.pricing?.colorA4Price ?? 6.0,
        colorA3Price: settingsDoc.pricing?.colorA3Price ?? 12.0,
        extraCopyA4Price: settingsDoc.pricing?.extraCopyA4Price ?? 1.0,
        extraCopyA3Price: settingsDoc.pricing?.extraCopyA3Price ?? 2.0,
        minimumOrderPrice: settingsDoc.pricing?.minimumOrderPrice ?? 2.0,
        serviceCharge: settingsDoc.pricing?.serviceCharge ?? 0.0,
        duplexDiscount: settingsDoc.pricing?.duplexDiscount ?? 0.5,
        emergencyPrintCharge: settingsDoc.pricing?.emergencyPrintCharge ?? 5.0
      },
      payment: {
        upiId: bankDoc.upiId || `${store.storeCode?.toLowerCase() || 'merchant'}@okhdfcbank`,
        merchantName: bankDoc.accountHolderName || store.name,
        paymentGateway: 'Direct UPI',
        autoPaymentVerification: true,
        autoStartPrintingAfterPayment: true,
        cashAccepted: true
      },
      preferences: {
        autoRefreshInterval: (settingsDoc.preferences?.autoRefreshInterval as any) || '10 Seconds',
        theme: (settingsDoc.preferences?.theme as any) || 'Light',
        language: (settingsDoc.preferences?.language as any) || 'English',
        showLowStockAlerts: settingsDoc.preferences?.showLowStockAlerts ?? true,
        showRevenueOnDashboard: settingsDoc.preferences?.showRevenueOnDashboard ?? true
      },
      notifications: {
        soundOnNewJob: settingsDoc.notifications?.soundOnNewJob ?? true,
        browserNotifications: settingsDoc.notifications?.browserNotifications ?? true,
        emailNotifications: settingsDoc.notifications?.emailNotifications ?? false,
        lowPaperAlert: settingsDoc.notifications?.lowPaperAlert ?? true,
        lowInkAlert: settingsDoc.notifications?.lowInkAlert ?? true,
        printerOfflineAlert: settingsDoc.notifications?.printerOfflineAlert ?? true
      },
      security: {
        twoFactorAuth: settingsDoc.security?.twoFactorAuth ?? false,
        sessionTimeoutMinutes: settingsDoc.security?.sessionTimeoutMinutes ?? 60,
        autoLogout: settingsDoc.security?.autoLogout ?? true
      }
    };
  }

  public async updateGeneralSettings(storeIdParam: string | undefined, input: any): Promise<StoreFullSettingsDto | null> {
    const store = await this.repository.getStore(storeIdParam);
    if (!store) return null;

    const storeUpdates: any = {};
    if (input.storeName) storeUpdates.name = input.storeName;
    if (input.storeOwnerName) storeUpdates.ownerName = input.storeOwnerName;
    if (input.storePhone) storeUpdates.phone = input.storePhone;
    if (input.storeEmail) storeUpdates.email = input.storeEmail;
    if (input.storeAddress) storeUpdates.address = input.storeAddress;
    if (input.gstNumber) storeUpdates.gstNumber = input.gstNumber;
    if (input.logoUrl) storeUpdates.logo = input.logoUrl;

    if (Object.keys(storeUpdates).length > 0) {
      await this.repository.updateStore(store._id, storeUpdates);
    }

    const settingsUpdates: any = {};
    if (input.openingTime || input.closingTime) {
      settingsUpdates.operatingHours = {
        openTime: input.openingTime || '08:00 AM',
        closeTime: input.closingTime || '10:00 PM',
        isOpenSunday: true
      };
    }

    if (Object.keys(settingsUpdates).length > 0) {
      await this.repository.updateStoreSettings(store._id, settingsUpdates);
    }

    return this.getFullSettings(storeIdParam);
  }

  public async updatePricingSettings(storeIdParam: string | undefined, input: any): Promise<StoreFullSettingsDto | null> {
    const store = await this.repository.getStore(storeIdParam);
    if (!store) return null;

    await this.repository.updateStoreSettings(store._id, { pricing: input });
    return this.getFullSettings(storeIdParam);
  }

  public async updatePaymentSettings(storeIdParam: string | undefined, input: any, meta?: { ipAddress?: string; userAgent?: string; updatedBy?: string }): Promise<StoreFullSettingsDto | null> {
    const store = await this.repository.getStore(storeIdParam);
    if (!store) return null;

    if (input.upiId || input.merchantName || input.accountNumber || input.ifscCode || input.bankName) {
      await this.repository.updateStoreBankAccount(
        store._id,
        {
          upiId: input.upiId,
          accountHolderName: input.merchantName || input.accountHolderName,
          accountNumber: input.accountNumber,
          ifscCode: input.ifscCode,
          bankName: input.bankName,
          settlementMethod: input.settlementMethod
        },
        meta
      );
    }

    return this.getFullSettings(storeIdParam);
  }

  public async updatePrinterSettings(storeIdParam: string | undefined, input: any): Promise<StoreFullSettingsDto | null> {
    const store = await this.repository.getStore(storeIdParam);
    if (!store) return null;

    const isTestMode = input.testMode !== undefined ? Boolean(input.testMode) : undefined;
    
    // 1. Update StoreSettings model
    await this.repository.updateStoreSettings(store._id, { printer: input });

    // 2. Persist in Store model directly
    if (isTestMode !== undefined) {
      await this.repository.updateStore(store._id, { testMode: isTestMode });
      logger.info(`[TestMode] Store ${store._id} testMode successfully persisted in DB as ${isTestMode}`);
    }

    const full = await this.getFullSettings(storeIdParam);

    // 3. Broadcast real-time events to all store sockets (Store Panel tabs & Desktop Connector)
    if (isTestMode !== undefined) {
      socketManager.emitToStore(store._id.toString(), 'store:testModeChanged', {
        storeId: store._id.toString(),
        testMode: isTestMode
      });
      socketManager.emitToStore(store._id.toString(), 'test_mode_changed', {
        storeId: store._id.toString(),
        testMode: isTestMode
      });
      socketManager.emitToStore(store._id.toString(), 'store_test_mode', {
        storeId: store._id.toString(),
        testMode: isTestMode
      });
    }

    if (full) {
      socketManager.emitToStore(store._id.toString(), 'store:settingsUpdated', full);
    }

    return full;
  }

  public async updatePreferencesSettings(storeIdParam: string | undefined, input: any): Promise<StoreFullSettingsDto | null> {
    const store = await this.repository.getStore(storeIdParam);
    if (!store) return null;

    await this.repository.updateStoreSettings(store._id, { preferences: input });
    return this.getFullSettings(storeIdParam);
  }

  public async updateNotificationSettings(storeIdParam: string | undefined, input: any): Promise<StoreFullSettingsDto | null> {
    const store = await this.repository.getStore(storeIdParam);
    if (!store) return null;

    await this.repository.updateStoreSettings(store._id, { notifications: input });
    return this.getFullSettings(storeIdParam);
  }

  public async updateReceiptSettings(storeIdParam: string | undefined, input: any): Promise<StoreFullSettingsDto | null> {
    const store = await this.repository.getStore(storeIdParam);
    if (!store) return null;

    await this.repository.updateStoreSettings(store._id, { receipt: input });
    return this.getFullSettings(storeIdParam);
  }

  public async exportBackup(storeIdParam?: string): Promise<any> {
    const full = await this.getFullSettings(storeIdParam);
    return {
      exportedAt: new Date().toISOString(),
      schemaVersion: '1.0.0',
      settings: full
    };
  }

  public async restoreBackup(storeIdParam: string | undefined, backup: any): Promise<StoreFullSettingsDto | null> {
    if (!backup?.settings) return null;
    const { general, pricing, payment, preferences, notifications, printer } = backup.settings;

    if (general) await this.updateGeneralSettings(storeIdParam, general);
    if (pricing) await this.updatePricingSettings(storeIdParam, pricing);
    if (payment) await this.updatePaymentSettings(storeIdParam, payment);
    if (preferences) await this.updatePreferencesSettings(storeIdParam, preferences);
    if (notifications) await this.updateNotificationSettings(storeIdParam, notifications);
    if (printer) await this.updatePrinterSettings(storeIdParam, printer);

    return this.getFullSettings(storeIdParam);
  }

  public getSystemInfo(): SystemInfoDto {
    return {
      appVersion: '2.4.0',
      backendVersion: 'v0.1.0-prod',
      apiVersion: 'v1.4',
      databaseStatus: mongoose.connection.readyState === 1 ? 'Connected (MongoDB Atlas)' : 'Connecting',
      uptimeSeconds: Math.floor(process.uptime()),
      nodeVersion: process.version,
      environment: process.env.NODE_ENV || 'production',
      buildNumber: 'SP-2026.08.30',
      lastUpdated: new Date().toISOString()
    };
  }
}

export const settingsService = new SettingsService();
export default settingsService;
