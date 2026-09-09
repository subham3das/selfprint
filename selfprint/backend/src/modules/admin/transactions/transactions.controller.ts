import { Request, Response, NextFunction } from 'express';
import { BaseController } from '../../../controllers/BaseController';
import { ApiResponse } from '../../../responses/ApiResponse';
import { HTTP_STATUS } from '../../../constants/httpStatusCodes';
import { adminTransactionsService, AdminTransactionsService } from './transactions.service';

export class AdminTransactionsController extends BaseController {
  private service: AdminTransactionsService;

  constructor(service: AdminTransactionsService = adminTransactionsService) {
    super();
    this.service = service;
  }

  public getStats = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = await this.service.getStats();
      this.sendSuccess(res, 'Transaction statistics fetched successfully', stats);
    } catch (error) {
      next(error);
    }
  };

  public getTransactions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page, limit, search, status, store, paymentMethod, startDate, endDate } = req.query;
      const result = await this.service.getTransactions({
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        search: search as string,
        status: status as string,
        store: store as string,
        paymentMethod: paymentMethod as string,
        startDate: startDate as string,
        endDate: endDate as string
      });

      this.sendSuccess(res, 'Transactions fetched successfully', result);
    } catch (error) {
      next(error);
    }
  };

  public getTransactionById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const transaction = await this.service.getTransactionById(id);
      if (!transaction) {
        ApiResponse.error(res, 'Transaction not found', HTTP_STATUS.NOT_FOUND);
        return;
      }
      this.sendSuccess(res, 'Transaction details fetched successfully', transaction);
    } catch (error) {
      next(error);
    }
  };

  public refundTransaction = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const updated = await this.service.refundTransaction(id, req.body);
      if (!updated) {
        ApiResponse.error(res, 'Transaction not found for refund', HTTP_STATUS.NOT_FOUND);
        return;
      }
      this.sendSuccess(res, 'Transaction refund processed successfully', updated);
    } catch (error) {
      next(error);
    }
  };

  public getUniqueStores = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stores = await this.service.getUniqueStores();
      this.sendSuccess(res, 'Stores fetched successfully', stores);
    } catch (error) {
      next(error);
    }
  };
}

export const adminTransactionsController = new AdminTransactionsController();
export default adminTransactionsController;
