export type TransactionPaymentStatus =
  | 'Completed'
  | 'Paid'
  | 'Pending'
  | 'Failed'
  | 'Refunded'
  | 'Cancelled';

export type TransactionPaymentMethod =
  | 'UPI (GPay)'
  | 'UPI (PhonePe)'
  | 'UPI (Paytm)'
  | 'UPI'
  | 'Cash'
  | 'Card'
  | 'Wallet';

export type TransactionPrintStatus = 'Completed' | 'Printing' | 'Waiting' | 'Failed' | 'Cancelled';

export type TransactionColorMode = 'B&W' | 'Color';
export type TransactionPaperSize = 'A4' | 'A3' | 'Letter' | 'Legal';

export type TransactionSortOption =
  | 'newest'
  | 'oldest'
  | 'amount_high'
  | 'amount_low'
  | 'pages_high'
  | 'pages_low';

export type DateRangePreset =
  | 'today'
  | 'yesterday'
  | 'last_7_days'
  | 'last_30_days'
  | 'this_month'
  | 'custom';

export interface TransactionItem {
  id: string;
  transactionId: string; // e.g. "TXN-10048"
  jobId: string; // e.g. "SP-20250812-009"
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  fileName?: string; // Metadata only, e.g. "notes.pdf"
  pages: number;
  copies: number;
  paperSize: TransactionPaperSize;
  colorMode: TransactionColorMode;
  pricePerPage: number;
  subtotal: number;
  tax: number;
  discount: number;
  amount: number; // e.g. 12.00
  paymentMethod: TransactionPaymentMethod;
  paymentProvider?: string; // e.g. "GPay", "PhonePe", "Paytm", "Counter Cash"
  upiReference?: string; // e.g. "UPI/CR/489201938"
  paymentStatus: TransactionPaymentStatus;
  printStatus: TransactionPrintStatus;
  transactionDate: string; // e.g. "24 May 2024"
  transactionTime: string; // e.g. "10:24 AM"
  timestamp: string; // ISO string for sorting/filtering
  storeName: string;
  operator: string;
  notes?: string;
}

export interface FinancialSummary {
  totalTransactions: number;
  totalTransactionsChangePercent: number; // e.g. +12%
  totalRevenue: number;
  totalRevenueChangePercent: number; // e.g. +8%
  cashReceived: number;
  upiReceived: number;
  cardReceived: number;
  avgOrderValue: number;
  refundsTotal: number;
  pendingPaymentsTotal: number;
  period: string; // e.g. "Today"
}

export interface DailyIncomePoint {
  date: string; // e.g. "18 May"
  fullDate: string;
  revenue: number; // e.g. 210
  transactionsCount: number;
}

export interface PaymentBreakdownItem {
  method: string;
  amount: number;
  percentage: number;
  count: number;
  color: string;
}

export interface TransactionFilters {
  searchQuery: string;
  dateRange: DateRangePreset;
  customStartDate?: string;
  customEndDate?: string;
  paymentStatus: 'All' | TransactionPaymentStatus;
  paymentMethod: 'All' | string;
  colorMode: 'All' | TransactionColorMode;
  paperSize: 'All' | TransactionPaperSize;
  sortBy: TransactionSortOption;
}
