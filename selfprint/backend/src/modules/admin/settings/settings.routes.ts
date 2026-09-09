import { Router } from 'express';
import { adminSettingsController } from './settings.controller';
import { authenticate } from '../../../middlewares/auth.middleware';
import { authorize } from '../../../middlewares/permission.middleware';

const adminSettingsRouter = Router();

// Retrieve Settings
adminSettingsRouter.get(
  '/',
  authenticate,
  authorize('settings', 'view'),
  adminSettingsController.getSettings
);

// Update Settings
adminSettingsRouter.put(
  '/',
  authenticate,
  authorize('settings', 'manage'),
  adminSettingsController.updateAllSettings
);
adminSettingsRouter.patch(
  '/:section',
  authenticate,
  authorize('settings', 'manage'),
  adminSettingsController.updateSection
);

// Utility & Test Actions
adminSettingsRouter.post(
  '/test-email',
  authenticate,
  authorize('settings', 'manage'),
  adminSettingsController.testEmail
);
adminSettingsRouter.post(
  '/test-integration',
  authenticate,
  authorize('settings', 'manage'),
  adminSettingsController.testIntegration
);
adminSettingsRouter.post(
  '/backup',
  authenticate,
  authorize('settings', 'manage'),
  adminSettingsController.triggerBackup
);
adminSettingsRouter.post(
  '/danger-action',
  authenticate,
  authorize('settings', 'manage'),
  adminSettingsController.dangerAction
);

export default adminSettingsRouter;
export { adminSettingsRouter };
