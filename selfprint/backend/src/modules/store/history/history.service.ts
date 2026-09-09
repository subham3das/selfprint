import mongoose from 'mongoose';
import { historyRepository, HistoryRepository } from './history.repository';
import { IPrintJob } from '../../../models/printJob.model';
import {
  TransactionDto,
  FinancialSummaryDto,
  DailyIncomePointDto,
  PaymentBreakdownItemDto
} from './history.types';

export class HistoryService {
  private repository: HistoryRepository;

  constructor(repository: HistoryRepository = historyRepository) {
    this.repository = repository;
  }

  private mapJobToTransactionDto(job: IPrintJob, storeName: string): TransactionDto {
    const createdAt = new Date(job.createdAt || Date.now());
    const dateFormatted = createdAt.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
    const timeFormatted = createdAt.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    const isPaid =
      job.paymentStatus === 'Paid' ||
      job.paymentStatus === 'PAID';

    return {
      id: String(job._id),
      transactionId: `TXN-${job.jobNumber.replace(/[^0-9]/g, '') || String(job._id).slice(-5)}`,
      jobId: job.jobNumber,
      customerName: job.customerName || 'Guest',
      customerPhone: (job as any).customerPhone || '—',
      fileName: job.fileName,
      pages: job.totalPages,
      copies: job.copies,
      paperSize: job.paperSize,
      colorMode: job.printType === 'COLOR' || job.printType === 'Color' ? 'Color' : 'B&W',
      pricePerPage: Number((job.price / Math.max(1, job.totalPages * job.copies)).toFixed(2)),
      subtotal: job.price,
      tax: 0,
      discount: 0,
      amount: job.price,
      paymentMethod: 'UPI',
      paymentProvider: 'UPI Gateway',
      paymentStatus: isPaid ? 'Completed' : (job.paymentStatus as any) || 'Pending',
      printStatus: (job.status as any) || 'Completed',
      transactionDate: dateFormatted,
      transactionTime: timeFormatted,
      timestamp: createdAt.toISOString(),
      storeName,
      operator: 'SelfPrint Kiosk'
    };
  }

  public async getTransactions(
    storeIdParam?: string,
    options: {
      search?: string;
      dateRange?: string;
      paymentStatus?: string;
      paymentMethod?: string;
      colorMode?: string;
      paperSize?: string;
      sortBy?: string;
      page?: number;
      limit?: number;
    } = {}
  ): Promise<{
    transactions: TransactionDto[];
    total: number;
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }> {
    const store = await this.repository.getStore(storeIdParam);
    if (!store) {
      return {
        transactions: [],
        total: 0,
        pagination: { page: 1, limit: options.limit || 10, total: 0, totalPages: 1 }
      };
    }

    const result = await this.repository.getTransactions(store._id, options);
    const transactions = result.jobs.map((j) => this.mapJobToTransactionDto(j, store.name));

    return {
      transactions,
      total: result.total,
      pagination: {
        page: options.page || 1,
        limit: options.limit || 10,
        total: result.total,
        totalPages: Math.ceil(result.total / (options.limit || 10)) || 1
      }
    };
  }

  public async getFinancialSummary(
    storeIdParam?: string,
    dateRange?: string
  ): Promise<FinancialSummaryDto> {
    const store = await this.repository.getStore(storeIdParam);
    if (!store) {
      return {
        totalTransactions: 0,
        totalTransactionsChangePercent: 0,
        totalRevenue: 0,
        totalRevenueChangePercent: 0,
        cashReceived: 0,
        upiReceived: 0,
        cardReceived: 0,
        avgOrderValue: 0,
        refundsTotal: 0,
        pendingPaymentsTotal: 0,
        period: 'Today'
      };
    }

    return this.repository.getFinancialSummary(store._id, dateRange);
  }

  public async getIncomeChart(
    storeIdParam?: string,
    period = 'Last 7 Days'
  ): Promise<DailyIncomePointDto[]> {
    const store = await this.repository.getStore(storeIdParam);
    if (!store) {
      return [];
    }

    return this.repository.getIncomeChartData(store._id, period);
  }

  public async getPaymentBreakdown(
    storeIdParam?: string,
    dateRange?: string
  ): Promise<PaymentBreakdownItemDto[]> {
    const store = await this.repository.getStore(storeIdParam);
    if (!store) {
      return [];
    }

    return this.repository.getPaymentBreakdown(store._id, dateRange);
  }

  public async exportTransactionsCsv(
    storeIdParam?: string,
    options: {
      search?: string;
      dateRange?: string;
      paymentStatus?: string;
      paymentMethod?: string;
    } = {}
  ): Promise<string> {
    const store = await this.repository.getStore(storeIdParam);
    if (!store) return 'Transaction ID,Date,Customer,Pages,Copies,Print Type,Amount,Status\n';

    const result = await this.repository.getTransactions(store._id, { ...options, limit: 10000 });
    const rows = result.jobs.map((j) => {
      const txn = this.mapJobToTransactionDto(j, store.name);
      return [
        `"${txn.transactionId}"`,
        `"${txn.transactionDate} ${txn.transactionTime}"`,
        `"${txn.customerName}"`,
        txn.pages,
        txn.copies,
        `"${txn.colorMode}"`,
        `"₹${txn.amount.toFixed(2)}"`,
        `"${txn.paymentStatus}"`
      ].join(',');
    });

    return ['Transaction ID,Date,Customer,Pages,Copies,Print Type,Amount,Status', ...rows].join('\n');
  }
}

export const historyService = new HistoryService();
export default historyService;
