export type HistoryDateRangePreset =
  | 'today'
  | 'yesterday'
  | 'last_7_days'
  | 'last_30_days'
  | 'this_month'
  | 'all';

export interface TransactionDto {
  id: string;
  transactionId: string;
  jobId: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  fileName: string;
  pages: number;
  copies: number;
  paperSize: string;
  colorMode: 'B&W' | 'Color';
  pricePerPage: number;
  subtotal: number;
  tax: number;
  discount: number;
  amount: number;
  paymentMethod: string;
  paymentProvider?: string;
  upiReference?: string;
  paymentStatus: 'Completed' | 'Paid' | 'Pending' | 'Failed' | 'Refunded' | 'Cancelled';
  printStatus: 'Completed' | 'Printing' | 'Waiting' | 'Failed' | 'Cancelled';
  transactionDate: string;
  transactionTime: string;
  timestamp: string;
  storeName: string;
  printerName?: string;
  operator: string;
  notes?: string;
}

export interface FinancialSummaryDto {
  totalTransactions: number;
  totalTransactionsChangePercent: number;
  totalRevenue: number;
  totalRevenueChangePercent: number;
  cashReceived: number;
  upiReceived: number;
  cardReceived: number;
  avgOrderValue: number;
  refundsTotal: number;
  pendingPaymentsTotal: number;
  period: string;
}

export interface DailyIncomePointDto {
  date: string;
  fullDate: string;
  revenue: number;
  transactionsCount: number;
}

export interface PaymentBreakdownItemDto {
  method: string;
  amount: number;
  percentage: number;
  count: number;
  color: string;
}
