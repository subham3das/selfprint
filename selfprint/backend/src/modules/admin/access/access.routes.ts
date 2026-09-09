import { Router } from 'express';
import { adminAccessController } from './access.controller';
import { authenticate } from '../../../middlewares/auth.middleware';
import { authorize } from '../../../middlewares/permission.middleware';

const adminAccessRouter = Router();

/**
 * Access Statistics & Filters
 */
adminAccessRouter.get(
  '/stats',
  authenticate,
  authorize('access', 'view'),
  adminAccessController.getStats
);
adminAccessRouter.get(
  '/filters',
  authenticate,
  authorize('access', 'view'),
  adminAccessController.getFilters
);
adminAccessRouter.get(
  '/audit',
  authenticate,
  authorize('access', 'view'),
  adminAccessController.getAuditLogs
);
adminAccessRouter.get(
  '/audit-logs',
  authenticate,
  authorize('access', 'view'),
  adminAccessController.getAuditLogs
);

/**
 * Staff List & Operations
 */
adminAccessRouter.get(
  '/',
  authenticate,
  authorize('access', 'view'),
  adminAccessController.getStaffList
);
adminAccessRouter.get(
  '/staff',
  authenticate,
  authorize('access', 'view'),
  adminAccessController.getStaffList
);
adminAccessRouter.post(
  '/',
  authenticate,
  authorize('access', 'create'),
  adminAccessController.inviteStaff
);
adminAccessRouter.post(
  '/staff',
  authenticate,
  authorize('access', 'create'),
  adminAccessController.inviteStaff
);
adminAccessRouter.post(
  '/invite',
  authenticate,
  authorize('access', 'create'),
  adminAccessController.inviteStaff
);

adminAccessRouter.get(
  '/:id',
  authenticate,
  authorize('access', 'view'),
  adminAccessController.getStaffById
);
adminAccessRouter.get(
  '/staff/:id',
  authenticate,
  authorize('access', 'view'),
  adminAccessController.getStaffById
);

adminAccessRouter.put(
  '/:id',
  authenticate,
  authorize('access', 'edit'),
  adminAccessController.updateStaff
);
adminAccessRouter.put(
  '/staff/:id',
  authenticate,
  authorize('access', 'edit'),
  adminAccessController.updateStaff
);

adminAccessRouter.patch(
  '/:id/status',
  authenticate,
  authorize('access', 'edit'),
  adminAccessController.toggleStatus
);
adminAccessRouter.patch(
  '/staff/:id/status',
  authenticate,
  authorize('access', 'edit'),
  adminAccessController.toggleStatus
);

adminAccessRouter.post(
  '/:id/reset-password',
  authenticate,
  authorize('access', 'edit'),
  adminAccessController.resetPassword
);
adminAccessRouter.post(
  '/staff/:id/reset-password',
  authenticate,
  authorize('access', 'edit'),
  adminAccessController.resetPassword
);

adminAccessRouter.post(
  '/:id/resend-invite',
  authenticate,
  authorize('access', 'create'),
  adminAccessController.resendInvitation
);
adminAccessRouter.post(
  '/staff/:id/resend',
  authenticate,
  authorize('access', 'create'),
  adminAccessController.resendInvitation
);

adminAccessRouter.delete(
  '/:id/cancel-invite',
  authenticate,
  authorize('access', 'delete'),
  adminAccessController.cancelInvitation
);
adminAccessRouter.delete(
  '/staff/:id/cancel',
  authenticate,
  authorize('access', 'delete'),
  adminAccessController.cancelInvitation
);

adminAccessRouter.delete(
  '/:id',
  authenticate,
  authorize('access', 'delete'),
  adminAccessController.deleteStaff
);
adminAccessRouter.delete(
  '/staff/:id',
  authenticate,
  authorize('access', 'delete'),
  adminAccessController.deleteStaff
);


export default adminAccessRouter;
export { adminAccessRouter };
