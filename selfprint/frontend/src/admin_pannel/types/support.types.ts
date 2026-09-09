export type TicketStatus =
  | 'Open'
  | 'Pending'
  | 'In Progress'
  | 'Resolved'
  | 'Closed'
  | 'Escalated'
  | string;

export type TicketPriority = 'Low' | 'Medium' | 'High' | 'Critical' | string;

export type TicketCategory =
  | 'Technical'
  | 'Billing'
  | 'Refund'
  | 'Print Quality'
  | 'Account'
  | 'General'
  | 'Other'
  | string;

export interface SupportChatMessage {
  id: string;
  sender: 'customer' | 'admin';
  senderName: string;
  senderAvatar?: string;
  message: string;
  timestamp: string;
  attachments?: string[];
}

export interface AdminSupportTicketItem {
  id: string;
  ticketId: string;
  subject: string;
  previewText?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAvatar: string;
  storeName: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  assignedAdminName: string;
  assignedAdminAvatar: string;
  createdDate: string;
  createdTime: string;
  source: 'Web App' | 'QR Portal' | 'Email' | 'WhatsApp' | string;
  messages: SupportChatMessage[];
}

export interface SupportSparklinePoint {
  val: number;
}

export interface SupportStatCardItem {
  id: string;
  title: string;
  value: string;
  trend: string;
  isPositive: boolean;
  sparkline: number[];
  color: string;
}

export interface SupportStatsData {
  totalTickets: number;
  openTickets: number;
  inProgress: number;
  resolvedTickets: number;
  closedTickets: number;
  satisfactionRate: string;
  cards: SupportStatCardItem[];
}

export interface SupportOverviewSegment {
  name: string;
  count: number;
  percentage: number;
  color: string;
}

export interface RecentActivityItem {
  id: string;
  ticketId: string;
  action: 'created' | 'assigned' | 'resolved' | 'status_changed' | 'feedback' | 'replied' | string;
  description: string;
  actor: string;
  timestamp: string;
  iconType: 'receipt' | 'user' | 'check' | 'clock' | 'heart' | string;
}

export interface IssueCategoryStat {
  category: string;
  count: number;
  percentage: number;
}

export interface SupportDashboardOverviewResponse {
  stats: SupportStatsData;
  supportOverviewSegments: SupportOverviewSegment[];
  recentActivities: RecentActivityItem[];
  issueCategories: IssueCategoryStat[];
}

export interface SupportFilterOptions {
  statuses: string[];
  categories: string[];
  priorities: string[];
  sources: string[];
  stores: string[];
  staff: string[];
}

export interface SupportFilterState {
  searchQuery: string;
  status: string;
  category: string;
  priority: string;
  source: string;
}

export interface SupportTicketsListResponse {
  tickets: AdminSupportTicketItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
