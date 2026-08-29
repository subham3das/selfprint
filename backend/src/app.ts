import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config';
import { errorHandler, notFoundHandler } from './middleware';
import apiRouter from './routes';
import { ApiResponse } from './utils';

export const createApp = (): Application => {
  const app: Application = express();

  // Security Middleware
  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true,
    })
  );

  // Logging Middleware
  app.use(morgan(env.isProduction ? 'combined' : 'dev'));

  // Body Parsing Middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Root status endpoint
  app.get('/', (_req: Request, res: Response) => {
    ApiResponse.success(res, 'Self-Print Backend API operational', {
      environment: env.NODE_ENV,
      version: '0.1.0',
    });
  });

  // Mount API endpoints
  app.use('/api/v1', apiRouter);

  // 404 Not Found Middleware
  app.use(notFoundHandler);

  // Global Error Handler Middleware
  app.use(errorHandler);

  return app;
};

export const app = createApp();
export default app;
