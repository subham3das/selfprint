export type UserStatus =
  | 'Active'
  | 'Inactive'
  | 'Blocked'
  | 'Banned'
  | 'Pending'
  | 'Verified';

export type UserMembershipPlan = 'Basic' | 'Pro' | 'Enterprise' | 'Student';

export interface UserRecentOrderItem {
  id: string;
  fileName: string;
  storeName: string;
  pages: number;
  colorMode: 'Color' | 'B&W';
  amount: string;
  status: 'Completed' | 'Printing' | 'Failed';
  date: string;
}

export interface AdminUserItem {
  id: string;
  userIdCode: string; // e.g. "USR-1082"
  name: string;
  email: string;
  phone: string;
  avatarUrl: string;
  storeName: string;
  storeIdCode?: string;
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
  status: UserStatus;
  isVerified: boolean;
  membershipPlan: UserMembershipPlan;
  joinedOn: string;
  lastActive: string;
  recentOrders?: UserRecentOrderItem[];
}

export interface UserStatsData {
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

export interface UserFilterState {
  searchQuery: string;
  status: string; // 'All' | UserStatus
  store: string; // 'All' | string
  city: string; // 'All' | string
  plan: string; // 'All' | UserMembershipPlan
}

export interface UserFormValues {
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  status: UserStatus;
  membershipPlan: UserMembershipPlan;
}
