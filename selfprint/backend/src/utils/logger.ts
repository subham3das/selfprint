import { env } from '../config/environment';

export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export const logger = {
  info: (message: string, ...meta: any[]) => {
    console.log(`[INFO] [${new Date().toISOString()}] ${message}`, ...meta);
  },
  warn: (message: string, ...meta: any[]) => {
    console.warn(`[WARN] [${new Date().toISOString()}] ${message}`, ...meta);
  },
  error: (message: string, ...meta: any[]) => {
    console.error(`[ERROR] [${new Date().toISOString()}] ${message}`, ...meta);
  },
  debug: (message: string, ...meta: any[]) => {
    if (env.isDevelopment) {
      console.debug(`[DEBUG] [${new Date().toISOString()}] ${message}`, ...meta);
    }
  },
  request: (method: string, url: string, status: number, durationMs: number) => {
    console.log(
      `[HTTP] [${new Date().toISOString()}] ${method} ${url} ${status} - ${durationMs}ms`
    );
  }
};

export default logger;
