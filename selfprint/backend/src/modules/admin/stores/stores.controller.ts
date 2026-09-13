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
}

export const adminStoresController = new AdminStoresController();
export default adminStoresController;
