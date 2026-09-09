import { z } from 'zod';

export const transactionListQuerySchema = z.object({
  storeId: z.string().optional(),
  search: z.string().optional(),
  dateRange: z.enum(['today', 'yesterday', 'last_7_days', 'last_30_days', 'this_month', 'all']).default('today'),
  paymentStatus: z.string().optional(),
  paymentMethod: z.string().optional(),
  colorMode: z.string().optional(),
  paperSize: z.string().optional(),
  sortBy: z.enum(['newest', 'oldest', 'amount_high', 'amount_low', 'pages_high', 'pages_low']).default('newest'),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10)
});

export const financialSummaryQuerySchema = z.object({
  storeId: z.string().optional(),
  dateRange: z.enum(['today', 'yesterday', 'last_7_days', 'last_30_days', 'this_month', 'all']).default('today')
});

export const incomeChartQuerySchema = z.object({
  storeId: z.string().optional(),
  period: z.enum(['Last 7 Days', 'Last 30 Days', 'This Month', 'This Year', 'Daily', 'Weekly', 'Monthly', 'Yearly']).default('Last 7 Days')
});

export const paymentBreakdownQuerySchema = z.object({
  storeId: z.string().optional(),
  dateRange: z.enum(['today', 'yesterday', 'last_7_days', 'last_30_days', 'this_month', 'all']).default('today')
});

export const exportTransactionsQuerySchema = z.object({
  storeId: z.string().optional(),
  format: z.enum(['csv', 'excel', 'pdf']).default('csv'),
  dateRange: z.enum(['today', 'yesterday', 'last_7_days', 'last_30_days', 'this_month', 'all']).default('today'),
  search: z.string().optional(),
  paymentStatus: z.string().optional(),
  paymentMethod: z.string().optional()
});

export type TransactionListQueryInput = z.infer<typeof transactionListQuerySchema>;
export type FinancialSummaryQueryInput = z.infer<typeof financialSummaryQuerySchema>;
export type IncomeChartQueryInput = z.infer<typeof incomeChartQuerySchema>;
export type PaymentBreakdownQueryInput = z.infer<typeof paymentBreakdownQuerySchema>;
export type ExportTransactionsQueryInput = z.infer<typeof exportTransactionsQuerySchema>;
