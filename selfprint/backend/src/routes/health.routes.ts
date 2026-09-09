import { Router, Request, Response } from 'express';
import { ApiResponse } from '../responses/ApiResponse';
import { isDatabaseHealthy, dbConnection } from '../database/connection';
import { env } from '../config/environment';

const router = Router();

/**
 * @route   GET /api/v1/health
 * @desc    Comprehensive system and database health check endpoint
 * @access  Public
 */
router.get('/', (_req: Request, res: Response) => {
  const isDbConnected = isDatabaseHealthy();

  const healthReport = {
    status: isDbConnected ? 'HEALTHY' : 'DEGRADED',
    service: 'Self Print Backend Core API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
    database: {
      provider: 'MongoDB Atlas',
      status: isDbConnected ? 'Connected' : 'Disconnected',
      state: dbConnection.getConnectionState()
    },
    storage: {
      provider: 'Cloudinary',
      configured: Boolean(
        env.CLOUDINARY.CLOUD_NAME && env.CLOUDINARY.API_KEY
      )
    },
    system: {
      uptimeSeconds: Math.floor(process.uptime()),
      memoryUsageMB: Math.round(process.memoryUsage().rss / (1024 * 1024))
    }
  };

  return ApiResponse.success(
    res,
    isDbConnected
      ? 'All backend foundational systems operational.'
      : 'Backend is running with degraded database connectivity.',
    healthReport,
    isDbConnected ? 200 : 503
  );
});

export const healthRoutes = router;
export default healthRoutes;
