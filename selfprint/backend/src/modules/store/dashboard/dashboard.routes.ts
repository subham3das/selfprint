import { Router } from 'express';
import { dashboardController } from './dashboard.controller';
import { authenticate } from '../../../middlewares/auth.middleware';

const dashboardRouter = Router();

// Protect all store dashboard routes with JWT authentication
dashboardRouter.use(authenticate);

/**
 * @route   GET /api/v1/store/dashboard
 * @desc    Full dashboard overview payload (Stats, Printer, Store, Summary, Activities, Alerts)
 * @access  Store Owner / Operator (Authenticated)
 */
dashboardRouter.get('/', dashboardController.getDashboardOverview);

/**
 * @route   GET /api/v1/store/dashboard/queue
 * @desc    Paginated and filtered recent print queue
 * @access  Store Owner / Operator (Authenticated)
 */
dashboardRouter.get('/queue', dashboardController.getRecentQueue);

/**
 * @route   GET /api/v1/store/dashboard/activity
 * @desc    Today's activity list
 * @access  Store Owner / Operator (Authenticated)
 */
dashboardRouter.get('/activity', dashboardController.getTodayActivity);

/**
 * @route   GET /api/v1/store/dashboard/stock-alerts
 * @desc    Paper, toner, and ink stock supply alerts
 * @access  Store Owner / Operator (Authenticated)
 */
dashboardRouter.get('/stock-alerts', dashboardController.getStockAlerts);

/**
 * @route   GET /api/v1/store/dashboard/summary
 * @desc    Today's donut chart status breakdown
 * @access  Store Owner / Operator (Authenticated)
 */
dashboardRouter.get('/summary', dashboardController.getTodaySummary);

/**
 * @route   GET /api/v1/store/dashboard/notifications
 * @desc    Notifications list & unread count
 * @access  Store Owner / Operator (Authenticated)
 */
dashboardRouter.get('/notifications', dashboardController.getNotifications);

export default dashboardRouter;
