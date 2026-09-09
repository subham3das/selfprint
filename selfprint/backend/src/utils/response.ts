import { Response } from 'express';

export interface ApiResponseData<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: string;
}

export class ApiResponse {
  static success<T>(res: Response, message: string, data?: T, statusCode = 200): Response {
    const responseBody: ApiResponseData<T> = {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    };
    return res.status(statusCode).json(responseBody);
  }

  static error(res: Response, message: string, error?: string, statusCode = 500): Response {
    const responseBody: ApiResponseData = {
      success: false,
      message,
      error: error || message,
      timestamp: new Date().toISOString(),
    };
    return res.status(statusCode).json(responseBody);
  }
}
