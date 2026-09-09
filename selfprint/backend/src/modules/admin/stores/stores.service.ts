import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { StoreModel, IStore } from '../../../models/store.model';
import { StoreSettingsModel } from '../../../models/storeSettings.model';
import { PrinterModel } from '../../../models/printer.model';
import { QRLinkModel } from '../../../models/qrLink.model';
import { PrintJobModel } from '../../../models/printJob.model';
import { TransactionModel } from '../../../models/transaction.model';
import { StoreDashboardStatsModel } from '../../../models/storeDashboardStats.model';
import {
  AdminStoreFilterQuery,
  AdminStoreListItem,
  AdminStoreStatsResponse,
  CreateAdminStoreInput,
  UpdateAdminStoreInput
} from './stores.types';

export class AdminStoresService {
  /**
   * 1. Aggregate real KPI statistics across all stores in MongoDB
   */
  public async getStoreStats(): Promise<AdminStoreStatsResponse> {
    const totalStores = await StoreModel.countDocuments();
    const activeCount = await StoreModel.countDocuments({ status: 'ACTIVE' });
    const suspendedCount = await StoreModel.countDocuments({ status: 'SUSPENDED' });
    const pendingCount = await StoreModel.countDocuments({
      $or: [{ status: 'PENDING' }, { isVerified: false }]
    });

    const offlineCount = await StoreModel.countDocuments({ status: 'INACTIVE' });

    const distinctCities = await StoreModel.distinct('city');
    const totalCities = distinctCities.filter(Boolean).length;

    const safeTotal = Math.max(1, totalStores);
    const activePercent = `${((activeCount / safeTotal) * 100).toFixed(1)}%`;
    const offlinePercent = `${((offlineCount / safeTotal) * 100).toFixed(1)}%`;
    const pendingPercent = `${((pendingCount / safeTotal) * 100).toFixed(1)}%`;
    const suspendedPercent = `${((suspendedCount / safeTotal) * 100).toFixed(1)}%`;

    return {
      totalStores,
      activeStores: activeCount,
      activePercent,
      offlineStores: offlineCount,
      offlinePercent,
      pendingApproval: pendingCount,
      pendingPercent,
      suspendedStores: suspendedCount,
      suspendedPercent,
      totalCities
    };
  }

  /**
   * 2. Paginated, filterable, searchable store list from MongoDB
   */
  public async getStores(query: AdminStoreFilterQuery): Promise<{
    stores: AdminStoreListItem[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    uniqueCities: string[];
  }> {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 10));
    const skip = (page - 1) * limit;

    const filterObj: any = {};

    // 1. Text Search across store name, code, owner, email, phone, city
    if (query.search && query.search.trim()) {
      const searchRegex = new RegExp(query.search.trim(), 'i');
      filterObj.$or = [
        { name: searchRegex },
        { storeCode: searchRegex },
        { ownerName: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
        { city: searchRegex }
      ];
    }

    // 2. Status Filter
    if (query.status && query.status !== 'All') {
      const s = query.status.toUpperCase();
      if (['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING'].includes(s)) {
        filterObj.status = s;
      } else if (query.status === 'Online') {
        filterObj.status = 'ACTIVE';
      } else if (query.status === 'Offline') {
        filterObj.status = 'INACTIVE';
      }
    }

    // 3. City Filter
    if (query.city && query.city !== 'All') {
      filterObj.city = new RegExp(`^${query.city.trim()}$`, 'i');
    }

    const total = await StoreModel.countDocuments(filterObj);
    const totalPages = Math.max(1, Math.ceil(total / limit));

    const storesRaw = await StoreModel.find(filterObj)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Fetch aggregated relations for each store
    const storeItems: AdminStoreListItem[] = await Promise.all(
      storesRaw.map(async (s) => {
        const storeId = s._id as mongoose.Types.ObjectId;

        // Print jobs count
        const ordersCount = await PrintJobModel.countDocuments({ storeId });

        // Revenue & Commission aggregation
        const revenueAgg = await TransactionModel.aggregate([
          { $match: { storeId, status: 'PAID' } },
          {
            $group: {
              _id: null,
              totalRevenue: { $sum: '$amount' },
              totalPlatformFee: { $sum: '$platformFee' }
            }
          }
        ]);

        const revenueRaw = revenueAgg[0]?.totalRevenue || 0;
        const commissionRaw = revenueAgg[0]?.totalPlatformFee || Math.round(revenueRaw * 0.1);

        // Printer count & status
        const printerCount = await PrinterModel.countDocuments({ storeId });
        const hasOnlinePrinter = await PrinterModel.exists({
          storeId,
          status: { $in: ['ONLINE', 'PRINTING'] }
        });

        // QR Status
        const hasQr = await QRLinkModel.exists({ storeId, isActive: true });

        // UI Status Mapping
        let uiStatus: 'Online' | 'Offline' | 'Busy' | 'Suspended' | 'Pending' = 'Offline';
        if (s.status === 'SUSPENDED') uiStatus = 'Suspended';
        else if (s.status === 'PENDING' || !s.isVerified) uiStatus = 'Pending';
        else if (s.status === 'ACTIVE') {
          uiStatus = hasOnlinePrinter ? 'Online' : 'Offline';
        }

        const initials =
          s.name
            .split(' ')
            .slice(0, 2)
            .map((w) => w[0])
            .join('')
            .toUpperCase() || 'SP';

        const lastActiveFormatted = s.updatedAt
          ? new Date(s.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : 'Recently';

        const joinedDateFormatted = s.createdAt
          ? new Date(s.createdAt).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric'
            })
          : 'Recent';

        return {
          id: String(s._id),
          storeIdCode: s.storeCode || `SP-${String(s._id).slice(-5).toUpperCase()}`,
          name: s.name,
          email: s.email,
          logoText: initials,
          logoBgColor:
            uiStatus === 'Online'
              ? 'bg-indigo-600 text-white'
              : uiStatus === 'Suspended'
              ? 'bg-rose-600 text-white'
              : 'bg-slate-700 text-white',
          ownerName: s.ownerName,
          ownerPhone: s.phone,
          ownerEmail: s.email,
          city: s.city || 'Assam',
          state: s.state || 'Assam',
          fullAddress: s.address || `${s.city}, ${s.state}`,
          pincode: s.pincode || '',
          plan: 'Pro',
          ordersCount,
          revenueRaw,
          revenueFormatted: `₹${revenueRaw.toLocaleString()}`,
          commissionRaw,
          commissionFormatted: `₹${commissionRaw.toLocaleString()}`,
          commissionRate: 10,
          status: uiStatus,
          rawStatus: s.status,
          lastActive: lastActiveFormatted,
          printerCount,
          qrGenerated: Boolean(hasQr),
          joinedDate: joinedDateFormatted
        };
      })
    );

    const allCities = await StoreModel.distinct('city');
    const uniqueCities = allCities.filter(Boolean).sort();

    return {
      stores: storeItems,
      pagination: {
        page,
        limit,
        total,
        pages: totalPages
      },
      total,
      page,
      limit,
      totalPages,
      uniqueCities
    };
  }

  /**
   * 3. Get single store details with settings, printers, and QR
   */
  public async getStoreById(id: string) {
    let store: IStore | null = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      store = await StoreModel.findById(id).lean();
    } else {
      store = await StoreModel.findOne({ storeCode: id.toUpperCase() }).lean();
    }

    if (!store) return null;

    const storeId = store._id;
    const settings = await StoreSettingsModel.findOne({ storeId }).lean();
    const printers = await PrinterModel.find({ storeId }).lean();
    const qrLink = await QRLinkModel.findOne({ storeId }).lean();
    const stats = await StoreDashboardStatsModel.findOne({ storeId }).lean();

    const ordersCount = await PrintJobModel.countDocuments({ storeId });
    const revenueAgg = await TransactionModel.aggregate([
      { $match: { storeId, status: 'PAID' } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount' },
          totalPlatformFee: { $sum: '$platformFee' }
        }
      }
    ]);

    const totalRevenue = revenueAgg[0]?.totalRevenue || 0;
    const totalCommission = revenueAgg[0]?.totalPlatformFee || Math.round(totalRevenue * 0.1);

    return {
      store,
      settings,
      printers,
      qrLink,
      stats: {
        ordersCount,
        totalRevenue,
        totalCommission,
        todayJobs: stats?.todayJobs || 0,
        todayRevenue: stats?.todayRevenue || 0
      }
    };
  }

  /**
   * 4. Create new store with automatic relations
   */
  public async createStore(input: CreateAdminStoreInput) {
    const rawPassword = input.password || 'Print@12345';
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    // Generate unique store code SP-XXXXX
    const count = await StoreModel.countDocuments();
    const storeCode = `SP-${10000 + count + 1}`;

    const newStore = await StoreModel.create({
      name: input.name.trim(),
      ownerName: input.ownerName.trim(),
      email: input.ownerEmail.toLowerCase().trim(),
      phone: input.ownerPhone.trim(),
      password: hashedPassword,
      address: input.fullAddress.trim(),
      city: input.city.trim(),
      state: input.state || 'Assam',
      country: 'India',
      pincode: input.pincode.trim(),
      storeCode,
      status: input.status || 'ACTIVE',
      isVerified: true,
      printerConfigured: Boolean(input.printerCount && input.printerCount > 0)
    });

    // Initialize StoreSettings
    await StoreSettingsModel.create({
      storeId: newStore._id,
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
        description: 'Instant document printing & copying kiosk.'
      }
    });

    // Initialize QR Link
    const qrToken = `qr-${storeCode.toLowerCase()}-${Date.now().toString(36)}-v1`;
    await QRLinkModel.create({
      token: qrToken,
      storeId: newStore._id,
      targetUrl: `https://selfprint.in/store/${storeCode}?qr=${qrToken}`,
      templateName: 'default',
      primaryColor: '#6366F1',
      secondaryColor: '#1E293B',
      uploadLimitMb: 50,
      welcomeMessage: 'Scan to upload documents instantly & pick up your high quality prints!',
      expiry: 'No Expiry',
      version: 1,
      isActive: true
    });

    // Initialize Dashboard Stats
    await StoreDashboardStatsModel.create({
      storeId: newStore._id,
      todayJobs: 0,
      todayRevenue: 0,
      printingNow: 0,
      waitingQueue: 0,
      completedToday: 0,
      failedToday: 0,
      pendingToday: 0
    });

    return newStore;
  }

  /**
   * 5. Update existing store
   */
  public async updateStore(id: string, input: UpdateAdminStoreInput) {
    const updatePayload: any = {};
    if (input.name) updatePayload.name = input.name.trim();
    if (input.ownerName) updatePayload.ownerName = input.ownerName.trim();
    if (input.ownerPhone) updatePayload.phone = input.ownerPhone.trim();
    if (input.ownerEmail) updatePayload.email = input.ownerEmail.toLowerCase().trim();
    if (input.city) updatePayload.city = input.city.trim();
    if (input.state) updatePayload.state = input.state.trim();
    if (input.fullAddress) updatePayload.address = input.fullAddress.trim();
    if (input.pincode) updatePayload.pincode = input.pincode.trim();
    if (input.status) {
      const s = input.status.toUpperCase();
      if (['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING'].includes(s)) {
        updatePayload.status = s;
      }
    }

    const updated = await StoreModel.findByIdAndUpdate(
      id,
      { $set: updatePayload },
      { new: true }
    );

    return updated;
  }

  /**
   * 6. Toggle / update store status
   */
  public async updateStoreStatus(id: string, status: string) {
    let normalizedStatus: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING' = 'ACTIVE';
    const s = status.toUpperCase();
    if (s === 'ONLINE' || s === 'ACTIVE') normalizedStatus = 'ACTIVE';
    else if (s === 'OFFLINE' || s === 'INACTIVE') normalizedStatus = 'INACTIVE';
    else if (s === 'SUSPENDED') normalizedStatus = 'SUSPENDED';
    else if (s === 'PENDING') normalizedStatus = 'PENDING';

    const updated = await StoreModel.findByIdAndUpdate(
      id,
      { $set: { status: normalizedStatus } },
      { new: true }
    );

    return updated;
  }

  /**
   * 7. Soft delete / deactivate store
   */
  public async deleteStore(id: string) {
    const deleted = await StoreModel.findByIdAndUpdate(
      id,
      { $set: { status: 'INACTIVE' } },
      { new: true }
    );
    return deleted;
  }
}

export const adminStoresService = new AdminStoresService();
export default adminStoresService;
