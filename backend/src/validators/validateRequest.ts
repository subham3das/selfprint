import { Request, Response, NextFunction, RequestHandler } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ValidationError } from '../errors';

interface RequestValidationTargets {
  body?: ZodSchema<any>;
  query?: ZodSchema<any>;
  params?: ZodSchema<any>;
}

/**
 * Reusable Zod validation middleware
 * Validates req.body, req.query, or req.params and formats validation error payloads
 */
export const validateRequest = (
  schemaOrTargets: ZodSchema<any> | RequestValidationTargets
): RequestHandler => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      if ('parse' in schemaOrTargets && typeof schemaOrTargets.parse === 'function') {
        req.body = await schemaOrTargets.parseAsync(req.body);
      } else {
        const targets = schemaOrTargets as RequestValidationTargets;
        if (targets.body) {
          req.body = await targets.body.parseAsync(req.body);
        }
        if (targets.query) {
          req.query = await targets.query.parseAsync(req.query);
        }
        if (targets.params) {
          req.params = await targets.params.parseAsync(req.params);
        }
      }
      next();
    } catch (error: any) {
      if (error instanceof ZodError || error.name === 'ZodError') {
        const issues = error.issues || error.errors || [];
        const formattedErrors = issues.map((err: any) => ({
          field: Array.isArray(err.path) ? err.path.join('.') : String(err.path || ''),
          message: err.message,
          code: err.code
        }));
        return next(
          new ValidationError(
            'Request validation failed. Please check input parameters.',
            formattedErrors
          )
        );
      }
      next(error);
    }
  };
};

export default validateRequest;
