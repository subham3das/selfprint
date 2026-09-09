export interface TransactionPrintDetailsDto {
  fileName: string;
  totalPages: number;
  colorPages: number;
  bwPages: number;
  copies: number;
  paperSize: 'A4' | 'A3' | 'Letter' | 'Legal';
  printerUsed: string;
}

export interface TransactionTimelineStepDto {
  label: string;
  time: string;
  completed: boolean;
}

export interface AdminTransactionItemDto {
  id: string;
  txnId: string;
  paymentId: string;
  storeName: string;
  storeLogoBg: string;
  storeLogoText: string;
  city: string;
  state: string;
  customerName: string;
  customerEmail: string;
  customerAvatar: string;
  orderType: 'Color Print' | 'B&W Print';
  pages: number;
  amountRaw: number;
  amountFormatted: string;
  commissionRaw: number;
  commissionFormatted: string;
  paymentMethod: string;
  status: 'Success' | 'Pending' | 'Failed' | 'Refunded' | 'Cancelled';
  date: string;
  time: string;
  timestamp: string;
  printDetails?: TransactionPrintDetailsDto;
  timeline?: TransactionTimelineStepDto[];
}

export interface TransactionStatsDto {
  totalTransactions: number;
  totalTransactionsTrend: string;
  successfulTransactions: number;
  successfulTransactionsTrend: string;
  pendingTransactions: number;
  pendingTransactionsTrend: string;
  failedTransactions: number;
  failedTransactionsTrend: string;
  totalAmountRaw: number;
  totalAmountFormatted: string;
  totalAmountTrend: string;
  totalCommissionRaw: number;
  totalCommissionFormatted: string;
  totalCommissionTrend: string;
}

export interface GetTransactionsQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  store?: string;
  paymentMethod?: string;
  startDate?: string;
  endDate?: string;
}

export interface RefundTransactionDto {
  transactionId: string;
  refundAmount?: number;
  reason?: string;
  refundMethod?: string;
}
