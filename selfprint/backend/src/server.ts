import { app } from './app';
import { env } from './config';
import { connectDatabase, disconnectDatabase } from './database';
import { logger } from './utils';
import { socketManager } from './socket';
import { emailService } from './services/email.service';

const PORT = env.PORT || 5000;
const HOST = '0.0.0.0';

const startServer = async () => {
  try {
    // 1. Establish MongoDB connection
    await connectDatabase();

    // 2. Verify Transactional SMTP Email Connection
    await emailService.verifyConnection();

    // 3. Start HTTP server listener on 0.0.0.0 (IPv4 + IPv6 all interfaces)
    const server = app.listen(PORT, HOST, () => {
      logger.info(
        `🚀 Self Print Server listening on http://${HOST}:${PORT} [${env.NODE_ENV}]`
      );
      logger.info(
        `📋 Health check active at http://localhost:${PORT}/api/v1/health`
      );
    });


    // 3. Initialize Socket.io Real-time Event Broadcaster
    socketManager.init(server);

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
