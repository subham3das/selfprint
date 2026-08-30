import { Router } from 'express';
import { healthRoutes } from './health.routes';

const apiRouter = Router();

// Mount System Health Check
apiRouter.use('/health', healthRoutes);

// NOTE: Future feature modules (auth, stores, users, print-jobs, etc.)
// will be mounted here as each feature is implemented according to DATABASE.md.

export default apiRouter;
