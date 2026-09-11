import rateLimit from 'express-rate-limit';
import { ApiResponse } from '../responses/ApiResponse';
import { HTTP_STATUS } from '../constants/httpStatusCodes';
import { ERROR_CODES } from '../constants/errorCodes';

/**
 * Standard API rate limiter: 1500 requests per 15 minutes in prod, generous in dev.
 * Connector heartbeats, status polling, token verification, and health probes are explicitly exempt.
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 1500 : 10000,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    const url = req.originalUrl || req.url || '';
    // Never throttle connector heartbeats, status checks, pairing, token verification, or health probes
    if (url.includes('/connectors') || url.includes('/health')) {
      return true;
    }
    // In local development, do not throttle loopback addresses
    if (process.env.NODE_ENV !== 'production') {
      const ip = req.ip || req.socket.remoteAddress || '';
      if (ip === '127.0.0.1' || ip === '::1' || ip.includes('127.0.0.1') || ip === '::ffff:127.0.0.1') {
        return true;
      }
    }
    return false;
  },
  handler: (_req, res) => {
    ApiResponse.error(
      res,
      'Too many requests from this IP, please try again after 15 minutes.',
      HTTP_STATUS.TOO_MANY_REQUESTS,
      ERROR_CODES.RATE_LIMIT_EXCEEDED
    );
  }
});

/**
 * Strict authentication limiter: 20 login attempts per 15 minutes
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    ApiResponse.error(
      res,
      'Too many authentication attempts. Please try again after 15 minutes.',
      HTTP_STATUS.TOO_MANY_REQUESTS,
      ERROR_CODES.RATE_LIMIT_EXCEEDED
    );
  }
});

/**
 * Kiosk file upload rate limiter: 50 uploads per 10 minutes per IP
 */
export const uploadLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    ApiResponse.error(
      res,
      'Upload limit reached for your session. Please wait before uploading more files.',
      HTTP_STATUS.TOO_MANY_REQUESTS,
      ERROR_CODES.RATE_LIMIT_EXCEEDED
    );
  }
});
