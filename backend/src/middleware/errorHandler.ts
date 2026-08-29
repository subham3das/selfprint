import { Request, Response, NextFunction } from 'express';
import { env } from '../config';
import { ApiResponse } from '../utils';

export const errorHandler = (
  err: Error & { statusCode?: number },
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): Response => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  return ApiResponse.error(
    res,
    message,
    env.isDevelopment ? err.stack : undefined,
    statusCode
  );
};
