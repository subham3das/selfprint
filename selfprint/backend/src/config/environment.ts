import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Priority load backend/.env, fallback to process.cwd()/.env
const backendEnvPath = path.resolve(__dirname, '../../.env');
if (fs.existsSync(backendEnvPath)) {
  dotenv.config({ path: backendEnvPath });
} else {
  dotenv.config({ path: path.resolve(process.cwd(), '.env') });
}

export interface EnvironmentConfig {
  PORT: number;
  NODE_ENV: 'development' | 'production' | 'test';
  MONGODB_URI: string;
  CORS_ORIGIN: string | string[];
  FRONTEND_URL: string;
  CLOUDINARY: {
    CLOUD_NAME: string;
    API_KEY: string;
    API_SECRET: string;
  };
  JWT: {
    SECRET: string;
    EXPIRES_IN: string;
  };
  GOOGLE: {
    CLIENT_ID: string;
    CLIENT_SECRET: string;
  };
  SMTP: {
    HOST: string;
    PORT: number;
    USER: string;
    PASS: string;
  };
  EMAIL: {
    FROM_NAME: string;
    FROM_ADDRESS: string;
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
  FRONTEND_URL: process.env.FRONTEND_URL || (typeof process.env.CORS_ORIGIN === 'string' && process.env.CORS_ORIGIN !== '*' ? process.env.CORS_ORIGIN : 'http://localhost:5173'),
  CLOUDINARY: {
    CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
    API_KEY: process.env.CLOUDINARY_API_KEY || '',
    API_SECRET: process.env.CLOUDINARY_KEY_SECRET || process.env.CLOUDINARY_API_SECRET || ''
  },
  JWT: {
    SECRET: process.env.JWT_SECRET || 'selfprint_default_secure_secret_key_2026',
    EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d'
  },
  GOOGLE: {
    CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
    CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || ''
  },
  SMTP: {
    HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
    PORT: parseInt(process.env.SMTP_PORT || '587', 10),
    USER: process.env.SMTP_USER || '',
    PASS: process.env.SMTP_PASS || ''
  },
  EMAIL: {
    FROM_NAME: process.env.EMAIL_FROM_NAME || 'Self Print',
    FROM_ADDRESS: process.env.EMAIL_FROM_ADDRESS || process.env.SMTP_USER || 'noreply@selfprint.com'
  },
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test',
  isTest: process.env.NODE_ENV === 'test'
};

export default env;
