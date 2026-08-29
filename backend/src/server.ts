import { app } from './app';
import { env } from './config';
import { prisma } from './lib';

const PORT = env.PORT;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server listening on http://localhost:${PORT} in [${env.NODE_ENV}] mode`);
});

// Graceful Shutdown handling
const handleShutdown = async (signal: string) => {
  console.log(`\nReceived ${signal}. Gracefully closing server and database connections...`);
  server.close(async () => {
    try {
      await prisma.$disconnect();
      console.log('Database connections closed cleanly.');
      process.exit(0);
    } catch (err) {
      console.error('Error disconnecting database:', err);
      process.exit(1);
    }
  });

  // Force close after timeout
  setTimeout(() => {
    console.error('Forced shutdown due to timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));
