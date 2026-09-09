import { Router } from 'express';
import { adminAnalyticsController } from './analytics.controller';
import { authenticate } from '../../../middlewares/auth.middleware';
import { authorize } from '../../../middlewares/permission.middleware';

const adminAnalyticsRouter = Router();

/**
 * Dashboard & Core Analytics
 */
adminAnalyticsRouter.get(
  '/',
  authenticate,
  authorize('analytics', 'view'),
  adminAnalyticsController.getDashboard
);
adminAnalyticsRouter.get(
  '/dashboard',
  authenticate,
  authorize('analytics', 'view'),
  adminAnalyticsController.getDashboard
);
adminAnalyticsRouter.get(
  '/stats',
  authenticate,
  authorize('analytics', 'view'),
  adminAnalyticsController.getStats
);
adminAnalyticsRouter.get(
  '/activity',
  authenticate,
  authorize('analytics', 'view'),
  adminAnalyticsController.getActivity
);
adminAnalyticsRouter.get(
  '/platform-health',
  authenticate,
  authorize('analytics', 'view'),
  adminAnalyticsController.getPlatformHealth
);
adminAnalyticsRouter.get(
  '/heatmap',
  authenticate,
  authorize('analytics', 'view'),
  adminAnalyticsController.getHeatmap
);
adminAnalyticsRouter.get(
  '/hourly-usage',
  authenticate,
  authorize('analytics', 'view'),
  adminAnalyticsController.getHeatmap
);
adminAnalyticsRouter.get(
  '/top-stores',
  authenticate,
  authorize('analytics', 'view'),
  adminAnalyticsController.getTopStores
);
adminAnalyticsRouter.get(
  '/paper-sizes',
  authenticate,
  authorize('analytics', 'view'),
  adminAnalyticsController.getPaperUsage
);
adminAnalyticsRouter.get(
  '/print-types',
  authenticate,
  authorize('analytics', 'view'),
  adminAnalyticsController.getPrintTypes
);
adminAnalyticsRouter.get(
  '/printer-status',
  authenticate,
  authorize('analytics', 'view'),
  adminAnalyticsController.getPrinterStatus
);
adminAnalyticsRouter.get(
  '/recent-events',
  authenticate,
  authorize('analytics', 'view'),
  adminAnalyticsController.getRecentEvents
);
adminAnalyticsRouter.get(
  '/quick-insights',
  authenticate,
  authorize('analytics', 'view'),
  adminAnalyticsController.getQuickInsights
);

export default adminAnalyticsRouter;
export { adminAnalyticsRouter };
