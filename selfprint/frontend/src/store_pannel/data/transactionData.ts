import {
  TransactionItem,
  FinancialSummary,
  DailyIncomePoint,
  PaymentBreakdownItem
} from '../types/transaction.types';

export const initialFinancialSummary: FinancialSummary = {
  totalTransactions: 0,
  totalTransactionsChangePercent: 0,
  totalRevenue: 0.0,
  totalRevenueChangePercent: 0,
  cashReceived: 0.0,
  upiReceived: 0.0,
  cardReceived: 0,
  avgOrderValue: 0.0,
  refundsTotal: 0.0,
  pendingPaymentsTotal: 0.0,
  period: 'Today'
};

export const initialDailyIncomePoints: DailyIncomePoint[] = [];

export const initialPaymentBreakdown: PaymentBreakdownItem[] = [];

export const initialTransactions: TransactionItem[] = [];
