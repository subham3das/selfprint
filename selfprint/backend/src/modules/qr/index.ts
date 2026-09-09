import { Router } from 'express';
import { qrController } from './qr.controller';
import { authenticate } from '../../middlewares/auth.middleware';

const qrRouter = Router();

// 1. Authenticated Store QR Management
qrRouter.get('/config', authenticate, qrController.getQRConfig);
qrRouter.post('/update-config', authenticate, qrController.updateQRConfig);
qrRouter.post('/regenerate', authenticate, qrController.regenerateQR);
qrRouter.get('/history', authenticate, qrController.getQRHistory);
qrRouter.delete('/history/:id', authenticate, qrController.deleteQRHistory);
qrRouter.get('/analytics', authenticate, qrController.getQRAnalytics);

// 2. Public Customer Scan & Store Resolution
qrRouter.get('/resolve/:token', qrController.resolveQRToken);
qrRouter.get('/store/:storeId', qrController.resolveQRToken);

export default qrRouter;
export { qrRouter };
export * from './qr.types';
export * from './qr.service';
export * from './qr.repository';
export * from './qr.controller';
