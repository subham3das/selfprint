import { Router } from 'express';
import { adminDashboardController } from './dashboard.controller';
import { authenticate } from '../../../middlewares/auth.middleware';
import { authorize } from '../../../middlewares/permission.middleware';

const adminDashboardRouter = Router();

adminDashboardRouter.get(
  '/overview',
  authenticate,
  authorize('dashboard', 'view'),
  adminDashboardController.getOverview
);
adminDashboardRouter.get(
  '/stats',
  authenticate,
  authorize('dashboard', 'view'),
  adminDashboardController.getStats
);
adminDashboardRouter.get(
  '/revenue',
  authenticate,
  authorize('dashboard', 'view'),
  adminDashboardController.getRevenue
);
adminDashboardRouter.get(
  '/activity',
  authenticate,
  authorize('dashboard', 'view'),
  adminDashboardController.getActivities
);
adminDashboardRouter.get(
  '/top-stores',
  authenticate,
  authorize('dashboard', 'view'),
  adminDashboardController.getTopStores
);
adminDashboardRouter.get(
  '/transactions',
  authenticate,
  authorize('dashboard', 'view'),
  adminDashboardController.getTransactions
);
adminDashboardRouter.get(
  '/analytics',
  authenticate,
  authorize('dashboard', 'view'),
  adminDashboardController.getAnalytics
);
adminDashboardRouter.get(
  '/alerts',
  authenticate,
  authorize('dashboard', 'view'),
  adminDashboardController.getAlerts
);
adminDashboardRouter.get(
  '/users',
  authenticate,
  authorize('dashboard', 'view'),
  adminDashboardController.getRecentUsers
);
adminDashboardRouter.get(
  '/search',
  authenticate,
  authorize('dashboard', 'view'),
  adminDashboardController.search
);
adminDashboardRouter.get(
  '/',
  authenticate,
  authorize('dashboard', 'view'),
  adminDashboardController.getOverview
);

export default adminDashboardRouter;
export { adminDashboardRouter };
