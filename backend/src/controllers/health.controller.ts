import { Request, Response } from 'express';
import { ApiResponse } from '../responses';
import { BaseController } from './BaseController';

export class HealthController extends BaseController {
  public static getHealth(_req: Request, res: Response): Response {
    return ApiResponse.success(res, 'Self-Print API is healthy and running', {
      status: 'UP',
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    });
  }
}

export default HealthController;
