import { PrismaClient } from '@prisma/client';
import { env } from '../config';

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
}

// Prevent multiple instances of Prisma Client in development
export const prisma =
  global.prismaGlobal ||
  new PrismaClient({
    log: env.isDevelopment ? ['query', 'info', 'warn', 'error'] : ['error'],
  });

if (env.isDevelopment) {
  global.prismaGlobal = prisma;
}

export default prisma;
