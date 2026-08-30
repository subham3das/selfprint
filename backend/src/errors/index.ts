import { ApiError } from './ApiError';
import { HTTP_STATUS } from '../constants/httpStatusCodes';
import { ERROR_CODES } from '../constants/errorCodes';

export class BadRequestError extends ApiError {
  constructor(message = 'Bad Request', details?: any) {
    super(message, HTTP_STATUS.BAD_REQUEST, ERROR_CODES.BAD_REQUEST, details);
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
  constructor(message = 'Resource conflict detected.', details?: any) {
    super(message, HTTP_STATUS.CONFLICT, ERROR_CODES.CONFLICT, details);
  }
}

export class ValidationError extends ApiError {
  constructor(message = 'Validation failed for request input.', details?: any) {
    super(
      message,
      HTTP_STATUS.UNPROCESSABLE_ENTITY,
      ERROR_CODES.VALIDATION_ERROR,
      details
    );
  }
}

export * from './ApiError';
