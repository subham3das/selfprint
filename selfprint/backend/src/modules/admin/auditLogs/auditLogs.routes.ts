import { Router } from 'express';
import { adminAuditLogsController } from './auditLogs.controller';
import { authenticate } from '../../../middlewares/auth.middleware';
import { authorize } from '../../../middlewares/permission.middleware';

const adminAuditLogsRouter = Router();

/**
 * Statistics, Visualizations & Feeds
 */
adminAuditLogsRouter.get(
  '/stats',
  authenticate,
  authorize('audit', 'view'),
  adminAuditLogsController.getStats
);
adminAuditLogsRouter.get(
  '/security-summary',
  authenticate,
  authorize('audit', 'view'),
  adminAuditLogsController.getSecuritySummary
);
adminAuditLogsRouter.get(
  '/timeline',
  authenticate,
  authorize('audit', 'view'),
  adminAuditLogsController.getTimeline
);
adminAuditLogsRouter.get(
  '/heatmap',
  authenticate,
  authorize('audit', 'view'),
  adminAuditLogsController.getHeatmap
);
adminAuditLogsRouter.get(
  '/live',
  authenticate,
  authorize('audit', 'view'),
  adminAuditLogsController.getLiveFeed
);
adminAuditLogsRouter.get(
  '/filters',
  authenticate,
  authorize('audit', 'view'),
  adminAuditLogsController.getFilters
);
adminAuditLogsRouter.get(
  '/export',
  authenticate,
  authorize('audit', 'export'),
  adminAuditLogsController.exportLogs
);

/**
 * Table & Single Log
 */
adminAuditLogsRouter.get(
  '/',
  authenticate,
  authorize('audit', 'view'),
  adminAuditLogsController.getLogs
);
adminAuditLogsRouter.get(
  '/:id',
  authenticate,
  authorize('audit', 'view'),
  adminAuditLogsController.getLogById
);

export default adminAuditLogsRouter;
export { adminAuditLogsRouter };
