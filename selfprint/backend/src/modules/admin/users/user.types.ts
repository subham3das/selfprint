import { UserStatusType, UserMembershipPlanType } from '../../../models/user.model';

export interface UserRecentOrderItemDto {
  id: string;
  jobNumber: string;
  fileName: string;
  storeName: string;
  pages: number;
  colorMode: 'Color' | 'B&W';
  amount: string;
  status: string;
  date: string;
}

export interface AdminUserListItemDto {
  id: string;
  userIdCode: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl: string;
  storeId?: string | null;
  storeName: string;
  city: string;
  state: string;
  fullAddress: string;
  country: string;
  totalOrders: number;
  totalSpentRaw: number;
  totalSpentFormatted: string;
  pagesPrinted: number;
  colorPrintsCount: number;
  bwPrintsCount: number;
  favoriteStore: string;
  status: UserStatusType;
  isVerified: boolean;
  membershipPlan: UserMembershipPlanType;
  joinedOn: string;
  lastActive: string;
  isOnline: boolean;
}

export interface AdminUserDetailsDto extends AdminUserListItemDto {
  blockReason?: string;
  blockedAt?: string;
  recentOrders: UserRecentOrderItemDto[];
}

export interface UserStatsDto {
  totalUsers: number;
  totalUsersTrend: string;
  activeUsers: number;
  activeUsersTrend: string;
  newUsersToday: number;
  newUsersTrend: string;
  verifiedUsers: number;
  verifiedPercent: string;
  bannedUsers: number;
  bannedUsersTrend: string;
  usersOnline: number;
  onlineSubtitle: string;
}

export interface PaginatedUsersResponseDto {
  users: AdminUserListItemDto[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  uniqueStores: string[];
  uniqueCities: string[];
}

export interface UserFilterQueryParams {
  searchQuery?: string;
  status?: string;
  store?: string;
  city?: string;
  plan?: string;
  sortBy?: 'newest' | 'oldest' | 'orders' | 'spent' | 'active' | 'name';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface UpdateUserDto {
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  storeId?: string | null;
  membershipPlan?: UserMembershipPlanType;
  status?: UserStatusType;
}
