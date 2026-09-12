import { Router } from 'express';
import { healthRoutes } from './health.routes';
import { authRouter } from '../modules/auth';
import { superAdminRouter } from '../modules/super-admin';
import { adminRouter } from '../modules/admin';
import { storeRouter } from '../modules/store';
import { userKioskRouter } from '../modules/user';
import { ordersRouter } from '../modules/orders';
import { paymentsRouter } from '../modules/payments';
import { printerModuleRouter } from '../modules/printer';
import { qrRouter } from '../modules/qr';
import { notificationsRouter } from '../modules/notifications';
import { auditRouter } from '../modules/audit';
import { analyticsRouter } from '../modules/analytics';
import { publicRouter } from '../modules/public';
import { connectorRouter } from '../modules/connector/connector.routes';

const apiRouter = Router();

// 0. Public Customer Portal & Uploads
apiRouter.use('/public', publicRouter);

// 1. System Health Check
apiRouter.use('/health', healthRoutes);

// 2. Authentication & Sessions
apiRouter.use('/auth', authRouter);

// 3. Super Admin Subsystem
apiRouter.use('/super-admin', superAdminRouter);

// 4. Admin & Staff Operations
apiRouter.use('/admin', adminRouter);

// 5. Store Partner Operations
apiRouter.use('/store', storeRouter);

// 6. User / Customer Kiosk Operations
apiRouter.use('/user', userKioskRouter);

// 7. Print Spooler Orders & Queue
apiRouter.use('/orders', ordersRouter);

// 8. Payments & Settlement
apiRouter.use('/payments', paymentsRouter);

// 9. Physical Hardware & Spooler Telemetry
apiRouter.use('/connectors', connectorRouter);
apiRouter.use('/connector', connectorRouter);
apiRouter.use('/printer', printerModuleRouter);
apiRouter.use('/connectors/printers', printerModuleRouter);

// 10. Dynamic QR System
apiRouter.use('/qr', qrRouter);

// 11. Real-time Notifications Engine
apiRouter.use('/notifications', notificationsRouter);

// 12. Security Audit Logs
apiRouter.use('/audit', auditRouter);

// 13. Platform & Store Analytics
apiRouter.use('/analytics', analyticsRouter);

export default apiRouter;
