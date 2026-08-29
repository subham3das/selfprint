import { Router } from 'express';
import healthRoutes from './health.routes';

const rootRouter = Router();

// Mount sub-routers
rootRouter.use('/', healthRoutes);

export default rootRouter;
