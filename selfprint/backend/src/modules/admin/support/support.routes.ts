import { Router } from 'express';
import { adminSupportController } from './support.controller';
import { authenticate } from '../../../middlewares/auth.middleware';
import { authorize } from '../../../middlewares/permission.middleware';

const adminSupportRouter = Router();

/**
 * Dashboard & Aggregations
 */
adminSupportRouter.get(
  '/dashboard',
  authenticate,
  authorize('support', 'view'),
  adminSupportController.getDashboardOverview
);
adminSupportRouter.get(
  '/stats',
  authenticate,
  authorize('support', 'view'),
  adminSupportController.getStats
);
adminSupportRouter.get(
  '/filters',
  authenticate,
  authorize('support', 'view'),
  adminSupportController.getFilters
);

/**
 * Tickets List (supports both / and /tickets)
 */
adminSupportRouter.get(
  '/',
  authenticate,
  authorize('support', 'view'),
  adminSupportController.getTickets
);
adminSupportRouter.get(
  '/tickets',
  authenticate,
  authorize('support', 'view'),
  adminSupportController.getTickets
);
adminSupportRouter.post(
  '/',
  authenticate,
  authorize('support', 'create'),
  adminSupportController.createTicket
);
adminSupportRouter.post(
  '/tickets',
  authenticate,
  authorize('support', 'create'),
  adminSupportController.createTicket
);

/**
 * Individual Ticket Operations (supports both /:id and /tickets/:id)
 */
adminSupportRouter.get(
  '/tickets/:id',
  authenticate,
  authorize('support', 'view'),
  adminSupportController.getTicketById
);
adminSupportRouter.get(
  '/:id',
  authenticate,
  authorize('support', 'view'),
  adminSupportController.getTicketById
);

adminSupportRouter.put(
  '/tickets/:id',
  authenticate,
  authorize('support', 'edit'),
  adminSupportController.updateTicket
);
adminSupportRouter.put(
  '/:id',
  authenticate,
  authorize('support', 'edit'),
  adminSupportController.updateTicket
);

adminSupportRouter.patch(
  '/tickets/:id/status',
  authenticate,
  authorize('support', 'edit'),
  adminSupportController.updateStatus
);
adminSupportRouter.patch(
  '/:id/status',
  authenticate,
  authorize('support', 'edit'),
  adminSupportController.updateStatus
);

adminSupportRouter.post(
  '/tickets/:id/assign',
  authenticate,
  authorize('support', 'manage'),
  adminSupportController.assignTicket
);
adminSupportRouter.patch(
  '/tickets/:id/assign',
  authenticate,
  authorize('support', 'manage'),
  adminSupportController.assignTicket
);
adminSupportRouter.patch(
  '/:id/assign',
  authenticate,
  authorize('support', 'manage'),
  adminSupportController.assignTicket
);

adminSupportRouter.post(
  '/tickets/:id/reply',
  authenticate,
  authorize('support', 'manage'),
  adminSupportController.replyTicket
);
adminSupportRouter.post(
  '/:id/reply',
  authenticate,
  authorize('support', 'manage'),
  adminSupportController.replyTicket
);

adminSupportRouter.post(
  '/tickets/:id/internal-note',
  authenticate,
  authorize('support', 'manage'),
  adminSupportController.addInternalNote
);
adminSupportRouter.post(
  '/:id/internal-note',
  authenticate,
  authorize('support', 'manage'),
  adminSupportController.addInternalNote
);

adminSupportRouter.post(
  '/tickets/:id/resolve',
  authenticate,
  authorize('support', 'manage'),
  adminSupportController.resolveTicket
);
adminSupportRouter.post(
  '/:id/resolve',
  authenticate,
  authorize('support', 'manage'),
  adminSupportController.resolveTicket
);

adminSupportRouter.delete(
  '/tickets/:id',
  authenticate,
  authorize('support', 'delete'),
  adminSupportController.deleteTicket
);
adminSupportRouter.delete(
  '/:id',
  authenticate,
  authorize('support', 'delete'),
  adminSupportController.deleteTicket
);

export default adminSupportRouter;
export { adminSupportRouter };
