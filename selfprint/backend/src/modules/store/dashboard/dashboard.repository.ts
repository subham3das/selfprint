import mongoose from 'mongoose';
import {
  StoreModel,
  IStore,
  PrinterModel,
  IPrinter,
  PrintJobModel,
  IPrintJob,
  StoreDashboardStatsModel,
  IStoreDashboardStats,
  StoreNotificationModel,
  IStoreNotification
} from '../../../models';

export class DashboardRepository {
  /**
   * Resolve primary/active store or fallback
   */
  public async getStore(storeId?: string): Promise<IStore | null> {
    if (storeId && mongoose.Types.ObjectId.isValid(storeId)) {
      const store = await StoreModel.findById(storeId).lean().exec();
      if (store) return store as unknown as IStore;
    }
    if (storeId) {
      const store = await StoreModel.findOne({ storeCode: storeId.toUpperCase() })
        .lean()
        .exec();
      if (store) return store as unknown as IStore;
    }
    // Fallback to the first active store if any exists
    return (await StoreModel.findOne({ status: 'ACTIVE' })
      .lean()
      .exec()) as unknown as IStore | null;
  }

  /**
   * Fetch active printer for the given store
   */
  public async getActivePrinter(storeId: mongoose.Types.ObjectId): Promise<IPrinter | null> {
    return (await PrinterModel.findOne({ storeId, isDefault: true })
      .lean()
      .exec()) ||
      (await PrinterModel.findOne({ storeId }).lean().exec()) as unknown as IPrinter | null;
  }

  /**
   * Fetch today's print jobs for exact calculations
   */
  public async getTodayJobs(
    storeId: mongoose.Types.ObjectId,
    startOfDay: Date,
    endOfDay: Date
  ): Promise<IPrintJob[]> {
    return (await PrintJobModel.find({
      storeId,
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    })
      .sort({ createdAt: -1 })
      .lean()
      .exec()) as unknown as IPrintJob[];
  }

  public async getRecentQueue(
    storeId: mongoose.Types.ObjectId,
    status?: string,
    page = 1,
    limit = 10,
    search?: string,
    paperSize?: string,
    colorMode?: string,
    sortBy = 'newest'
  ): Promise<{ jobs: IPrintJob[]; total: number }> {
    const query: any = { storeId };

    // 1. Status Filter
    if (status && status !== 'All' && status !== 'All Jobs') {
      query.status = { $regex: new RegExp(`^${status}$`, 'i') };
    }

    // 2. Search Filter
    if (search && search.trim()) {
      const s = search.trim();
      query.$or = [
        { jobNumber: { $regex: s, $options: 'i' } },
        { fileName: { $regex: s, $options: 'i' } },
        { customerName: { $regex: s, $options: 'i' } }
      ];
    }

    // 3. Paper Size Filter
    if (paperSize && paperSize !== 'All') {
      query.paperSize = { $regex: new RegExp(`^${paperSize}$`, 'i') };
    }

    // 4. Color Mode Filter
    if (colorMode && colorMode !== 'All') {
      const modeRegex = colorMode.toLowerCase().includes('color') ? /color/i : /bw|b&w/i;
      query.printType = { $regex: modeRegex };
    }

    // 5. Sorting
    let sortQuery: any = { createdAt: -1 };
    switch (sortBy) {
      case 'oldest':
        sortQuery = { createdAt: 1 };
        break;
      case 'highest_pages':
        sortQuery = { totalPages: -1 };
        break;
      case 'lowest_pages':
        sortQuery = { totalPages: 1 };
        break;
      case 'price_high':
        sortQuery = { price: -1 };
        break;
      case 'price_low':
        sortQuery = { price: 1 };
        break;
      case 'newest':
      default:
        sortQuery = { createdAt: -1 };
        break;
    }

    const skip = (page - 1) * limit;

    const [jobs, total] = await Promise.all([
      PrintJobModel.find(query)
        .sort(sortQuery)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      PrintJobModel.countDocuments(query).exec()
    ]);

    return {
      jobs: (jobs || []) as unknown as IPrintJob[],
      total: total || 0
    };
  }

  /**
   * Fetch all queue jobs currently active (Waiting / Printing)
   */
  public async getLiveQueueJobs(storeId: mongoose.Types.ObjectId): Promise<IPrintJob[]> {
    return (await PrintJobModel.find({
      storeId,
      status: { $in: ['Waiting', 'Printing', 'WAITING', 'PRINTING'] }
    })
      .sort({ createdAt: 1 })
      .lean()
      .exec()) as unknown as IPrintJob[];
  }

  /**
   * Fetch store dashboard summary stats
   */
  public async getDashboardStats(
    storeId: mongoose.Types.ObjectId
  ): Promise<IStoreDashboardStats | null> {
    return (await StoreDashboardStatsModel.findOne({ storeId })
      .lean()
      .exec()) as unknown as IStoreDashboardStats | null;
  }

  /**
   * Upsert store dashboard stats cache
   */
  public async upsertDashboardStats(
    storeId: mongoose.Types.ObjectId,
    stats: Partial<IStoreDashboardStats>
  ): Promise<IStoreDashboardStats> {
    const updated = await StoreDashboardStatsModel.findOneAndUpdate(
      { storeId },
      { ...stats, storeId },
      { returnDocument: 'after', upsert: true, setDefaultsOnInsert: true }
    )
      .lean()
      .exec();
    return updated as unknown as IStoreDashboardStats;
  }

  /**
   * Fetch recent notifications
   */
  public async getNotifications(
    storeId: mongoose.Types.ObjectId,
    limit = 10
  ): Promise<IStoreNotification[]> {
    return (await StoreNotificationModel.find({ storeId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()
      .exec()) as unknown as IStoreNotification[];
  }

  /**
   * Count unread notifications
   */
  public async countUnreadNotifications(storeId: mongoose.Types.ObjectId): Promise<number> {
    return StoreNotificationModel.countDocuments({ storeId, isRead: false }).exec();
  }
}

export const dashboardRepository = new DashboardRepository();
export default dashboardRepository;
