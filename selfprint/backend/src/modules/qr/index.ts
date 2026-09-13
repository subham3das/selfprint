import { Router } from 'express';
import { qrController } from './qr.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { requireActiveStore } from '../../middlewares/storeProtection.middleware';

const qrRouter = Router();

// 1. Authenticated Store QR Management (Protected by requireActiveStore)
qrRouter.get('/config', authenticate, requireActiveStore, qrController.getQRConfig);
qrRouter.post('/update-config', authenticate, requireActiveStore, qrController.updateQRConfig);
qrRouter.post('/regenerate', authenticate, requireActiveStore, qrController.regenerateQR);
qrRouter.get('/history', authenticate, requireActiveStore, qrController.getQRHistory);
qrRouter.delete('/history/:id', authenticate, requireActiveStore, qrController.deleteQRHistory);
qrRouter.get('/analytics', authenticate, requireActiveStore, qrController.getQRAnalytics);

// 2. Public Customer Scan & Store Resolution
qrRouter.get('/resolve/:token', qrController.resolveQRToken);
qrRouter.get('/store/:storeId', qrController.resolveQRToken);

export default qrRouter;
export { qrRouter };
export * from './qr.types';
export * from './qr.service';
export * from './qr.repository';
export * from './qr.controller';
