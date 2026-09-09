export type TransactionStatus =
  | 'Success'
  | 'Pending'
  | 'Failed'
  | 'Refunded'
  | 'Cancelled';

export type PaymentMethod =
  | 'UPI'
  | 'PhonePe'
  | 'Google Pay'
  | 'Paytm'
  | 'Razorpay'
  | 'Cash';

export type OrderPrintType = 'Color Print' | 'B&W Print';

export interface TransactionPrintDetails {
  fileName: string;
  totalPages: number;
  colorPages: number;
  bwPages: number;
  copies: number;
  paperSize: 'A4' | 'A3' | 'Letter';
  printerUsed: string;
}

export interface TransactionTimelineStep {
  label: string;
  time: string;
  completed: boolean;
}

export interface AdminTransactionItem {
  id: string;
  txnId: string; // e.g. "TXN-250529-0012"
  paymentId: string; // e.g. "pay_Oq3W49k2Lq"
  storeName: string;
  storeLogoBg: string;
  storeLogoText: string;
  city: string;
  state: string;
  customerName: string;
  customerEmail: string;
  customerAvatar: string;
  orderType: OrderPrintType;
  pages: number;
  amountRaw: number;
  amountFormatted: string; // e.g. "₹45.00"
  commissionRaw: number;
  commissionFormatted: string; // e.g. "₹4.50"
  paymentMethod: PaymentMethod;
  status: TransactionStatus;
  date: string; // e.g. "29 May 2025"
  time: string; // e.g. "10:32 AM"
  timestamp: string; // ISO string or epoch
  printDetails?: TransactionPrintDetails;
  timeline?: TransactionTimelineStep[];
}

export interface TransactionStatsData {
  totalTransactions: number;
  totalTransactionsTrend: string;
  successfulTransactions: number;
  successfulTransactionsTrend: string;
  pendingTransactions: number;
  pendingTransactionsTrend: string;
  failedTransactions: number;
  failedTransactionsTrend: string;
  totalAmountFormatted: string;
  totalAmountTrend: string;
  totalCommissionFormatted: string;
  totalCommissionTrend: string;
}

export interface TransactionFilterState {
  searchQuery: string;
  status: string; // 'All' | TransactionStatus
  store: string; // 'All' | string
  paymentMethod: string; // 'All' | PaymentMethod
  dateRange: string; // e.g. "01 May 2025 - 29 May 2025" or ""
}

export interface RefundFormValues {
  transactionId: string;
  refundAmount: number;
  reason: string;
  refundMethod: 'Original Payment Method' | 'Instant UPI' | 'Store Credit';
}
