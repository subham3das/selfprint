export type TicketStatus =
  | 'Open'
  | 'Pending'
  | 'In Progress'
  | 'Resolved'
  | 'Closed'
  | 'Escalated';

export type TicketPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export type TicketCategory =
  | 'Technical'
  | 'Billing'
  | 'Refund'
  | 'Print Quality'
  | 'Account'
  | 'General'
  | 'Other';

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
  ticketId: string; // e.g. "TKT-250529-1248"
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
  createdDate: string; // "29 May 2025"
  createdTime: string; // "10:32 AM"
  source: 'Web App' | 'QR Portal' | 'Email' | 'WhatsApp';
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

export interface SupportFilterState {
  searchQuery: string;
  status: string; // 'All' | TicketStatus
  category: string; // 'All' | TicketCategory
  priority: string; // 'All' | TicketPriority
  source: string; // 'All' | string
}

export interface RecentActivityItem {
  id: string;
  ticketId: string;
  action: 'created' | 'assigned' | 'resolved' | 'status_changed' | 'feedback';
  description: string;
  actor: string;
  timestamp: string;
  iconType: 'receipt' | 'user' | 'check' | 'clock' | 'heart';
}

export interface IssueCategoryStat {
  category: string;
  count: number;
  percentage: number;
}
