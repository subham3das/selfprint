import { Request, Response, NextFunction } from 'express';
import { BaseController } from '../../../controllers/BaseController';
import { historyService, HistoryService } from './history.service';
import {
  transactionListQuerySchema,
  financialSummaryQuerySchema,
  incomeChartQuerySchema,
  paymentBreakdownQuerySchema,
  exportTransactionsQuerySchema
} from './history.validation';
import { AuthenticatedRequest } from '../../../middlewares/auth.middleware';

export class HistoryController extends BaseController {
  private service: HistoryService;

  constructor(service: HistoryService = historyService) {
    super();
    this.service = service;
  }

  private getStoreId(req: Request): string | undefined {
    const user = (req as AuthenticatedRequest).user;
    return user?.storeId || user?.id || (req.query.storeId as string);
  }

  /**
   * GET /api/v1/store/history/transactions
   * Paginated and filtered transaction history
   */
  public getTransactions = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const validated = transactionListQuerySchema.parse(req.query);
      const storeId = this.getStoreId(req) || validated.storeId;
      const data = await this.service.getTransactions(storeId, validated);
      this.sendSuccess(res, 'Transactions retrieved successfully', data);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/store/history/summary
   * Total revenue, cash, UPI, card, and refunds metrics
   */
  public getFinancialSummary = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const validated = financialSummaryQuerySchema.parse(req.query);
      const storeId = this.getStoreId(req) || validated.storeId;
      const data = await this.service.getFinancialSummary(storeId, validated.dateRange);
      this.sendSuccess(res, 'Financial summary retrieved successfully', data);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/store/history/income-chart
   * Aggregated income graph points
   */
  public getIncomeChart = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const validated = incomeChartQuerySchema.parse(req.query);
      const storeId = this.getStoreId(req) || validated.storeId;
      const data = await this.service.getIncomeChart(storeId, validated.period);
      this.sendSuccess(res, 'Income chart data retrieved successfully', { points: data });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/store/history/payment-breakdown
   * Payment methods breakdown percentage
   */
  public getPaymentBreakdown = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const validated = paymentBreakdownQuerySchema.parse(req.query);
      const storeId = this.getStoreId(req) || validated.storeId;
      const data = await this.service.getPaymentBreakdown(storeId, validated.dateRange);
      this.sendSuccess(res, 'Payment breakdown retrieved successfully', { breakdown: data });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/store/history/export
   * Export transactions as CSV
   */
  public exportTransactions = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const validated = exportTransactionsQuerySchema.parse(req.query);
      const storeId = this.getStoreId(req) || validated.storeId;
      const csvData = await this.service.exportTransactionsCsv(storeId, validated);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="transactions_${Date.now()}.csv"`);
      res.status(200).send(csvData);
    } catch (error) {
      next(error);
    }
  };
}

export const historyController = new HistoryController();
export default historyController;
