import { TicketCategory, TicketPriority, TicketStatus } from '../../../models/ticket.model';

export interface SupportChatMessageDTO {
  id: string;
  sender: 'customer' | 'admin';
  senderName: string;
  senderAvatar?: string;
  message: string;
  timestamp: string;
  attachments?: string[];
}

export interface AdminSupportTicketItemDTO {
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
  source: 'Web App' | 'QR Portal' | 'Email' | 'WhatsApp';
  messages: SupportChatMessageDTO[];
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

export interface SupportStatsResponse {
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

export interface RecentActivityItemDTO {
  id: string;
  ticketId: string;
  action: 'created' | 'assigned' | 'resolved' | 'status_changed' | 'feedback' | 'replied';
  description: string;
  actor: string;
  timestamp: string;
  iconType: 'receipt' | 'user' | 'check' | 'clock' | 'heart';
}

export interface IssueCategoryStatDTO {
  category: string;
  count: number;
  percentage: number;
}

export interface SupportDashboardOverviewResponse {
  stats: SupportStatsResponse;
  supportOverviewSegments: SupportOverviewSegment[];
  recentActivities: RecentActivityItemDTO[];
  issueCategories: IssueCategoryStatDTO[];
}

export interface SupportFilterOptions {
  statuses: string[];
  categories: string[];
  priorities: string[];
  sources: string[];
  stores: string[];
  staff: string[];
}

export interface SupportTicketsListResponse {
  tickets: AdminSupportTicketItemDTO[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface GetSupportTicketsQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  category?: string;
  priority?: string;
  source?: string;
  store?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateTicketInput {
  subject: string;
  description?: string;
  category: TicketCategory;
  priority: TicketPriority;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  storeId?: string;
  source?: 'Web App' | 'QR Portal' | 'Email' | 'WhatsApp';
}

export interface UpdateTicketInput {
  subject?: string;
  description?: string;
  category?: TicketCategory;
  priority?: TicketPriority;
  status?: TicketStatus;
}

export interface ReplyTicketInput {
  message: string;
  senderName?: string;
  senderAvatar?: string;
  attachments?: string[];
}

export interface AssignTicketInput {
  assignedAdminName: string;
  assignedAdminAvatar?: string;
  assignedAdminId?: string;
}

export interface ResolveTicketInput {
  resolution?: string;
  resolvedBy?: string;
}
