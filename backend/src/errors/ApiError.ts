import { HTTP_STATUS, HttpStatusCode } from '../constants/httpStatusCodes';
import { ERROR_CODES, ErrorCode } from '../constants/errorCodes';

export class ApiError extends Error {
  public readonly statusCode: HttpStatusCode;
  public readonly errorCode: ErrorCode;
  public readonly isOperational: boolean;
  public readonly details?: any;

  constructor(
    message: string,
    statusCode: HttpStatusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    errorCode: ErrorCode = ERROR_CODES.INTERNAL_SERVER_ERROR,
    details?: any,
    isOperational = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    this.isOperational = isOperational;

    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}
