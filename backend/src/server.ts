import { app } from './app';
import { env } from './config';
import { connectDatabase, disconnectDatabase } from './database';
import { logger } from './utils';

const PORT = env.PORT;

const startServer = async () => {
  try {
    // 1. Establish MongoDB connection
    await connectDatabase();

    // 2. Start HTTP server listener
    const server = app.listen(PORT, () => {
      logger.info(
        `🚀 Self Print Server listening on http://localhost:${PORT} [${env.NODE_ENV}]`
      );
      logger.info(
        `📋 Health check active at http://localhost:${PORT}/api/v1/health`
      );
    });

    // 3. Graceful Shutdown handler
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
    logger.error('Failed to initialize server:', error);
    process.exit(1);
  }
};

startServer();
