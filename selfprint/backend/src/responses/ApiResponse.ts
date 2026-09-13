import { Response } from 'express';
import { HTTP_STATUS, HttpStatusCode } from '../constants/httpStatusCodes';
import { ERROR_CODES, ErrorCode } from '../constants/errorCodes';

export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface StandardSuccessResponse<T = any> {
  success: true;
  message: string;
  data: T;
  timestamp: string;
}

export interface StandardPaginatedResponse<T = any> {
  success: true;
  message: string;
  data: T[];
  pagination: PaginationMeta;
  timestamp: string;
}

export interface StandardErrorResponse {
  success: false;
  message: string;
  code: string;
  errorCode: ErrorCode;
  errors?: Record<string, string>;
  error?: string;
  details?: any;
  timestamp: string;
}

export class ApiResponse {
  /**
   * Send a standard 200/2xx Success Response
   */
  public static success<T = any>(
    res: Response,
    message = 'Success',
    data: T = {} as T,
    statusCode: HttpStatusCode = HTTP_STATUS.OK
  ): Response {
    const payload: StandardSuccessResponse<T> = {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    };
    return res.status(statusCode).json(payload);
  }

  /**
   * Send a 201 Created Response
   */
  public static created<T = any>(
    res: Response,
    message = 'Resource created successfully',
    data: T = {} as T
  ): Response {
    return ApiResponse.success(res, message, data, HTTP_STATUS.CREATED);
  }

  /**
   * Send a standard Paginated List Response
   */
  public static paginated<T = any>(
    res: Response,
    message = 'Data retrieved successfully',
    items: T[] = [],
    pagination: PaginationMeta,
    statusCode: HttpStatusCode = HTTP_STATUS.OK
  ): Response {
    const payload: StandardPaginatedResponse<T> = {
      success: true,
      message,
      data: items,
      pagination,
      timestamp: new Date().toISOString()
    };
    return res.status(statusCode).json(payload);
  }

  /**
   * Send a standard Error Response
   */
  public static error(
    res: Response,
    message = 'Internal Server Error',
    statusCode: HttpStatusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    errorCode: ErrorCode = ERROR_CODES.INTERNAL_SERVER_ERROR,
    details?: any,
    errors?: Record<string, string>
  ): Response {
    const payload: StandardErrorResponse = {
      success: false,
      message,
      code: String(errorCode),
      errorCode,
      ...(errors && Object.keys(errors).length > 0 ? { errors } : {}),
      details,
      timestamp: new Date().toISOString()
    };
    return res.status(statusCode).json(payload);
  }
}

export default ApiResponse;
