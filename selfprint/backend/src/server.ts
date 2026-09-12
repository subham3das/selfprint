import { app } from './app';
import { env } from './config';
import { connectDatabase, disconnectDatabase, isDatabaseHealthy } from './database';
import { logger } from './utils';
import { socketManager } from './socket';
import { emailService } from './services/email.service';

// 1. Uncaught Exception Handler
process.on('uncaughtException', (err: Error) => {
  logger.error('💥 UNCAUGHT EXCEPTION! Shutting down immediately...', {
    error: err.message,
    stack: err.stack
  });
  process.exit(1);
});

// 2. Unhandled Promise Rejection Handler
process.on('unhandledRejection', (reason: any) => {
  logger.error('💥 UNHANDLED REJECTION! Shutting down immediately...', {
    reason: reason?.message || reason,
    stack: reason?.stack
  });
  process.exit(1);
});

// Render dynamically assigns process.env.PORT; fallback to 5000 for local dev
const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';

const startServer = async () => {
  try {
    // 1. Establish MongoDB connection with retries
    await connectDatabase();
    logger.info('✅ Database connected successfully');

    // 2. Safely check SMTP connection without halting boot if credentials are empty/invalid
    try {
      await emailService.verifyConnection();
    } catch (emailErr) {
      logger.warn('⚠️ SMTP verification skipped or failed. Continuing boot without blocking.');
    }

    // 3. Start HTTP server listener on 0.0.0.0
    const server = app.listen(Number(PORT), HOST, () => {
      logger.info('====================================================');
      logger.info('🚀 Self Print Enterprise Backend API Initialized');
      logger.info(`🌐 Environment : ${env.NODE_ENV || 'development'}`);
      logger.info(`🔌 Port        : ${PORT}`);
      logger.info(`💾 Database    : ${isDatabaseHealthy() ? 'Connected' : 'Disconnected'}`);
      logger.info(`🔗 Server URL  : http://${HOST}:${PORT}`);
      logger.info(`📋 Healthcheck : http://${HOST}:${PORT}/healthz`);
      logger.info('====================================================');
    });

    // 4. Initialize Socket.io Real-time Event Broadcaster
    socketManager.init(server);

    // 5. Graceful Shutdown handler
    const handleShutdown = async (signal: string) => {
      logger.info(`Received ${signal}. Gracefully closing HTTP server and database connections...`);
      server.close(async () => {
        try {
          await disconnectDatabase();
          logger.info('Database connections closed cleanly.');
          process.exit(0);
        } catch (err) {
          logger.error('Error disconnecting database during shutdown:', err);
          process.exit(1);
        }
      });

      // Force terminate if graceful close exceeds 10s
      setTimeout(() => {
        logger.error('Forced shutdown due to timeout.');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => handleShutdown('SIGTERM'));
    process.on('SIGINT', () => handleShutdown('SIGINT'));
  } catch (error) {
    logger.error('❌ Failed to initialize server on startup:', error);
    process.exit(1);
  }
};

startServer();

