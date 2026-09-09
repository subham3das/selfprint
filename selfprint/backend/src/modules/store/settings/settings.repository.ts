import mongoose from 'mongoose';
import { StoreModel, IStore } from '../../../models/store.model';
import { StoreSettingsModel, IStoreSettings } from '../../../models/storeSettings.model';
import { StoreBankAccountModel, IStoreBankAccount } from '../../../models/storeBankAccount.model';
import { PrinterModel, IPrinter } from '../../../models/printer.model';

export class SettingsRepository {
  public async getStore(storeIdParam?: string): Promise<IStore | null> {
    if (storeIdParam && mongoose.Types.ObjectId.isValid(storeIdParam)) {
      const byId = await StoreModel.findById(storeIdParam).lean();
      if (byId) return byId as unknown as IStore;
    }
    if (storeIdParam) {
      const byCode = await StoreModel.findOne({
        $or: [
          { storeCode: storeIdParam.toUpperCase() },
          { email: storeIdParam.toLowerCase() }
        ]
      }).lean();
      if (byCode) return byCode as unknown as IStore;
    }
    return (await StoreModel.findOne().sort({ createdAt: 1 }).lean()) as unknown as IStore | null;
  }

  public async getOrCreateStoreSettings(storeId: mongoose.Types.ObjectId): Promise<IStoreSettings> {
    let settings = await StoreSettingsModel.findOne({ storeId }).exec();
    if (!settings) {
      settings = await StoreSettingsModel.create({
        storeId,
        pricing: {
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
        operatingHours: {
          openTime: '08:00 AM',
          closeTime: '10:00 PM',
          isOpenSunday: true
        },
        branding: {
          primaryColor: '#6366F1',
          secondaryColor: '#1E293B',
          accentColor: '#EC4899',
          description: 'High quality instant document printing & binding kiosk.',
          website: '',
          supportNumber: ''
        },
        receipt: {
          headerText: 'Thank you for printing with us!',
          footerText: 'Keep this receipt for job collection.',
          invoicePrefix: 'INV',
          notes: 'No refunds once printing has commenced.',
          autoPrint: true,
          paperWidth: '80mm',
          showTaxBreakdown: true
        },
        notifications: {
          soundOnNewJob: true,
          browserNotifications: true,
          emailNotifications: false,
          lowPaperAlert: true,
          lowInkAlert: true,
          printerOfflineAlert: true
        },
        preferences: {
          autoRefreshInterval: '10 Seconds',
          theme: 'Light',
          language: 'English',
          showLowStockAlerts: true,
          showRevenueOnDashboard: true
        },
        security: {
          twoFactorAuth: false,
          sessionTimeoutMinutes: 60,
          autoLogout: true
        },
        printer: {
          selectedPrinter: 'No Printer Selected',
          printerModel: 'Not Configured',
          defaultPaperSize: 'A4',
          defaultPrintType: 'Black & White',
          autoStartAfterPayment: true,
          doubleSidedDefault: false,
          paperSaveMode: false,
          isPaused: false
        }
      });
    }
    return settings;
  }

  public async getOrCreateStoreBankAccount(storeId: mongoose.Types.ObjectId): Promise<IStoreBankAccount> {
    let bank = await StoreBankAccountModel.findOne({ storeId }).exec();
    if (!bank) {
      bank = await StoreBankAccountModel.create({
        storeId,
        accountHolderName: 'Store Merchant',
        accountNumber: '0000000000',
        ifscCode: 'HDFC0001234',
        bankName: 'HDFC Bank',
        branchName: 'Main Branch',
        upiId: 'merchant@upi',
        isVerified: true
      });
    }
    return bank;
  }

  public async getStorePrinter(storeId: mongoose.Types.ObjectId): Promise<IPrinter | null> {
    return (await PrinterModel.findOne({ storeId, isDefault: true }).lean().exec()) ||
      ((await PrinterModel.findOne({ storeId }).lean().exec()) as unknown as IPrinter | null);
  }

  public async updateStore(storeId: mongoose.Types.ObjectId, updates: Partial<IStore>): Promise<IStore | null> {
    return StoreModel.findByIdAndUpdate(storeId, { $set: updates }, { new: true }).lean().exec() as unknown as IStore | null;
  }

  public async updateStoreSettings(storeId: mongoose.Types.ObjectId, updates: any): Promise<IStoreSettings | null> {
    return StoreSettingsModel.findOneAndUpdate({ storeId }, { $set: updates }, { new: true, upsert: true }).exec();
  }

  public async updateStoreBankAccount(storeId: mongoose.Types.ObjectId, updates: Partial<IStoreBankAccount>): Promise<IStoreBankAccount | null> {
    return StoreBankAccountModel.findOneAndUpdate({ storeId }, { $set: updates }, { new: true, upsert: true }).exec();
  }
}

export const settingsRepository = new SettingsRepository();
export default settingsRepository;
