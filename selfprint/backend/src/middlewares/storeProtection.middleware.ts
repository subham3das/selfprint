import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { StoreModel } from '../models/store.model';
import { HTTP_STATUS } from '../constants/httpStatusCodes';

/**
 * Middleware to enforce active store status across all store APIs.
 * Rejects requests with 403 STORE_DELETED or STORE_BLOCKED.
 */
export const requireActiveStore = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = (req as any).user;
    const storeId =
      user?.storeId ||
      req.params.storeId ||
      req.params.id ||
      req.query.storeId ||
      req.headers['x-store-id'];

    // If no store context is associated with this request, proceed to next handler
    if (!storeId || storeId === 'default' || storeId === 'all') {
      return next();
    }

    let store = null;
    if (mongoose.Types.ObjectId.isValid(String(storeId))) {
      store = await StoreModel.findById(storeId).lean();
    } else {
      store = await StoreModel.findOne({ storeCode: String(storeId).toUpperCase() }).lean();
    }

    if (!store || store.isDeleted || store.status === 'DELETED') {
      res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        code: 'STORE_DELETED',
        message: 'This store has been deleted by the administrator.'
      });
      return;
    }

    if (store.blocked || store.status === 'BLOCKED') {
      res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        code: 'STORE_BLOCKED',
        message: 'Your store has been blocked by the administrator. Please contact support.'
      });
      return;
    }

    // Attach verified store to request
    (req as any).activeStore = store;
    next();
  } catch (error) {
    next(error);
  }
};

export default requireActiveStore;
