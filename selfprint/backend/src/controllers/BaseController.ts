import { Response } from 'express';
import { ApiResponse, PaginationMeta } from '../responses/ApiResponse';
import { HTTP_STATUS, HttpStatusCode } from '../constants/httpStatusCodes';

/**
 * Abstract Generic Base Controller providing standard response formatting wrappers
 */
export abstract class BaseController {
  protected sendSuccess<T>(
    res: Response,
    message = 'Success',
    data: T = {} as T,
    statusCode: HttpStatusCode = HTTP_STATUS.OK
  ): Response {
    return ApiResponse.success(res, message, data, statusCode);
  }

  protected sendCreated<T>(
    res: Response,
    message = 'Resource created successfully',
    data: T = {} as T
  ): Response {
    return ApiResponse.created(res, message, data);
  }

  protected sendPaginated<T>(
    res: Response,
    message = 'Data retrieved successfully',
    items: T[] = [],
    pagination: PaginationMeta
  ): Response {
    return ApiResponse.paginated(res, message, items, pagination);
  }

  protected sendNoContent(res: Response): Response {
    return res.status(HTTP_STATUS.NO_CONTENT).send();
  }
}

export default BaseController;
