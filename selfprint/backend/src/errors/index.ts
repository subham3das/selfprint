import { ApiError } from './ApiError';
import { HTTP_STATUS } from '../constants/httpStatusCodes';
import { ERROR_CODES } from '../constants/errorCodes';

export class BadRequestError extends ApiError {
  constructor(message = 'Bad Request', details?: any, errors?: Record<string, string>) {
    super(message, HTTP_STATUS.BAD_REQUEST, ERROR_CODES.BAD_REQUEST, details, errors);
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = 'Unauthorized access. Please login.', details?: any) {
    super(message, HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.UNAUTHORIZED, details);
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = 'Forbidden. Insufficient permissions.', details?: any) {
    super(message, HTTP_STATUS.FORBIDDEN, ERROR_CODES.FORBIDDEN, details);
  }
}

export class NotFoundError extends ApiError {
  constructor(message = 'Requested resource not found.', details?: any) {
    super(message, HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND, details);
  }
}

export class ConflictError extends ApiError {
  constructor(message = 'Resource conflict detected.', details?: any, errors?: Record<string, string>) {
    super(message, HTTP_STATUS.CONFLICT, ERROR_CODES.CONFLICT, details, errors);
  }
}

export class GoneError extends ApiError {
  constructor(message = 'Resource has expired or is no longer available.', details?: any) {
    super(message, HTTP_STATUS.GONE, 'RESOURCE_EXPIRED', details);
  }
}

export class StoreBlockedError extends ApiError {
  constructor(
    message = 'Your store has been blocked by the administrator. Please contact support.',
    details?: any
  ) {
    super(message, HTTP_STATUS.FORBIDDEN, 'STORE_BLOCKED', details);
  }
}

export class StoreDeletedError extends ApiError {
  constructor(
    message = 'This store has been deleted by the administrator.',
    details?: any
  ) {
    super(message, HTTP_STATUS.FORBIDDEN, 'STORE_DELETED', details);
  }
}

export class ValidationError extends ApiError {
  constructor(
    message = 'Validation Failed',
    errors: Record<string, string> = {},
    details?: any
  ) {
    super(
      message,
      HTTP_STATUS.UNPROCESSABLE_ENTITY,
      ERROR_CODES.VALIDATION_ERROR,
      details,
      errors
    );
  }
}

export * from './ApiError';
