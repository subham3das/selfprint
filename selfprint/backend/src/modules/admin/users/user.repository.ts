import mongoose from 'mongoose';
import { UserModel, IUser, PrintJobModel } from '../../../models';
import { UserFilterQueryParams, UpdateUserDto } from './user.types';

type FilterQuery<T> = Record<string, any>;

export class UserRepository {
  /**
   * Build Mongoose Filter Query from request parameters
   */
  private buildQuery(params: UserFilterQueryParams): FilterQuery<IUser> {
    const query: FilterQuery<IUser> = { isDeleted: false };

    // 1. Multi-field Search
    if (params.searchQuery && params.searchQuery.trim()) {
      const searchRegex = new RegExp(params.searchQuery.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
        { city: searchRegex },
        { userIdCode: searchRegex }
      ];
    }

    // 2. Status Filter
    if (params.status && params.status !== 'All') {
      query.status = params.status;
    }

    // 3. City Filter
    if (params.city && params.city !== 'All') {
      query.city = params.city;
    }

    // 4. Membership Plan Filter
    if (params.plan && params.plan !== 'All') {
      query.membershipPlan = params.plan;
    }

    return query;
  }

  /**
   * Find paginated users with filters and dynamic sorting
   */
  public async findPaginatedUsers(
    params: UserFilterQueryParams,
    page = 1,
    pageSize = 10
  ): Promise<{
    users: (IUser & { storeDetails?: { name: string } | null })[];
    totalCount: number;
    uniqueStores: string[];
    uniqueCities: string[];
  }> {
    const query = this.buildQuery(params);

    // Sorting
    let sortOptions: Record<string, 1 | -1> = { createdAt: -1 };
    if (params.sortBy === 'oldest') sortOptions = { createdAt: 1 };
    else if (params.sortBy === 'name') sortOptions = { name: 1 };
    else if (params.sortBy === 'active') sortOptions = { lastActive: -1 };

    const skip = (page - 1) * pageSize;

    // Parallel fetch: Paginated Users, Total Count, Unique Store & City values
    const [users, totalCount, allActiveUsers] = await Promise.all([
      UserModel.find(query)
        .populate('storeId', 'name storeCode address')
        .sort(sortOptions)
        .skip(skip)
        .limit(pageSize)
        .lean(),
      UserModel.countDocuments(query),
      UserModel.find({ isDeleted: false }).select('city storeId').populate('storeId', 'name').lean()
    ]);

    // Compute distinct dropdowns
    const uniqueCitiesSet = new Set<string>();
    const uniqueStoresSet = new Set<string>();

    for (const u of allActiveUsers) {
      if (u.city) uniqueCitiesSet.add(u.city);
      if (u.storeId && typeof u.storeId === 'object' && (u.storeId as any).name) {
        uniqueStoresSet.add((u.storeId as any).name);
      }
    }

    return {
      users: (users || []) as any,
      totalCount: totalCount || 0,
      uniqueStores: Array.from(uniqueStoresSet).sort(),
      uniqueCities: Array.from(uniqueCitiesSet).sort()
    };
  }

  /**
   * Aggregate high-level User Stats for top KPI cards
   */
  public async calculateUserStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    newUsersToday: number;
    verifiedUsers: number;
    bannedUsers: number;
    usersOnline: number;
  }> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60000);

    const [
      totalUsers,
      activeUsers,
      newUsersToday,
      verifiedUsers,
      bannedUsers,
      usersOnline
    ] = await Promise.all([
      UserModel.countDocuments({ isDeleted: false }),
      UserModel.countDocuments({ isDeleted: false, status: 'Active' }),
      UserModel.countDocuments({ isDeleted: false, createdAt: { $gte: startOfDay } }),
      UserModel.countDocuments({ isDeleted: false, isVerified: true }),
      UserModel.countDocuments({ isDeleted: false, status: { $in: ['Banned', 'Blocked'] } }),
      UserModel.countDocuments({
        isDeleted: false,
        $or: [{ isOnline: true }, { lastActive: { $gte: fifteenMinutesAgo } }]
      })
    ]);

    return {
      totalUsers: totalUsers || 0,
      activeUsers: activeUsers || 0,
      newUsersToday: newUsersToday || 0,
      verifiedUsers: verifiedUsers || 0,
      bannedUsers: bannedUsers || 0,
      usersOnline: usersOnline || 0
    };
  }

  /**
   * Get user by ID or UserIDCode with recent print jobs
   */
  public async getUserByIdWithOrders(id: string): Promise<{
    user: IUser | null;
    orders: any[];
    orderStats: {
      totalOrders: number;
      totalSpent: number;
      totalPages: number;
      colorPages: number;
      bwPages: number;
    };
  }> {
    let query: FilterQuery<IUser>;
    if (mongoose.Types.ObjectId.isValid(id)) {
      query = { _id: new mongoose.Types.ObjectId(id), isDeleted: false };
    } else {
      query = { userIdCode: id, isDeleted: false };
    }

    const user = await UserModel.findOne(query).populate('storeId', 'name storeCode address').lean();
    if (!user) {
      return {
        user: null,
        orders: [],
        orderStats: { totalOrders: 0, totalSpent: 0, totalPages: 0, colorPages: 0, bwPages: 0 }
      };
    }

    // Fetch user print orders from PrintJob collection
    const orders = await PrintJobModel.find({
      $or: [{ userId: user._id }, { customerName: user.name }]
    })
      .populate('storeId', 'name')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    let totalOrders = orders.length;
    let totalSpent = 0;
    let totalPages = 0;
    let colorPages = 0;
    let bwPages = 0;

    for (const ord of orders) {
      totalSpent += ord.price || 0;
      const pages = (ord.totalPages || 1) * (ord.copies || 1);
      totalPages += pages;
      if (ord.printType === 'Color' || ord.printType === 'COLOR') {
        colorPages += pages;
      } else {
        bwPages += pages;
      }
    }

    return {
      user: user as any,
      orders,
      orderStats: {
        totalOrders,
        totalSpent,
        totalPages,
        colorPages,
        bwPages
      }
    };
  }

  /**
   * Update User
   */
  public async updateUser(id: string, data: UpdateUserDto): Promise<IUser | null> {
    let query: FilterQuery<IUser>;
    if (mongoose.Types.ObjectId.isValid(id)) {
      query = { _id: new mongoose.Types.ObjectId(id), isDeleted: false };
    } else {
      query = { userIdCode: id, isDeleted: false };
    }

    return UserModel.findOneAndUpdate(
      query,
      { $set: data },
      { returnDocument: 'after', runValidators: true }
    ).populate('storeId', 'name storeCode address');
  }

  /**
   * Update Status (Block/Unblock/Activate/Ban)
   */
  public async updateStatus(
    id: string,
    status: string,
    reason?: string,
    adminId?: string
  ): Promise<IUser | null> {
    let query: FilterQuery<IUser>;
    if (mongoose.Types.ObjectId.isValid(id)) {
      query = { _id: new mongoose.Types.ObjectId(id), isDeleted: false };
    } else {
      query = { userIdCode: id, isDeleted: false };
    }

    const updatePayload: Record<string, any> = {
      status,
      lastActive: new Date()
    };

    if (status === 'Banned' || status === 'Blocked') {
      updatePayload.blockReason = reason || 'Suspended by Administrator';
      updatePayload.blockedAt = new Date();
      if (adminId && mongoose.Types.ObjectId.isValid(adminId)) {
        updatePayload.blockedBy = new mongoose.Types.ObjectId(adminId);
      }
    } else {
      updatePayload.blockReason = '';
      updatePayload.blockedAt = null;
      updatePayload.blockedBy = null;
    }

    return UserModel.findOneAndUpdate(
      query,
      { $set: updatePayload },
      { returnDocument: 'after' }
    ).populate('storeId', 'name storeCode address');
  }

  /**
   * Soft Delete User
   */
  public async softDelete(id: string, adminId?: string): Promise<boolean> {
    let query: FilterQuery<IUser>;
    if (mongoose.Types.ObjectId.isValid(id)) {
      query = { _id: new mongoose.Types.ObjectId(id), isDeleted: false };
    } else {
      query = { userIdCode: id, isDeleted: false };
    }

    const updatePayload: Record<string, any> = {
      isDeleted: true,
      deletedAt: new Date()
    };

    if (adminId && mongoose.Types.ObjectId.isValid(adminId)) {
      updatePayload.deletedBy = new mongoose.Types.ObjectId(adminId);
    }

    const res = await UserModel.updateOne(query, { $set: updatePayload });
    return res.modifiedCount > 0;
  }

  /**
   * Fetch all matching users for CSV export
   */
  public async findAllForExport(params: UserFilterQueryParams): Promise<any[]> {
    const query = this.buildQuery(params);
    return UserModel.find(query)
      .populate('storeId', 'name')
      .sort({ createdAt: -1 })
      .lean();
  }
}

export const userRepository = new UserRepository();
export default userRepository;
