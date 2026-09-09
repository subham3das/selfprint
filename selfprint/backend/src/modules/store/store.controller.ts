import { Request, Response, NextFunction } from 'express';
import { BaseController } from '../../controllers/BaseController';
import { storeService, StoreService } from './store.service';
import { BadRequestError } from '../../errors';
import { HTTP_STATUS } from '../../constants/httpStatusCodes';

export class StoreController extends BaseController {
  private service: StoreService;

  constructor(service: StoreService = storeService) {
    super();
    this.service = service;
  }

  /**
   * POST /api/v1/store/onboard
   */
  public onboard = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await this.service.onboardStore(req.body);
      this.sendSuccess(res, 'Store partner registered successfully.', result, HTTP_STATUS.CREATED);
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/v1/store/login
   */
  public login = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await this.service.loginStore(req.body);
      this.sendSuccess(res, 'Store logged in successfully.', result, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/store/me
   */
  public getProfile = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const storeId = (req as any).user?.storeId || (req as any).user?.id || (req as any).user?.sub;
      if (!storeId) {
        throw new BadRequestError('Store identification missing from session');
      }
      const store = await this.service.getStoreProfile(storeId);
      this.sendSuccess(res, 'Store profile retrieved successfully.', store, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /api/v1/store/first-login-completed
   */
  public completeFirstLogin = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const storeId = (req as any).user?.storeId || (req as any).user?.id || (req as any).user?.sub;
      if (!storeId) {
        throw new BadRequestError('Store identification missing from session');
      }
      const { printerConfigured = true } = req.body || {};
      await this.service.completeFirstLogin(storeId, printerConfigured);
      this.sendSuccess(res, 'First login state updated.', { isFirstLogin: false, printerConfigured }, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/v1/store/upload-asset
   */
  public uploadAsset = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.file) {
        throw new BadRequestError('Please upload an image file');
      }

      const result = await this.service.uploadStoreAsset(req.file.buffer, req.file.originalname);
      this.sendSuccess(res, 'Store image uploaded successfully to Cloudinary.', result, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  };
}

export const storeController = new StoreController();
export default storeController;
