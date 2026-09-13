import { Router } from 'express';
import { adminStoresController } from './stores.controller';
import { authenticate } from '../../../middlewares/auth.middleware';
import { authorize } from '../../../middlewares/permission.middleware';

const adminStoresRouter = Router();

/**
 * @route   GET /api/v1/admin/stores/stats
 * @desc    KPI Dashboard aggregated metrics (Total, Active, Offline, Pending, Suspended, Blocked, Deleted, Cities)
 */
adminStoresRouter.get(
  '/stats',
  authenticate,
  authorize('stores', 'view'),
  adminStoresController.getStoreStats
);

/**
 * @route   GET /api/v1/admin/stores
 * @desc    Paginated, searchable, filterable store list
 */
adminStoresRouter.get(
  '/',
  authenticate,
  authorize('stores', 'view'),
  adminStoresController.getStores
);

/**
 * @route   GET /api/v1/admin/stores/:id
 * @desc    Single store detailed view (profile, settings, printer, QR, revenue)
 */
adminStoresRouter.get(
  '/:id',
  authenticate,
  authorize('stores', 'view'),
  adminStoresController.getStoreById
);

/**
 * @route   POST /api/v1/admin/stores
 * @desc    Create new store with automatic settings and QR initialization
 */
adminStoresRouter.post(
  '/',
  authenticate,
  authorize('stores', 'create'),
  adminStoresController.createStore
);

/**
 * @route   PATCH /api/v1/admin/stores/:id
 * @desc    Update store profile / configurations
 */
adminStoresRouter.patch(
  '/:id',
  authenticate,
  authorize('stores', 'edit'),
  adminStoresController.updateStore
);

/**
 * @route   PATCH /api/v1/admin/stores/:id/status
 * @desc    Toggle / update store operational status (Approve / Suspend)
 */
adminStoresRouter.patch(
  '/:id/status',
  authenticate,
  authorize('stores', 'approve'),
  adminStoresController.updateStoreStatus
);

/**
 * @route   POST /api/v1/admin/stores/:id/block
 * @desc    Block store from platform, invalidating active tokens and sockets
 */
adminStoresRouter.post(
  '/:id/block',
  authenticate,
  authorize('stores', 'edit'),
  adminStoresController.blockStore
);

/**
 * @route   POST /api/v1/admin/stores/:id/unblock
 * @desc    Unblock store to restore full operational access
 */
adminStoresRouter.post(
  '/:id/unblock',
  authenticate,
  authorize('stores', 'edit'),
  adminStoresController.unblockStore
);

/**
 * @route   DELETE /api/v1/admin/stores/:id
 * @desc    Permanent delete store with cascading cleanup & audit preservation
 */
adminStoresRouter.delete(
  '/:id',
  authenticate,
  authorize('stores', 'delete'),
  adminStoresController.deleteStore
);

export default adminStoresRouter;
export { adminStoresRouter };
