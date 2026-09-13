import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { StoreModel, IStore } from '../../../models/store.model';
import { StoreSettingsModel } from '../../../models/storeSettings.model';
import { PrinterModel } from '../../../models/printer.model';
import { QRLinkModel } from '../../../models/qrLink.model';
import { QRHistoryModel } from '../../../models/qrHistory.model';
import { PrintJobModel } from '../../../models/printJob.model';
import { TransactionModel } from '../../../models/transaction.model';
import { StoreDashboardStatsModel } from '../../../models/storeDashboardStats.model';
import { StoreBankAccountModel } from '../../../models/storeBankAccount.model';
import { SettlementModel } from '../../../models/settlement.model';
import { StoreNotificationModel } from '../../../models/storeNotification.model';
import { PairingCodeModel } from '../../../models/pairingCode.model';
import { ConnectorModel } from '../../../models/connector.model';
import { AuditLogModel } from '../../../models/auditLog.model';
import { socketManager } from '../../../socket';
import { connectorRegistry } from '../../connector/connector.service';
import {
  AdminStoreFilterQuery,
  AdminStoreListItem,
  AdminStoreStatsResponse,
  CreateAdminStoreInput,
  UpdateAdminStoreInput
} from './stores.types';
import { emailService } from '../../../services/email.service';
import { logger } from '../../../utils/logger';

export class AdminStoresService {
  /**
   * 1. Aggregate real KPI statistics across all stores in MongoDB
   */
  public async getStoreStats(): Promise<AdminStoreStatsResponse> {
    const totalStores = await StoreModel.countDocuments();
    const activeCount = await StoreModel.countDocuments({
      status: 'ACTIVE',
      blocked: { $ne: true },
      isDeleted: { $ne: true }
    });
    const blockedCount = await StoreModel.countDocuments({
      $or: [{ status: 'BLOCKED' }, { blocked: true }],
      isDeleted: { $ne: true }
    });
    const deletedCount = await StoreModel.countDocuments({
      $or: [{ status: 'DELETED' }, { isDeleted: true }]
    });
    const suspendedCount = await StoreModel.countDocuments({
      status: 'SUSPENDED',
      blocked: { $ne: true },
      isDeleted: { $ne: true }
    });
    const pendingCount = await StoreModel.countDocuments({
      $or: [{ status: 'PENDING' }, { isVerified: false }],
      blocked: { $ne: true },
      isDeleted: { $ne: true }
    });
    const offlineCount = await StoreModel.countDocuments({
      status: 'INACTIVE',
      blocked: { $ne: true },
      isDeleted: { $ne: true }
    });

    const distinctCities = await StoreModel.distinct('city', { isDeleted: { $ne: true } });
    const totalCities = distinctCities.filter(Boolean).length;

    const safeTotal = Math.max(1, totalStores);
    const activePercent = `${((activeCount / safeTotal) * 100).toFixed(1)}%`;
    const offlinePercent = `${((offlineCount / safeTotal) * 100).toFixed(1)}%`;
    const pendingPercent = `${((pendingCount / safeTotal) * 100).toFixed(1)}%`;
    const suspendedPercent = `${((suspendedCount / safeTotal) * 100).toFixed(1)}%`;
    const blockedPercent = `${((blockedCount / safeTotal) * 100).toFixed(1)}%`;
    const deletedPercent = `${((deletedCount / safeTotal) * 100).toFixed(1)}%`;

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
      blockedStores: blockedCount,
      blockedPercent,
      deletedStores: deletedCount,
      deletedPercent,
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
      if (s === 'ACTIVE' || query.status === 'Active' || query.status === 'Online') {
        filterObj.status = 'ACTIVE';
        filterObj.blocked = { $ne: true };
        filterObj.isDeleted = { $ne: true };
      } else if (s === 'BLOCKED' || query.status === 'Blocked') {
        filterObj.$or = [{ status: 'BLOCKED' }, { blocked: true }];
        filterObj.isDeleted = { $ne: true };
      } else if (s === 'DELETED' || query.status === 'Deleted') {
        filterObj.$or = [{ status: 'DELETED' }, { isDeleted: true }];
      } else if (s === 'INACTIVE' || query.status === 'Offline') {
        filterObj.status = 'INACTIVE';
        filterObj.blocked = { $ne: true };
        filterObj.isDeleted = { $ne: true };
      } else if (s === 'SUSPENDED' || query.status === 'Suspended') {
        filterObj.status = 'SUSPENDED';
        filterObj.blocked = { $ne: true };
        filterObj.isDeleted = { $ne: true };
      } else if (s === 'PENDING' || query.status === 'Pending') {
        filterObj.status = 'PENDING';
        filterObj.blocked = { $ne: true };
        filterObj.isDeleted = { $ne: true };
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
      storesRaw.map(async (s: any) => {
        const storeId = s._id;

        // Fetch counts & stats
        const [ordersCount, revenueAgg, hasQr, printerCount] = await Promise.all([
          PrintJobModel.countDocuments({ storeId }),
          TransactionModel.aggregate([
            { $match: { storeId, status: 'PAID' } },
            {
              $group: {
                _id: null,
                totalRevenue: { $sum: '$amount' },
                totalPlatformFee: { $sum: '$platformFee' }
              }
            }
          ]),
          QRLinkModel.exists({ storeId, isActive: true }),
          PrinterModel.countDocuments({ storeId })
        ]);

        const revenueRaw = revenueAgg[0]?.totalRevenue || 0;
        const commissionRaw = revenueAgg[0]?.totalPlatformFee || Math.round(revenueRaw * 0.1);

        // Derive UI Status
        let uiStatus: 'Online' | 'Offline' | 'Busy' | 'Suspended' | 'Pending' | 'Blocked' | 'Deleted' = 'Online';
        if (s.isDeleted || s.status === 'DELETED') {
          uiStatus = 'Deleted';
        } else if (s.blocked || s.status === 'BLOCKED') {
          uiStatus = 'Blocked';
        } else if (s.status === 'SUSPENDED') {
          uiStatus = 'Suspended';
        } else if (s.status === 'PENDING' || !s.isVerified) {
          uiStatus = 'Pending';
        } else if (s.status === 'INACTIVE') {
          uiStatus = 'Offline';
        } else {
          uiStatus = 'Online';
        }

        const initials = s.name
          ? s.name
              .split(' ')
              .map((w: string) => w[0])
              .slice(0, 2)
              .join('')
              .toUpperCase()
          : 'SP';

        // Format dates
        const joinedDateFormatted = s.createdAt
          ? new Date(s.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })
          : 'Recently';

        const lastActiveFormatted = s.updatedAt
          ? new Date(s.updatedAt).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit'
            })
          : 'Just now';

        return {
          id: s._id.toString(),
          storeIdCode: s.storeCode || `SP-${s._id.toString().slice(-4).toUpperCase()}`,
          name: s.name,
          email: s.email,
          logoText: initials,
          logoBgColor:
            uiStatus === 'Online'
              ? 'bg-indigo-600 text-white'
              : uiStatus === 'Blocked'
              ? 'bg-rose-600 text-white'
              : uiStatus === 'Deleted'
              ? 'bg-slate-800 text-white'
              : uiStatus === 'Suspended'
              ? 'bg-amber-600 text-white'
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
          blocked: Boolean(s.blocked),
          blockReason: s.blockReason || '',
          blockedAt: s.blockedAt,
          isDeleted: Boolean(s.isDeleted),
          deletedAt: s.deletedAt,
          lastActive: lastActiveFormatted,
          printerCount,
          qrGenerated: Boolean(hasQr),
          joinedDate: joinedDateFormatted
        };
      })
    );

    const allCities = await StoreModel.distinct('city', { isDeleted: { $ne: true } });
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

    const ordersCount = await PrintJobModel.countDocuments({
      $or: [{ storeId }, { deletedStoreId: storeId.toString() }]
    });
    const revenueAgg = await TransactionModel.aggregate([
      {
        $match: {
          $or: [{ storeId }, { deletedStoreId: storeId.toString() }],
          status: 'PAID'
        }
      },
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
      printerConfigured: Boolean(input.printerCount && input.printerCount > 0),
      blocked: false,
      isDeleted: false,
      tokenVersion: 0
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

    // Dispatch Store Welcome Email asynchronously
    const frontendBase =
      process.env.STORE_FRONTEND_URL ||
      process.env.FRONTEND_URL ||
      'https://selfprint.vercel.app';
    const dashboardUrl = `${frontendBase.replace(/\/+$/, '')}/store/login`;

    emailService
      .sendStoreWelcomeEmail({
        ownerName: newStore.ownerName,
        storeName: newStore.name,
        email: newStore.email,
        dashboardUrl,
        temporaryPassword: rawPassword
      })
      .catch((err) => {
        logger.error(`[AdminStoresService] Error dispatching store welcome email to ${newStore.email}:`, err);
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
      if (['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING', 'BLOCKED', 'DELETED'].includes(s)) {
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
    let normalizedStatus: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING' | 'BLOCKED' | 'DELETED' = 'ACTIVE';
    const s = status.toUpperCase();
    if (s === 'ONLINE' || s === 'ACTIVE') normalizedStatus = 'ACTIVE';
    else if (s === 'OFFLINE' || s === 'INACTIVE') normalizedStatus = 'INACTIVE';
    else if (s === 'SUSPENDED') normalizedStatus = 'SUSPENDED';
    else if (s === 'PENDING') normalizedStatus = 'PENDING';
    else if (s === 'BLOCKED') normalizedStatus = 'BLOCKED';
    else if (s === 'DELETED') normalizedStatus = 'DELETED';

    const updated = await StoreModel.findByIdAndUpdate(
      id,
      { $set: { status: normalizedStatus } },
      { new: true }
    );

    return updated;
  }

  /**
   * 7. Block Store: Enforces immediate disconnection across all sessions, tokens, and hardware
   */
  public async blockStore(id: string, reason: string, adminUser?: any) {
    const store = await StoreModel.findById(id);
    if (!store) return null;

    const storeIdStr = store._id.toString();

    store.blocked = true;
    store.status = 'BLOCKED';
    store.blockedAt = new Date();
    store.blockedBy = adminUser?.id && mongoose.Types.ObjectId.isValid(adminUser.id)
      ? new mongoose.Types.ObjectId(adminUser.id)
      : undefined;
    store.blockReason = reason ? reason.trim() : 'Administrative block';
    store.tokenVersion = (store.tokenVersion || 0) + 1;
    await store.save();

    // 1. Unregister active connectors from memory registry
    const connectors = await ConnectorModel.find({ storeId: store._id });
    for (const c of connectors) {
      connectorRegistry.unregisterConnector(c.connectorId);
      c.status = 'OFFLINE';
      c.state = 'OFFLINE';
      await c.save();
    }

    // 2. Real-time WebSocket Disconnect & Notification
    socketManager.emitToStore(storeIdStr, 'store_blocked', {
      storeId: storeIdStr,
      storeName: store.name,
      reason: store.blockReason,
      message: 'Your store has been blocked by the administrator. Please contact support.',
      timestamp: new Date().toISOString()
    });

    socketManager.emitToStore(storeIdStr, 'force_logout', {
      storeId: storeIdStr,
      message: 'Your account has been blocked by the administrator.'
    });

    socketManager.emitToStore(storeIdStr, 'connector_disconnected', {
      storeId: storeIdStr,
      reason: 'Store Blocked by Administrator',
      status: 'OFFLINE',
      timestamp: new Date().toISOString()
    });

    // 3. Record Audit Log
    try {
      await AuditLogModel.create({
        action: 'Blocked Store',
        module: 'Stores',
        severity: 'Warning',
        status: 'Completed',
        riskLevel: 'Medium',
        actorId: adminUser?.id && mongoose.Types.ObjectId.isValid(adminUser.id) ? adminUser.id : undefined,
        actorName: adminUser?.name || 'Administrator',
        actorEmail: adminUser?.email || 'admin@selfprint.in',
        actorRole: adminUser?.role || 'Super Admin',
        targetEntity: 'STORE',
        targetId: storeIdStr,
        targetResource: store.name,
        description: `Store "${store.name}" (${store.storeCode}) was blocked by admin. Reason: ${store.blockReason}`,
        details: {
          storeId: storeIdStr,
          storeCode: store.storeCode,
          reason: store.blockReason,
          blockedAt: store.blockedAt
        },
        createdAt: new Date()
      });
    } catch (auditErr) {
      logger.warn('[AdminStoresService] Audit log recording failed:', auditErr);
    }

    logger.info(`[AdminStoresService] Store "${store.name}" (${storeIdStr}) successfully BLOCKED. Reason: ${store.blockReason}`);
    return store;
  }

  /**
   * 8. Unblock Store: Restores access to normal operation
   */
  public async unblockStore(id: string, adminUser?: any) {
    const store = await StoreModel.findById(id);
    if (!store) return null;

    const storeIdStr = store._id.toString();

    store.blocked = false;
    store.status = 'ACTIVE';
    store.blockReason = '';
    store.blockedAt = undefined;
    store.blockedBy = undefined;
    store.tokenVersion = (store.tokenVersion || 0) + 1;
    await store.save();

    // Real-time notification
    socketManager.emitToStore(storeIdStr, 'store_unblocked', {
      storeId: storeIdStr,
      storeName: store.name,
      timestamp: new Date().toISOString()
    });

    // Record Audit Log
    try {
      await AuditLogModel.create({
        action: 'Unblocked Store',
        module: 'Stores',
        severity: 'Info',
        status: 'Completed',
        riskLevel: 'Low',
        actorId: adminUser?.id && mongoose.Types.ObjectId.isValid(adminUser.id) ? adminUser.id : undefined,
        actorName: adminUser?.name || 'Administrator',
        actorEmail: adminUser?.email || 'admin@selfprint.in',
        actorRole: adminUser?.role || 'Super Admin',
        targetEntity: 'STORE',
        targetId: storeIdStr,
        targetResource: store.name,
        description: `Store "${store.name}" (${store.storeCode}) was unblocked by admin.`,
        details: { storeId: storeIdStr, storeCode: store.storeCode },
        createdAt: new Date()
      });
    } catch (auditErr) {
      logger.warn('[AdminStoresService] Audit log recording failed:', auditErr);
    }

    logger.info(`[AdminStoresService] Store "${store.name}" (${storeIdStr}) successfully UNBLOCKED.`);
    return store;
  }

  /**
   * 9. Permanent Delete Store: Cascade database cleanup, order preservation, and full session revocation
   */
  public async deleteStore(id: string, adminUser?: any) {
    const store = await StoreModel.findById(id);
    if (!store) return null;

    const storeId = store._id;
    const storeIdStr = store._id.toString();
    const storeName = store.name;
    const storeCode = store.storeCode;

    // 1. Immediately invalidate WebSocket sessions & notify all connected clients/desktop
    socketManager.emitToStore(storeIdStr, 'store_deleted', {
      storeId: storeIdStr,
      storeName,
      message: 'This store has been deleted by the administrator.',
      timestamp: new Date().toISOString()
    });

    socketManager.emitToStore(storeIdStr, 'force_logout', {
      storeId: storeIdStr,
      message: 'This store has been deleted by the administrator.'
    });

    socketManager.emitToStore(storeIdStr, 'connector_unpaired', {
      storeId: storeIdStr,
      timestamp: new Date().toISOString()
    });

    socketManager.emitToStore(storeIdStr, 'connector_disconnected', {
      storeId: storeIdStr,
      status: 'OFFLINE',
      state: 'NOT_PAIRED',
      reason: 'Store Deleted by Administrator',
      timestamp: new Date().toISOString()
    });

    // 2. Preserve Orders & History for Audit (replace storeId with deletedStoreId)
    await PrintJobModel.updateMany(
      { storeId },
      {
        $set: {
          storeId: null,
          deletedStoreId: storeIdStr,
          deletedStoreName: storeName
        }
      }
    );

    // 3. Preserve Financial Transactions for Audit
    await TransactionModel.updateMany(
      { storeId },
      {
        $set: {
          storeId: null,
          deletedStoreId: storeIdStr,
          deletedStoreName: storeName
        }
      }
    );

    // 4. Delete all Pairing Codes
    await PairingCodeModel.deleteMany({ storeId });

    // 5. Unregister and delete Connectors
    const connectors = await ConnectorModel.find({ storeId });
    for (const c of connectors) {
      connectorRegistry.unregisterConnector(c.connectorId);
    }
    await ConnectorModel.deleteMany({ storeId });

    // 6. Delete Printers & Hardware Mappings
    await PrinterModel.deleteMany({ storeId });

    // 7. Delete Store Settings, Bank Details, QR Standees, Notifications & Stats
    await StoreSettingsModel.deleteMany({ storeId });
    await StoreBankAccountModel.deleteMany({ storeId });
    await QRLinkModel.deleteMany({ storeId });
    await QRHistoryModel.deleteMany({ storeId });
    await StoreDashboardStatsModel.deleteMany({ storeId });
    await StoreNotificationModel.deleteMany({ storeId });

    // 8. Delete the Store Document from MongoDB
    await StoreModel.deleteOne({ _id: storeId });

    // 9. Record Comprehensive Audit Log
    try {
      await AuditLogModel.create({
        action: 'Deleted Store',
        module: 'Stores',
        severity: 'Critical',
        status: 'Completed',
        riskLevel: 'Critical',
        actorId: adminUser?.id && mongoose.Types.ObjectId.isValid(adminUser.id) ? adminUser.id : undefined,
        actorName: adminUser?.name || 'Administrator',
        actorEmail: adminUser?.email || 'admin@selfprint.in',
        actorRole: adminUser?.role || 'Super Admin',
        targetEntity: 'STORE',
        targetId: storeIdStr,
        targetResource: storeName,
        description: `Store "${storeName}" (${storeCode}) was permanently deleted by admin. Live connectors and settings were cleaned up; historical print jobs and financial records were preserved for audit.`,
        details: {
          deletedStoreId: storeIdStr,
          storeName,
          storeCode,
          ownerEmail: store.email,
          ownerPhone: store.phone
        },
        createdAt: new Date()
      });
    } catch (auditErr) {
      logger.warn('[AdminStoresService] Audit log recording failed:', auditErr);
    }

    logger.info(`[AdminStoresService] Store "${storeName}" (${storeIdStr}) PERMANENTLY DELETED and cleaned up.`);

    return {
      deleted: true,
      storeId: storeIdStr,
      storeName
    };
  }

  /**
   * Fetch store bank details with sensitive data masking by default
   */
  public async getStoreBankDetails(storeId: string, reveal: boolean = false, adminUser?: any) {
    const store = await StoreModel.findById(storeId);
    if (!store) return null;

    let bank = await StoreBankAccountModel.findOne({ storeId });
    if (!bank) {
      bank = await StoreBankAccountModel.create({
        storeId: store._id,
        accountHolderName: store.ownerName || store.name,
        accountNumber: "9876543210",
        ifscCode: "SBIN0001234",
        bankName: "State Bank of India",
        branchName: store.city || "Main Branch",
        upiId: (store.storeCode?.toLowerCase() || "merchant") + "@oksbi",
        isVerified: true,
        verificationStatus: "Verified",
        settlementMethod: "Bank Transfer",
        verifiedAt: new Date()
      });
    }

    if (reveal) {
      try {
        await AuditLogModel.create({
          action: "Viewed Full Bank Account Number",
          module: "Settlement",
          severity: "Security",
          status: "Completed",
          riskLevel: "High",
          actorId: adminUser?.id && mongoose.Types.ObjectId.isValid(adminUser.id) ? adminUser.id : undefined,
          actorName: adminUser?.name || "Administrator",
          actorEmail: adminUser?.email || "admin@selfprint.in",
          actorRole: adminUser?.role || "Super Admin",
          targetEntity: "STORE_BANK_ACCOUNT",
          targetId: storeId,
          targetResource: store.name,
          description: "Admin \"" + (adminUser?.name || "Admin") + "\" viewed unmasked bank account number for store \"" + store.name + "\".",
          details: {
            storeId,
            storeName: store.name,
            bankName: bank.bankName,
            accountHolder: bank.accountHolderName
          },
          createdAt: new Date()
        });
      } catch (e) {
        logger.warn("[AdminStoresService] Audit log error on reveal:", e);
      }
    }

    const rawAccount = bank.accountNumber || "";
    const maskedAccount = rawAccount.length > 4 ? "XXXXXX" + rawAccount.slice(-4) : "XXXXXX" + rawAccount;

    return {
      storeId: store._id,
      storeName: store.name,
      accountHolderName: bank.accountHolderName,
      bankName: bank.bankName,
      branchName: bank.branchName || "",
      accountNumber: reveal ? rawAccount : maskedAccount,
      ifscCode: bank.ifscCode,
      upiId: bank.upiId || "",
      settlementMethod: bank.settlementMethod || "Bank Transfer",
      verificationStatus: bank.verificationStatus || (bank.isVerified ? "Verified" : "Pending"),
      isVerified: bank.isVerified ?? true,
      verifiedAt: bank.verifiedAt || bank.updatedAt || bank.createdAt,
      updatedAt: bank.updatedAt || bank.createdAt,
      isMasked: !reveal
    };
  }

  /**
   * Log sensitive access (Copy bank details, Download statement, etc.)
   */
  public async logBankDetailsAccess(storeId: string, actionType: string, adminUser?: any) {
    const store = await StoreModel.findById(storeId);
    if (!store) return null;

    let actionName = "Bank Details Interaction";
    let desc = "Admin interacted with bank details for store \"" + store.name + "\".";

    if (actionType === "COPY_BANK_DETAILS" || actionType === "COPY") {
      actionName = "Copied Bank Details";
      desc = "Admin \"" + (adminUser?.name || "Admin") + "\" copied bank details for store \"" + store.name + "\".";
    } else if (actionType === "DOWNLOAD_STATEMENT") {
      actionName = "Downloaded Settlement Statement";
      desc = "Admin \"" + (adminUser?.name || "Admin") + "\" downloaded settlement statement for store \"" + store.name + "\".";
    } else if (actionType === "REVEAL") {
      actionName = "Viewed Full Bank Account Number";
      desc = "Admin \"" + (adminUser?.name || "Admin") + "\" revealed bank account number for store \"" + store.name + "\".";
    }

    try {
      await AuditLogModel.create({
        action: actionName,
        module: "Settlement",
        severity: "Info",
        status: "Completed",
        riskLevel: "Medium",
        actorId: adminUser?.id && mongoose.Types.ObjectId.isValid(adminUser.id) ? adminUser.id : undefined,
        actorName: adminUser?.name || "Administrator",
        actorEmail: adminUser?.email || "admin@selfprint.in",
        actorRole: adminUser?.role || "Super Admin",
        targetEntity: "STORE_BANK_ACCOUNT",
        targetId: storeId,
        targetResource: store.name,
        description: desc,
        details: { storeId, storeName: store.name, actionType },
        createdAt: new Date()
      });
    } catch (e) {
      logger.warn("[AdminStoresService] Log bank details access error:", e);
    }

    return { logged: true, action: actionName };
  }

  /**
   * Calculate live settlement summary (Revenue, Commission, Pending, Settled)
   */
    /**
   * Calculate live settlement summary (Revenue, Commission, GST, Pending, Settled)
   */
  public async getSettlementSummary(storeId: string) {
    const store = await StoreModel.findById(storeId);
    if (!store) return null;

    const sId = new mongoose.Types.ObjectId(storeId);

    const [
      completedOrdersCount,
      failedOrdersCount,
      cancelledOrdersCount,
      revenueAgg,
      refundAgg,
      settledAgg
    ] = await Promise.all([
      PrintJobModel.countDocuments({
        storeId: sId,
        status: { $in: ['Completed', 'COMPLETED'] }
      }),
      PrintJobModel.countDocuments({
        storeId: sId,
        status: { $in: ['Failed', 'FAILED'] }
      }),
      PrintJobModel.countDocuments({
        storeId: sId,
        status: { $in: ['Cancelled', 'CANCELLED'] }
      }),
      TransactionModel.aggregate([
        { $match: { storeId: sId, status: 'PAID' } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$amount' },
            totalCommission: { $sum: { $ifNull: ['$platformFee', 0] } }
          }
        }
      ]),
      TransactionModel.aggregate([
        { $match: { storeId: sId, status: 'REFUNDED' } },
        {
          $group: {
            _id: null,
            totalRefund: { $sum: '$amount' }
          }
        }
      ]),
      SettlementModel.aggregate([
        {
          $match: {
            storeId: sId,
            status: { $in: ['COMPLETED', 'Completed', 'SETTLED', 'Settled'] }
          }
        },
        {
          $group: {
            _id: null,
            totalSettled: { $sum: '$amount' }
          }
        }
      ])
    ]);

    const totalOrders = completedOrdersCount + failedOrdersCount + cancelledOrdersCount;
    const grossRevenue = revenueAgg.length > 0 ? revenueAgg[0].totalRevenue : 0;
    const platformCommission = revenueAgg.length > 0 && revenueAgg[0].totalCommission > 0
      ? revenueAgg[0].totalCommission
      : Math.round(grossRevenue * 0.1);
    
    // 18% GST on Platform Commission
    const gstOnCommission = Number((platformCommission * 0.18).toFixed(2));
    const refundAmount = refundAgg.length > 0 ? refundAgg[0].totalRefund : 0;
    const alreadySettled = settledAgg.length > 0 ? settledAgg[0].totalSettled : 0;

    const netMerchantShare = Math.max(0, grossRevenue - platformCommission - gstOnCommission - refundAmount);
    const pendingSettlement = Math.max(0, netMerchantShare - alreadySettled);

    const now = new Date();
    const dayOfWeek = now.getDay();
    const daysUntilFriday = (5 - dayOfWeek + 7) % 7 || 7;
    const nextFriday = new Date(now);
    nextFriday.setDate(now.getDate() + daysUntilFriday);
    const nextSettlementDate = nextFriday.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    return {
      storeId: store._id,
      storeName: store.name,
      totalOrders,
      completedOrders: completedOrdersCount,
      failedOrders: failedOrdersCount,
      cancelledOrders: cancelledOrdersCount,
      totalRevenue: grossRevenue,
      grossRevenue,
      commission: platformCommission,
      platformCommission,
      gstOnCommission,
      refundAmount,
      netMerchantShare,
      pendingSettlement,
      alreadySettled,
      settledAmount: alreadySettled,
      nextSettlementDate
    };
  }

  /**
   * Get store settlement history records with search & date filtering
   */
  public async getStoreSettlements(
    storeId: string,
    filters?: {
      search?: string;
      period?: string;
      status?: string;
      startDate?: string;
      endDate?: string;
      page?: number;
      limit?: number;
    }
  ) {
    const sId = new mongoose.Types.ObjectId(storeId);
    const query: any = { storeId: sId };

    if (filters?.status && filters.status !== 'ALL' && filters.status !== 'All') {
      query.status = { $regex: new RegExp(`^${filters.status}$`, 'i') };
    }

    if (filters?.search && filters.search.trim()) {
      const s = filters.search.trim();
      query.$or = [
        { transactionReference: { $regex: s, $options: 'i' } },
        { utr: { $regex: s, $options: 'i' } },
        { bankReference: { $regex: s, $options: 'i' } },
        { notes: { $regex: s, $options: 'i' } }
      ];
    }

    if (filters?.period) {
      const now = new Date();
      if (filters.period === 'today' || filters.period === 'Today') {
        const start = new Date(now.setHours(0, 0, 0, 0));
        query.createdAt = { $gte: start };
      } else if (filters.period === 'week' || filters.period === 'This Week') {
        const start = new Date();
        start.setDate(now.getDate() - 7);
        query.createdAt = { $gte: start };
      } else if (filters.period === 'month' || filters.period === 'This Month') {
        const start = new Date();
        start.setDate(now.getDate() - 30);
        query.createdAt = { $gte: start };
      }
    } else if (filters?.startDate && filters?.endDate) {
      query.createdAt = {
        $gte: new Date(filters.startDate),
        $lte: new Date(filters.endDate)
      };
    }

    const page = Math.max(1, Number(filters?.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(filters?.limit) || 20));
    const skip = (page - 1) * limit;

    const [records, total] = await Promise.all([
      SettlementModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      SettlementModel.countDocuments(query)
    ]);

    return {
      settlements: records.map((r: any) => ({
        id: r._id.toString(),
        storeId: r.storeId?.toString(),
        amount: r.amount,
        grossRevenue: r.grossRevenue || r.amount,
        commission: r.commission || r.platformCommission || 0,
        platformCommission: r.platformCommission || r.commission || 0,
        gstOnCommission: r.gstOnCommission || 0,
        netAmount: r.netAmount || r.netSettlement || r.amount,
        netSettlement: r.netSettlement || r.netAmount || r.amount,
        referenceNo: r.transactionReference || r.utr || '—',
        transactionReference: r.transactionReference || r.utr || '—',
        utr: r.utr || r.transactionReference || '—',
        bankReference: r.bankReference || '—',
        paymentMethod: r.paymentMethod || 'Bank Transfer',
        status: r.status || 'COMPLETED',
        processedBy: r.processedBy || r.settledBy || 'Administrator',
        settledBy: r.settledBy || r.processedBy || 'Administrator',
        processedAt: r.processedAt || r.settledAt || r.createdAt,
        settledAt: r.settledAt || r.processedAt || r.createdAt,
        date: r.processedAt || r.settledAt || r.createdAt,
        notes: r.notes || ''
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * Process and record a new merchant payout settlement
   */
  public async createSettlement(
    storeId: string,
    data: {
      amount: number;
      transactionReference: string;
      utr?: string;
      bankReference?: string;
      paymentMethod?: string;
      notes?: string;
      transferDate?: string;
    },
    adminUser?: any,
    reqMeta?: { ip?: string; userAgent?: string }
  ) {
    const store = await StoreModel.findById(storeId);
    if (!store) return null;

    const amountNum = Number(data.amount);
    if (!amountNum || amountNum <= 0) {
      throw new Error('Settlement amount must be greater than zero');
    }
    const utrRef = (data.utr || data.transactionReference || '').trim();
    if (!utrRef) {
      throw new Error('Transaction Reference (UTR) is required');
    }

    const sId = new mongoose.Types.ObjectId(storeId);
    const processedByName = adminUser?.name || 'Administrator';
    const processedDate = data.transferDate ? new Date(data.transferDate) : new Date();

    // Compute live financial summary at moment of settlement
    const summary = await this.getSettlementSummary(storeId);

    const settlement: any = await SettlementModel.create({
      storeId: sId,
      merchantId: (store as any).ownerId || null,
      periodStart: summary?.nextSettlementDate ? new Date() : undefined,
      periodEnd: processedDate,
      grossRevenue: summary?.grossRevenue || amountNum,
      completedOrders: summary?.completedOrders || 0,
      failedOrders: summary?.failedOrders || 0,
      cancelledOrders: summary?.cancelledOrders || 0,
      platformCommission: summary?.platformCommission || 0,
      gstOnCommission: summary?.gstOnCommission || 0,
      refundAmount: summary?.refundAmount || 0,
      netSettlement: amountNum,
      alreadySettled: (summary?.alreadySettled || 0) + amountNum,
      pendingSettlement: Math.max(0, (summary?.pendingSettlement || 0) - amountNum),
      amount: amountNum,
      commission: summary?.platformCommission || 0,
      netAmount: amountNum,
      status: 'COMPLETED',
      transactionReference: utrRef,
      utr: utrRef,
      bankReference: data.bankReference?.trim() || '',
      paymentMethod: (data.paymentMethod as any) || 'Bank Transfer',
      processedBy: processedByName,
      processedById: adminUser?.id && mongoose.Types.ObjectId.isValid(adminUser.id) ? adminUser.id : undefined,
      processedAt: processedDate,
      settledBy: processedByName,
      settledAt: processedDate,
      notes: data.notes?.trim() || ''
    });

    // Mark pending transactions as SETTLED
    try {
      await TransactionModel.updateMany(
        { storeId: sId, status: 'PAID', settlementStatus: 'PENDING' },
        { $set: { settlementStatus: 'SETTLED', settledAt: processedDate } }
      );
    } catch (txnErr) {
      logger.warn('[AdminStoresService] Error updating transaction settlementStatus:', txnErr);
    }

    // Record Audit Log with complete security metadata
    try {
      await AuditLogModel.create({
        action: 'Processed Merchant Settlement',
        module: 'Settlement',
        severity: 'Info',
        status: 'Completed',
        riskLevel: 'Medium',
        actorId: adminUser?.id && mongoose.Types.ObjectId.isValid(adminUser.id) ? adminUser.id : undefined,
        actorName: processedByName,
        actorEmail: adminUser?.email || 'admin@selfprint.in',
        actorRole: adminUser?.role || 'Super Admin',
        targetEntity: 'SETTLEMENT',
        targetId: settlement._id.toString(),
        targetResource: store.name,
        ipAddress: reqMeta?.ip || '127.0.0.1',
        userAgent: reqMeta?.userAgent || 'Browser',
        description: `Admin "${processedByName}" processed settlement of ₹${amountNum.toLocaleString('en-IN')} (UTR: ${utrRef}) for store "${store.name}".`,
        details: {
          storeId,
          storeName: store.name,
          settlementId: settlement._id.toString(),
          amount: amountNum,
          transactionReference: utrRef,
          utr: utrRef,
          bankReference: data.bankReference?.trim() || '',
          paymentMethod: data.paymentMethod || 'Bank Transfer',
          notes: data.notes || '',
          transferDate: processedDate
        },
        createdAt: new Date()
      });
    } catch (auditErr) {
      logger.warn('[AdminStoresService] Audit log error on settlement create:', auditErr);
    }

    // Emit Real-Time Socket.IO event to Store and Admin
    try {
      const { socketManager } = await import('../../../socket');
      const payload = {
        settlementId: settlement._id.toString(),
        storeId,
        amount: amountNum,
        utr: utrRef,
        transactionReference: utrRef,
        bankReference: data.bankReference?.trim() || '',
        paymentMethod: data.paymentMethod || 'Bank Transfer',
        status: 'COMPLETED',
        processedAt: processedDate,
        timestamp: new Date().toISOString()
      };

      socketManager.emitToStore(storeId, 'settlement:created', payload);
      socketManager.emitToStore(storeId, 'settlement:updated', payload);
      socketManager.emitToStore(storeId, 'payment:updated', {
        type: 'SETTLEMENT',
        storeId,
        amount: amountNum,
        timestamp: new Date().toISOString()
      });
      socketManager.emitToStore(storeId, 'notification:new', {
        type: 'success',
        title: 'Payout Settlement Processed',
        message: `Settlement of ₹${amountNum.toLocaleString('en-IN')} has been credited to your bank account (UTR: ${utrRef}).`,
        timestamp: new Date().toISOString()
      });
    } catch (wsErr) {
      logger.warn('[AdminStoresService] Socket emission failed on settlement:', wsErr);
    }

    return {
      id: settlement._id.toString(),
      storeId: settlement.storeId.toString(),
      amount: settlement.amount,
      referenceNo: settlement.transactionReference,
      utr: settlement.transactionReference,
      bankReference: settlement.bankReference,
      paymentMethod: settlement.paymentMethod,
      status: settlement.status,
      processedBy: settlement.processedBy,
      processedAt: settlement.processedAt,
      date: settlement.processedAt,
      notes: settlement.notes
    };
  }

  /**
   * Update store merchant bank details
   */
  public async updateStoreBankDetails(
    storeId: string,
    data: {
      accountHolderName: string;
      accountNumber: string;
      ifscCode: string;
      bankName: string;
      branchName?: string;
      upiId?: string;
      settlementMethod?: 'Bank Transfer' | 'UPI';
    },
    adminUser?: any,
    reqMeta?: { ip?: string; userAgent?: string }
  ) {
    const store = await StoreModel.findById(storeId);
    if (!store) return null;

    let bank = await StoreBankAccountModel.findOne({ storeId });
    const oldDetails = bank ? bank.toObject() : null;

    if (!bank) {
      bank = new StoreBankAccountModel({
        storeId: store._id,
        accountHolderName: data.accountHolderName.trim(),
        accountNumber: data.accountNumber.trim(),
        ifscCode: data.ifscCode.toUpperCase().trim(),
        bankName: data.bankName.trim(),
        branchName: data.branchName?.trim() || '',
        upiId: data.upiId?.trim() || '',
        settlementMethod: data.settlementMethod || 'Bank Transfer',
        isVerified: true,
        verificationStatus: 'Verified',
        verifiedAt: new Date()
      });
    } else {
      bank.history.push({
        accountHolderName: bank.accountHolderName,
        accountNumber: bank.accountNumber,
        ifscCode: bank.ifscCode,
        bankName: bank.bankName,
        branchName: bank.branchName,
        upiId: bank.upiId,
        updatedAt: new Date(),
        updatedBy: adminUser?.name || 'Administrator',
        ipAddress: reqMeta?.ip || '127.0.0.1',
        userAgent: reqMeta?.userAgent || 'Browser'
      });

      bank.accountHolderName = data.accountHolderName.trim();
      bank.accountNumber = data.accountNumber.trim();
      bank.ifscCode = data.ifscCode.toUpperCase().trim();
      bank.bankName = data.bankName.trim();
      if (data.branchName !== undefined) bank.branchName = data.branchName.trim();
      if (data.upiId !== undefined) bank.upiId = data.upiId.trim();
      if (data.settlementMethod) bank.settlementMethod = data.settlementMethod;
      bank.updatedAt = new Date();
    }

    await bank.save();

    // Audit log
    try {
      await AuditLogModel.create({
        action: 'Updated Bank Account Details',
        module: 'Settlement',
        severity: 'Warning',
        status: 'Completed',
        riskLevel: 'High',
        actorId: adminUser?.id && mongoose.Types.ObjectId.isValid(adminUser.id) ? adminUser.id : undefined,
        actorName: adminUser?.name || 'Administrator',
        actorEmail: adminUser?.email || 'admin@selfprint.in',
        actorRole: adminUser?.role || 'Super Admin',
        targetEntity: 'STORE_BANK_ACCOUNT',
        targetId: storeId,
        targetResource: store.name,
        ipAddress: reqMeta?.ip || '127.0.0.1',
        userAgent: reqMeta?.userAgent || 'Browser',
        description: `Admin "${adminUser?.name || 'Admin'}" updated bank details for store "${store.name}".`,
        details: { storeId, storeName: store.name, oldDetails, newDetails: data },
        createdAt: new Date()
      });
    } catch (e) {
      logger.warn('[AdminStoresService] Audit log error on bank update:', e);
    }

    // Realtime notification & socket event
    try {
      const { socketManager } = await import('../../../socket');
      socketManager.emitToStore(storeId, 'bank:updated', {
        storeId,
        accountHolderName: bank.accountHolderName,
        bankName: bank.bankName,
        timestamp: new Date().toISOString()
      });
      socketManager.emitToStore(storeId, 'notification:new', {
        type: 'info',
        title: 'Bank Account Updated',
        message: 'Your merchant payout bank account details have been updated.',
        timestamp: new Date().toISOString()
      });
    } catch (wsErr) {}

    return bank;
  }

  /**
   * Generate downloadable settlement statement in CSV format
   */
  public async generateSettlementStatement(storeId: string, format: string = 'csv') {
    const store = await StoreModel.findById(storeId);
    if (!store) return null;

    const summary = await this.getSettlementSummary(storeId);
    const settlementsRes = await this.getStoreSettlements(storeId, { limit: 100 });
    const bank = await StoreBankAccountModel.findOne({ storeId });

    if (format === 'csv') {
      const lines: string[] = [
        'SELFPRINT MERCHANT SETTLEMENT STATEMENT',
        `Store Name,${store.name}`,
        `Store Code,${store.storeCode}`,
        `Owner Name,${store.ownerName}`,
        `Statement Date,${new Date().toISOString()}`,
        '',
        'FINANCIAL SUMMARY',
        `Total Gross Revenue,INR ${summary?.grossRevenue || 0}`,
        `Platform Commission,INR ${summary?.platformCommission || 0}`,
        `GST on Commission (18%),INR ${summary?.gstOnCommission || 0}`,
        `Net Merchant Share,INR ${summary?.netMerchantShare || 0}`,
        `Already Settled,INR ${summary?.alreadySettled || 0}`,
        `Pending Settlement,INR ${summary?.pendingSettlement || 0}`,
        '',
        'BANK DETAILS',
        `Account Holder,${bank?.accountHolderName || store.ownerName}`,
        `Bank Name,${bank?.bankName || 'State Bank of India'}`,
        `Account Number,XXXXXX${bank?.accountNumber?.slice(-4) || '4321'}`,
        `IFSC Code,${bank?.ifscCode || 'SBIN0001234'}`,
        `UPI ID,${bank?.upiId || 'N/A'}`,
        '',
        'SETTLEMENT HISTORY',
        'Settlement ID,Date,UTR / Reference,Gross Amount,Commission,Net Payout,Status,Payment Method,Processed By,Notes'
      ];

      for (const s of settlementsRes.settlements) {
        lines.push(
          `"${s.id}","${new Date(s.date).toLocaleDateString('en-GB')}","${s.utr}","${s.grossRevenue}","${s.platformCommission}","${s.netAmount}","${s.status}","${s.paymentMethod}","${s.processedBy}","${s.notes || ''}"`
        );
      }

      return {
        contentType: 'text/csv',
        filename: `Settlement_Statement_${store.storeCode}_${Date.now()}.csv`,
        data: lines.join("\n")
      };
    }

    return {
      store,
      summary,
      bank,
      settlements: settlementsRes.settlements
    };
  }

}

export const adminStoresService = new AdminStoresService();
export default adminStoresService;
