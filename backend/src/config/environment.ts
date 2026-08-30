import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export interface EnvironmentConfig {
  PORT: number;
  NODE_ENV: 'development' | 'production' | 'test';
  MONGODB_URI: string;
  CORS_ORIGIN: string | string[];
  CLOUDINARY: {
    CLOUD_NAME: string;
    API_KEY: string;
    API_SECRET: string;
  };
  JWT: {
    SECRET: string;
    EXPIRES_IN: string;
  };
  isProduction: boolean;
  isDevelopment: boolean;
  isTest: boolean;
}

const parseCorsOrigin = (origin?: string): string | string[] => {
  if (!origin) return '*';
  if (origin.includes(',')) {
    return origin.split(',').map((o) => o.trim());
  }
  return origin;
};

export const env: EnvironmentConfig = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: (process.env.NODE_ENV as 'development' | 'production' | 'test') || 'development',
  MONGODB_URI:
    process.env.MONGODB_URI ||
    'mongodb://localhost:27017/selfprint_dev',
  CORS_ORIGIN: parseCorsOrigin(process.env.CORS_ORIGIN),
  CLOUDINARY: {
    CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
    API_KEY: process.env.CLOUDINARY_API_KEY || '',
    API_SECRET: process.env.CLOUDINARY_KEY_SECRET || process.env.CLOUDINARY_API_SECRET || ''
  },
  JWT: {
    SECRET: process.env.JWT_SECRET || 'selfprint_default_secure_secret_key_2026',
    EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d'
  },
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test',
  isTest: process.env.NODE_ENV === 'test'
};

export default env;
