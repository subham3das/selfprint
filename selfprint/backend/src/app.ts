import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { env } from './config';
import { errorHandler, notFoundHandler, apiLimiter } from './middlewares';
import apiRouter from './routes';
import { ApiResponse } from './responses';

export const createApp = (): Application => {
  const app: Application = express();

  // Trust proxy for rate limiting behind reverse proxies (Nginx / Cloudflare / Vercel)
  app.set('trust proxy', 1);

  // Security Headers Middleware
  app.use(helmet());

  // CORS Configuration
  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    })
  );

  // Response Compression
  app.use(compression());

  // Cookie Parser
  app.use(cookieParser());

  // HTTP Request Logging
  app.use(morgan(env.isProduction ? 'combined' : 'dev'));

  // Rate Limiting
  app.use('/api', apiLimiter);

  // Body Parsing Middleware
  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ extended: true, limit: '15mb' }));

  // Root status endpoint
  app.get('/', (_req: Request, res: Response) => {
    ApiResponse.success(res, 'Self-Print Enterprise Backend API operational', {
      service: 'Self Print SaaS Core Engine',
      environment: env.NODE_ENV,
      version: '1.0.0',
      timestamp: new Date().toISOString()
    });
  });

  // Mount API endpoints
  app.use('/api/v1', apiRouter);
  app.use('/api', apiRouter);

  // 404 Not Found Middleware
  app.use(notFoundHandler);

  // Global Centralized Error Handler Middleware
  app.use(errorHandler);

  return app;
};

export const app = createApp();
export default app;
