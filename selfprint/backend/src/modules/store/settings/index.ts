import { Router } from 'express';
import { settingsController } from './settings.controller';
import { authenticate } from '../../../middlewares/auth.middleware';

const settingsRouter = Router();

// Full settings
settingsRouter.get('/', authenticate, settingsController.getFullSettings);

// Sub-sections
settingsRouter.patch('/', authenticate, settingsController.updateGeneralSettings);
settingsRouter.patch('/pricing', authenticate, settingsController.updatePricingSettings);
settingsRouter.patch('/payment', authenticate, settingsController.updatePaymentSettings);
settingsRouter.patch('/printer', authenticate, settingsController.updatePrinterSettings);
settingsRouter.patch('/preferences', authenticate, settingsController.updatePreferencesSettings);
settingsRouter.patch('/notifications', authenticate, settingsController.updateNotificationSettings);
settingsRouter.patch('/receipt', authenticate, settingsController.updateReceiptSettings);

// Backup & Diagnostics
settingsRouter.get('/backup', authenticate, settingsController.exportBackup);
settingsRouter.post('/restore', authenticate, settingsController.restoreBackup);
settingsRouter.get('/system-info', authenticate, settingsController.getSystemInfo);

export default settingsRouter;
export { settingsRouter };
export * from './settings.types';
export * from './settings.service';
export * from './settings.repository';
export * from './settings.controller';
