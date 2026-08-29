import { Request, Response } from 'express';
import { ApiResponse } from '../utils';

export class HealthController {
  static getHealth(_req: Request, res: Response): Response {
    return ApiResponse.success(res, 'Self-Print API is healthy and running', {
      status: 'UP',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  }
}
