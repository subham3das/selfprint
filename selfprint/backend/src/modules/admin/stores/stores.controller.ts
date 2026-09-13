import { Request, Response, NextFunction } from 'express';
import { BaseController } from '../../../controllers/BaseController';
import { adminStoresService, AdminStoresService } from './stores.service';
import { ApiResponse } from '../../../responses/ApiResponse';
import { HTTP_STATUS } from '../../../constants/httpStatusCodes';

export class AdminStoresController extends BaseController {
  private service: AdminStoresService;

  constructor(service: AdminStoresService = adminStoresService) {
    super();
    this.service = service;
  }

  public getStoreStats = async (
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const stats = await this.service.getStoreStats();
      this.sendSuccess(res, 'Store stats fetched successfully', stats);
    } catch (error) {
      next(error);
    }
  };

  public getStores = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await this.service.getStores(req.query);
      this.sendSuccess(res, 'Stores list fetched successfully', result);
    } catch (error) {
      next(error);
    }
  };

  public getStoreById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const store = await this.service.getStoreById(req.params.id);
      if (!store) {
        ApiResponse.error(res, 'Store not found', HTTP_STATUS.NOT_FOUND);
        return;
      }
      this.sendSuccess(res, 'Store details fetched successfully', store);
    } catch (error) {
      next(error);
    }
  };

  public createStore = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const newStore = await this.service.createStore(req.body);
      this.sendCreated(res, 'Store created successfully', newStore);
    } catch (error) {
      next(error);
    }
  };

  public updateStore = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const updated = await this.service.updateStore(req.params.id, req.body);
      if (!updated) {
        ApiResponse.error(res, 'Store not found', HTTP_STATUS.NOT_FOUND);
        return;
      }
      this.sendSuccess(res, 'Store updated successfully', updated);
    } catch (error) {
      next(error);
    }
  };

  public updateStoreStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { status } = req.body;
      const updated = await this.service.updateStoreStatus(req.params.id, status);
      if (!updated) {
        ApiResponse.error(res, 'Store not found', HTTP_STATUS.NOT_FOUND);
        return;
      }
      this.sendSuccess(res, 'Store status updated successfully', updated);
    } catch (error) {
      next(error);
    }
  };

  public blockStore = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { reason } = req.body;
      const adminUser = (req as any).user;
      const blocked = await this.service.blockStore(req.params.id, reason, adminUser);
      if (!blocked) {
        ApiResponse.error(res, 'Store not found', HTTP_STATUS.NOT_FOUND);
        return;
      }
      this.sendSuccess(res, 'Store blocked successfully', { id: req.params.id, store: blocked });
    } catch (error) {
      next(error);
    }
  };

  public unblockStore = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const adminUser = (req as any).user;
      const unblocked = await this.service.unblockStore(req.params.id, adminUser);
      if (!unblocked) {
        ApiResponse.error(res, 'Store not found', HTTP_STATUS.NOT_FOUND);
        return;
      }
      this.sendSuccess(res, 'Store unblocked successfully', { id: req.params.id, store: unblocked });
    } catch (error) {
      next(error);
    }
  };

  public deleteStore = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const adminUser = (req as any).user;
      const deleted = await this.service.deleteStore(req.params.id, adminUser);
      if (!deleted) {
        ApiResponse.error(res, 'Store not found', HTTP_STATUS.NOT_FOUND);
        return;
      }
      this.sendSuccess(res, 'Store permanently deleted and relations cleaned up successfully', deleted);
    } catch (error) {
      next(error);
    }
  };

  public getStoreBankDetails = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const reveal = req.query.reveal === "true";
      const adminUser = (req as any).user;
      const bankDetails = await this.service.getStoreBankDetails(req.params.id, reveal, adminUser);
      if (!bankDetails) {
        ApiResponse.error(res, "Store not found", HTTP_STATUS.NOT_FOUND);
        return;
      }
      this.sendSuccess(res, "Store bank details fetched successfully", bankDetails);
    } catch (error) {
      next(error);
    }
  };

  public logBankDetailsAccess = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { action } = req.body;
      const adminUser = (req as any).user;
      const logged = await this.service.logBankDetailsAccess(req.params.id, action, adminUser);
      if (!logged) {
        ApiResponse.error(res, "Store not found", HTTP_STATUS.NOT_FOUND);
        return;
      }
      this.sendSuccess(res, "Bank details access logged successfully", logged);
    } catch (error) {
      next(error);
    }
  };

  public getSettlementSummary = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const summary = await this.service.getSettlementSummary(req.params.id);
      if (!summary) {
        ApiResponse.error(res, "Store not found", HTTP_STATUS.NOT_FOUND);
        return;
      }
      this.sendSuccess(res, "Settlement summary fetched successfully", summary);
    } catch (error) {
      next(error);
    }
  };

  public getStoreSettlements = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const settlements = await this.service.getStoreSettlements(req.params.id);
      this.sendSuccess(res, "Store settlements fetched successfully", settlements);
    } catch (error) {
      next(error);
    }
  };

  public createSettlement = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const adminUser = (req as any).user;
      const settlement = await this.service.createSettlement(req.params.id, req.body, adminUser);
      if (!settlement) {
        ApiResponse.error(res, "Store not found", HTTP_STATUS.NOT_FOUND);
        return;
      }
      this.sendCreated(res, "Settlement created and recorded successfully", settlement);
    } catch (error: any) {
      if (error.message && (error.message.includes("greater than zero") || error.message.includes("required"))) {
        ApiResponse.error(res, error.message, HTTP_STATUS.BAD_REQUEST);
        return;
      }
      next(error);
    }
  };
  /**
   * GET /api/v1/admin/stores/:id/settlements/statement
   */
  public getSettlementStatement = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const format = (req.query.format as string) || 'csv';

      const statement = await adminStoresService.generateSettlementStatement(id, format);
      if (!statement) {
        ApiResponse.error(res, 'Store not found', HTTP_STATUS.NOT_FOUND);
        return;
      }

      if (format === 'csv') {
        res.setHeader('Content-Type', statement.contentType || 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${statement.filename}"`);
        res.send(statement.data);
        return;
      }

      this.sendSuccess(res, 'Settlement statement generated', statement);
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT/POST /api/v1/admin/stores/:id/bank-details
   */
  public updateStoreBankDetails = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const { accountHolderName, accountNumber, ifscCode, bankName, branchName, upiId, settlementMethod } = req.body;

      if (!accountHolderName || !accountNumber || !ifscCode || !bankName) {
        ApiResponse.error(res, 'Account holder, account number, IFSC and bank name are required', HTTP_STATUS.BAD_REQUEST);
        return;
      }

      const adminUser = (req as any).user;
      const reqMeta = {
        ip: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1',
        userAgent: req.headers['user-agent'] || 'Browser'
      };

      const updated = await adminStoresService.updateStoreBankDetails(
        id,
        { accountHolderName, accountNumber, ifscCode, bankName, branchName, upiId, settlementMethod },
        adminUser,
        reqMeta
      );

      if (!updated) {
        ApiResponse.error(res, 'Store not found', HTTP_STATUS.NOT_FOUND);
        return;
      }

      this.sendSuccess(res, 'Bank details updated successfully', { bankDetails: updated });
    } catch (error) {
      next(error);
    }
  };

}

export const adminStoresController = new AdminStoresController();
export default adminStoresController;
