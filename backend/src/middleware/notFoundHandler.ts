import { Request, Response } from 'express';
import { ApiResponse } from '../utils';

export const notFoundHandler = (req: Request, res: Response): Response => {
  return ApiResponse.error(res, `Route not found: ${req.method} ${req.originalUrl}`, undefined, 404);
};
