import { Router } from 'express';
import { userController } from './user.controller';
import { authenticate } from '../../../middlewares/auth.middleware';
import { authorize } from '../../../middlewares/permission.middleware';

const adminUsersRouter = Router();

/**
 * @route   GET /api/v1/admin/users/stats
 * @desc    Calculated KPI cards statistics
 */
adminUsersRouter.get(
  '/stats',
  authenticate,
  authorize('users', 'view'),
  userController.getUserStats
);

/**
 * @route   GET /api/v1/admin/users/export
 * @desc    Download filtered users list as CSV
 */
adminUsersRouter.get(
  '/export',
  authenticate,
  authorize('users', 'export'),
  userController.exportUsers
);

/**
 * @route   GET /api/v1/admin/users
 * @desc    Paginated, searchable, filterable list of user accounts
 */
adminUsersRouter.get(
  '/',
  authenticate,
  authorize('users', 'view'),
  userController.getUsers
);

/**
 * @route   GET /api/v1/admin/users/:id
 * @desc    User profile details with recent print orders
 */
adminUsersRouter.get(
  '/:id',
  authenticate,
  authorize('users', 'view'),
  userController.getUserDetails
);

/**
 * @route   PUT /api/v1/admin/users/:id
 * @desc    Update user profile, membership plan, or address
 */
adminUsersRouter.put(
  '/:id',
  authenticate,
  authorize('users', 'edit'),
  userController.updateUser
);

/**
 * @route   PATCH /api/v1/admin/users/:id/status
 * @desc    Toggle / update user account status (Active, Banned, Blocked, etc.)
 */
adminUsersRouter.patch(
  '/:id/status',
  authenticate,
  authorize('users', 'edit'),
  userController.updateUserStatus
);

/**
 * @route   DELETE /api/v1/admin/users/:id
 * @desc    Soft delete user from platform
 */
adminUsersRouter.delete(
  '/:id',
  authenticate,
  authorize('users', 'delete'),
  userController.deleteUser
);

export default adminUsersRouter;
