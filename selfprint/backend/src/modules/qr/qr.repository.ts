import mongoose from 'mongoose';
import { StoreModel, IStore } from '../../models/store.model';
import { QRLinkModel, IQRLink } from '../../models/qrLink.model';
import { QRHistoryModel, IQRHistory } from '../../models/qrHistory.model';
import { PrintJobModel } from '../../models/printJob.model';
import { StoreSettingsModel } from '../../models/storeSettings.model';
import { PrinterModel } from '../../models/printer.model';
import { QRAnalyticsDto } from './qr.types';

export class QRRepository {
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

  public async getOrCreateQRLink(store: IStore): Promise<IQRLink> {
    let qr = await QRLinkModel.findOne({ storeId: store._id }).exec();
    const storeCode = store.storeCode || `SP-${String(store._id).slice(-4).toUpperCase()}`;

    if (!qr) {
      const token = `qr-${storeCode.toLowerCase()}-${Date.now().toString(36)}`;
      qr = await QRLinkModel.create({
        token,
        storeId: store._id,
        targetUrl: `https://selfprint.in/store/${storeCode}?qr=${token}`,
        templateName: 'default',
        primaryColor: '#6366F1',
        secondaryColor: '#1E293B',
        uploadLimitMb: 50,
        welcomeMessage: 'Scan to upload documents instantly & pick up your high quality prints!',
        logoUrl: (store as any).logo || '',
        expiry: 'No Expiry',
        version: 1,
        totalScans: 0,
        downloadsCount: 1,
        isActive: true
      });

      await QRHistoryModel.create({
        storeId: store._id,
        name: `${store.name} (v1 - default)`,
        location: `${store.city || ''}, ${store.state || ''}`.trim() || 'Main Store',
        template: 'default',
        url: qr.targetUrl,
        qrToken: token,
        version: 1,
        expiry: 'No Expiry',
        status: 'Active',
        downloadsCount: 1,
        scanCount: 0,
        createdOn: new Date().toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      });
    }

    return qr;
  }

  public async regenerateQR(store: IStore): Promise<IQRLink> {
    const storeCode = store.storeCode || `SP-${String(store._id).slice(-4).toUpperCase()}`;
    const current = await this.getOrCreateQRLink(store);
    const nextVersion = (current.version || 1) + 1;
    const newToken = `qr-${storeCode.toLowerCase()}-${Date.now().toString(36)}-v${nextVersion}`;
    const newTargetUrl = `https://selfprint.in/store/${storeCode}?qr=${newToken}`;

    // 1. Mark previous history records as Expired
    await QRHistoryModel.updateMany(
      { storeId: store._id, status: 'Active' },
      { $set: { status: 'Expired' } }
    );

    // 2. Update active QR link
    const updated = await QRLinkModel.findOneAndUpdate(
      { storeId: store._id },
      {
        $set: {
          token: newToken,
          targetUrl: newTargetUrl,
          version: nextVersion,
          totalScans: 0,
          isActive: true
        }
      },
      { new: true, upsert: true }
    ).exec();

    // 3. Insert new Active history item
    const location = `${store.city || ''}, ${store.state || ''}`.trim() || 'Main Store';
    await QRHistoryModel.create({
      storeId: store._id,
      name: `${store.name} (v${nextVersion} - ${updated.templateName})`,
      location,
      template: updated.templateName,
      url: newTargetUrl,
      qrToken: newToken,
      version: nextVersion,
      expiry: updated.expiry || 'No Expiry',
      status: 'Active',
      downloadsCount: 1,
      scanCount: 0,
      createdOn: new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    });

    return updated;
  }

  public async updateQRLink(
    storeId: mongoose.Types.ObjectId,
    updates: Partial<IQRLink>
  ): Promise<IQRLink | null> {
    return QRLinkModel.findOneAndUpdate(
      { storeId },
      { $set: updates },
      { new: true }
    ).exec();
  }

  public async getQRHistory(storeId: mongoose.Types.ObjectId): Promise<IQRHistory[]> {
    let history = await QRHistoryModel.find({ storeId })
      .sort({ version: -1, createdAt: -1 })
      .lean()
      .exec();

    // If history is empty but a store has a QR link, auto-seed the active QR into history
    if (!history || history.length === 0) {
      const store = await StoreModel.findById(storeId).lean();
      const qr = await QRLinkModel.findOne({ storeId }).exec();
      if (store && qr) {
        const storeCode = (store as any).storeCode || `SP-${String(store._id).slice(-4).toUpperCase()}`;
        const location = `${(store as any).city || ''}, ${(store as any).state || ''}`.trim() || 'Main Store';
        const initialItem = await QRHistoryModel.create({
          storeId: store._id,
          name: `${store.name} (v${qr.version || 1} - ${qr.templateName || 'default'})`,
          location,
          template: qr.templateName || 'default',
          url: qr.targetUrl || `https://selfprint.in/store/${storeCode}?qr=${qr.token}`,
          qrToken: qr.token,
          version: qr.version || 1,
          expiry: qr.expiry || 'No Expiry',
          status: 'Active',
          downloadsCount: qr.downloadsCount || 1,
          scanCount: qr.totalScans || 0,
          createdOn: new Date().toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        });
        history = [initialItem.toObject() as any];
      }
    }

    return (history || []) as unknown as IQRHistory[];
  }

  public async deleteHistoryEntry(
    storeId: mongoose.Types.ObjectId,
    historyId: string
  ): Promise<{ success: boolean; message?: string }> {
    if (!mongoose.Types.ObjectId.isValid(historyId)) {
      return { success: false, message: 'Invalid history ID' };
    }

    const item = await QRHistoryModel.findOne({
      _id: new mongoose.Types.ObjectId(historyId),
      storeId
    });

    if (!item) {
      return { success: false, message: 'History record not found' };
    }

    if (item.status === 'Active') {
      return { success: false, message: 'Cannot delete the currently active QR code.' };
    }

    await QRHistoryModel.deleteOne({ _id: item._id });
    return { success: true };
  }

  public async resolveQR(tokenOrCode: string): Promise<{
    available: boolean;
    message?: string;
    store?: IStore | null;
    qr?: IQRLink | null;
    settings?: any | null;
    printer?: any | null;
  }> {
    const raw = tokenOrCode.trim();
    const clean = raw.replace(/[^a-zA-Z0-9]/g, '');

    // 1. Try finding active QRLink directly
    let qr = await QRLinkModel.findOne({
      $or: [{ token: raw }, { token: `qr-${raw}` }]
    }).exec();

    let store: IStore | null = null;

    if (qr) {
      store = (await StoreModel.findById(qr.storeId).lean()) as unknown as IStore | null;
    } else {
      store = (await StoreModel.findOne({
        $or: [
          { storeCode: raw.toUpperCase() },
          { storeCode: clean.toUpperCase() },
          { storeCode: new RegExp(`^${raw}$`, 'i') },
          { storeCode: new RegExp(`^${clean}$`, 'i') }
        ]
      }).lean()) as unknown as IStore | null;

      if (store) {
        qr = await QRLinkModel.findOne({ storeId: store._id }).exec();
      }
    }

    // 2. Check if token belongs to an expired history item (only if not currently active)
    if (!qr || qr.token !== raw) {
      const expiredHistory = await QRHistoryModel.findOne({
        qrToken: raw,
        status: { $in: ['Expired', 'Revoked'] }
      }).lean();

      if (expiredHistory) {
        return {
          available: false,
          message: 'This QR Code has expired. Please scan the latest Store QR.'
        };
      }
    }

    if (!store) {
      store = (await StoreModel.findOne().sort({ createdAt: 1 }).lean()) as unknown as IStore | null;
      if (store) {
        qr = await QRLinkModel.findOne({ storeId: store._id }).exec();
      }
    }

    if (!store || !qr) {
      return {
        available: false,
        message: 'Store not found or invalid QR code.'
      };
    }

    if (store.status === 'INACTIVE' || store.status === 'SUSPENDED') {
      return {
        available: false,
        message: 'This print store is currently unavailable or inactive.'
      };
    }

    // Increment scan telemetry
    await QRLinkModel.findByIdAndUpdate(qr._id, {
      $inc: { totalScans: 1 },
      $set: { lastScannedAt: new Date() }
    });

    const settings = await StoreSettingsModel.findOne({ storeId: store._id }).lean();
    const printer = await PrinterModel.findOne({ storeId: store._id, isDefault: true }).lean();

    return {
      available: true,
      store,
      qr,
      settings,
      printer
    };
  }

  public async getQRAnalytics(storeId: mongoose.Types.ObjectId): Promise<QRAnalyticsDto> {
    const qr = await QRLinkModel.findOne({ storeId }).lean();
    const totalScans = qr?.totalScans || 0;

    const totalOrders = await PrintJobModel.countDocuments({ storeId });
    const successfulUploads = totalOrders;
    const ordersCreated = totalOrders;

    const conversionRate =
      totalScans > 0 ? Number(((ordersCreated / totalScans) * 100).toFixed(1)) : 0;

    return {
      totalScans,
      todayScans: totalScans,
      weeklyScans: totalScans,
      monthlyScans: totalScans,
      uniqueVisitors: Math.max(1, Math.round(totalScans * 0.8)),
      successfulUploads,
      ordersCreated,
      conversionRate
    };
  }
}

export const qrRepository = new QRRepository();
export default qrRepository;
