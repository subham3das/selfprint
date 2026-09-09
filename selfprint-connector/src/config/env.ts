import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export interface Environment {
  PORT: number;
  BACKEND_URL: string;
  DEVICE_ID: string;
  DEVICE_TOKEN: string;
  STORE_ID: string;
  LOG_LEVEL: string;
  HEARTBEAT_INTERVAL_MS: number;
  PRINTER_SCAN_INTERVAL_MS: number;
  INCLUDE_VIRTUAL_PRINTERS: boolean;
}

export const env: Environment = {
  PORT: parseInt(process.env.PORT || '4500', 10),
  BACKEND_URL: process.env.BACKEND_URL || 'http://localhost:3000',
  DEVICE_ID: process.env.DEVICE_ID || '',
  DEVICE_TOKEN: process.env.DEVICE_TOKEN || '',
  STORE_ID: process.env.STORE_ID || '',
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  HEARTBEAT_INTERVAL_MS: parseInt(process.env.HEARTBEAT_INTERVAL_MS || '15000', 10),
  PRINTER_SCAN_INTERVAL_MS: parseInt(process.env.PRINTER_SCAN_INTERVAL_MS || '30000', 10),
  INCLUDE_VIRTUAL_PRINTERS: process.env.INCLUDE_VIRTUAL_PRINTERS === 'true'
};
