import { Router } from 'express';
import { adminRevenueController } from './revenue.controller';
import { authenticate } from '../../../middlewares/auth.middleware';
import { authorize } from '../../../middlewares/permission.middleware';

const adminRevenueRouter = Router();

/**
 * @route   GET /api/v1/admin/revenue/overview
 * @desc    Fetch complete revenue analytics in one parallel aggregation request
 */
adminRevenueRouter.get(
  '/overview',
  authenticate,
  authorize('revenue', 'view'),
  adminRevenueController.getOverview
);

/**
 * @route   GET /api/v1/admin/revenue/stats
 * @desc    Fetch 6 revenue KPI cards with growth trends
 */
adminRevenueRouter.get(
  '/stats',
  authenticate,
  authorize('revenue', 'view'),
  adminRevenueController.getStats
);

/**
 * @route   GET /api/v1/admin/revenue/chart
 * @desc    Fetch time-series revenue curve points (daily/weekly/monthly/yearly)
 */
adminRevenueRouter.get(
  '/chart',
  authenticate,
  authorize('revenue', 'view'),
  adminRevenueController.getChart
);

/**
 * @route   GET /api/v1/admin/revenue/filters
 * @desc    Fetch dynamic stores, cities, and gateway options
 */
adminRevenueRouter.get(
  '/filters',
  authenticate,
  authorize('revenue', 'view'),
  adminRevenueController.getFilters
);

/**
 * @route   GET /api/v1/admin/revenue
 * @desc    Default to unified overview
 */
adminRevenueRouter.get(
  '/',
  authenticate,
  authorize('revenue', 'view'),
  adminRevenueController.getOverview
);

export default adminRevenueRouter;
export { adminRevenueRouter };
