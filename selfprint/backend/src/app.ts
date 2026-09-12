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
      origin: (origin, callback) => {
        // Allow requests with no origin (e.g. mobile apps, curl, electron file://, host-service)
        if (!origin) return callback(null, true);

        // Allow localhost and 127.0.0.1 on any port (for Vite dev servers :5173, :5174, host service :4500)
        if (
          /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin) ||
          origin.startsWith('file://') ||
          origin.startsWith('vscode-webview://')
        ) {
          return callback(null, true);
        }

        // Allow Vercel preview & production deployments and Render URLs
        if (
          /^https:\/\/[a-zA-Z0-9_-]+\.vercel\.app$/.test(origin) ||
          /^https:\/\/[a-zA-Z0-9_-]+\.onrender\.com$/.test(origin)
        ) {
          return callback(null, true);
        }

        const allowed = Array.isArray(env.CORS_ORIGIN) ? env.CORS_ORIGIN : [env.CORS_ORIGIN];
        if (allowed.includes('*') || allowed.includes(origin)) {
          return callback(null, true);
        }

        callback(null, false);
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-device-token']
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

  // Render & Cloud Health Check Endpoints
  app.get(['/healthz', '/health'], (_req: Request, res: Response) => {
    res.status(200).json({ status: 'ok' });
  });

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
