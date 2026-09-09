import { Router } from 'express';
import { adminTransactionsController } from './transactions.controller';
import { authenticate } from '../../../middlewares/auth.middleware';
import { authorize } from '../../../middlewares/permission.middleware';

const adminTransactionsRouter = Router();

/**
 * @route   GET /api/v1/admin/transactions/stats
 * @desc    Fetch aggregated transaction statistics
 */
adminTransactionsRouter.get(
  '/stats',
  authenticate,
  authorize('transactions', 'view'),
  adminTransactionsController.getStats
);

/**
 * @route   GET /api/v1/admin/transactions/stores
 * @desc    Fetch unique store names for filtering
 */
adminTransactionsRouter.get(
  '/stores',
  authenticate,
  authorize('transactions', 'view'),
  adminTransactionsController.getUniqueStores
);

/**
 * @route   GET /api/v1/admin/transactions/:id
 * @desc    Fetch single transaction by ID
 */
adminTransactionsRouter.get(
  '/:id',
  authenticate,
  authorize('transactions', 'view'),
  adminTransactionsController.getTransactionById
);

/**
 * @route   POST /api/v1/admin/transactions/:id/refund
 * @desc    Process refund on a transaction
 */
adminTransactionsRouter.post(
  '/:id/refund',
  authenticate,
  authorize('transactions', 'manage'),
  adminTransactionsController.refundTransaction
);

/**
 * @route   GET /api/v1/admin/transactions
 * @desc    Fetch paginated and filtered transactions
 */
adminTransactionsRouter.get(
  '/',
  authenticate,
  authorize('transactions', 'view'),
  adminTransactionsController.getTransactions
);

export default adminTransactionsRouter;
export { adminTransactionsRouter };
