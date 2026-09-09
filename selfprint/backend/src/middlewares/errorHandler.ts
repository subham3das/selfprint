import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../errors/ApiError';
import { ApiResponse } from '../responses/ApiResponse';
import { HTTP_STATUS } from '../constants/httpStatusCodes';
import { ERROR_CODES } from '../constants/errorCodes';
import { logger } from '../utils/logger';
import { env } from '../config/environment';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
): Response => {
  logger.error(`[${req.method}] ${req.originalUrl} - Error:`, {
    message: err.message,
    errors: err.errors,
    stack: env.isDevelopment ? err.stack : undefined
  });

  // 1. Handled custom ApiError instance
  if (err instanceof ApiError) {
    return ApiResponse.error(
      res,
      err.message,
      err.statusCode,
      err.errorCode,
      err.details,
      err.errors
    );
  }

  // 2. MongoDB Duplicate Key Error (code 11000)
  if (err.name === 'MongoServerError' && err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'resource';
    const errorMsg = `${field} already exists`;

    console.log('\n==============================');
    console.log('Validation Error:');
    console.log(`${field} -> already exists`);
    console.log('==============================\n');

    return ApiResponse.error(
      res,
      'Validation Failed',
      HTTP_STATUS.UNPROCESSABLE_ENTITY,
      ERROR_CODES.VALIDATION_ERROR,
      err.keyValue,
      { [field]: errorMsg }
    );
  }

  // 3. Mongoose CastError (e.g. Invalid ObjectId)
  if (err.name === 'CastError') {
    return ApiResponse.error(
      res,
      `Invalid ${err.path}: ${err.value}`,
      HTTP_STATUS.BAD_REQUEST,
      ERROR_CODES.BAD_REQUEST,
      undefined,
      { [err.path]: `Invalid ${err.path}` }
    );
  }

  // 4. JWT Authentication Errors
  if (err.name === 'JsonWebTokenError') {
    return ApiResponse.error(
      res,
      'Invalid authentication token.',
      HTTP_STATUS.UNAUTHORIZED,
      ERROR_CODES.UNAUTHORIZED
    );
  }

  if (err.name === 'TokenExpiredError') {
    return ApiResponse.error(
      res,
      'Authentication token has expired. Please login again.',
      HTTP_STATUS.UNAUTHORIZED,
      ERROR_CODES.UNAUTHORIZED
    );
  }

  // 5. Unhandled Server Exceptions (500)
  const message = env.isProduction
    ? 'An unexpected internal server error occurred.'
    : err.message || 'Internal Server Error';

  return ApiResponse.error(
    res,
    message,
    HTTP_STATUS.INTERNAL_SERVER_ERROR,
    ERROR_CODES.INTERNAL_SERVER_ERROR,
    env.isDevelopment ? err.stack : undefined
  );
};

export default errorHandler;
