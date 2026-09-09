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
 * Validates req.body, req.query, or req.params and formats field-level validation errors
 */
export const validateRequest = (
  schemaOrTargets: ZodSchema<any> | RequestValidationTargets
): RequestHandler => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      if ('parse' in schemaOrTargets && typeof schemaOrTargets.parse === 'function') {
        const schema = schemaOrTargets as ZodSchema<any>;

        // If the schema expects a top-level wrapper object (e.g. { body, query, params })
        let payloadToValidate: any = req.body;
        const schemaShape = (schema as any).shape;

        if (schemaShape && ('body' in schemaShape || 'query' in schemaShape || 'params' in schemaShape)) {
          payloadToValidate = {
            body: req.body,
            query: req.query,
            params: req.params
          };
          const result = await schema.parseAsync(payloadToValidate);
          if (result.body) req.body = result.body;
          if (result.query) req.query = result.query;
          if (result.params) req.params = result.params;
        } else {
          req.body = await schema.parseAsync(req.body);
        }
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
        const errorsMap: Record<string, string> = {};
        const formattedErrors: Array<{ field: string; message: string; code?: string }> = [];

        for (const issue of issues) {
          const rawPath = issue.path || [];
          // Filter out top-level wrapper targets like 'body', 'query', 'params'
          const cleanPath = rawPath.filter((p: any) => p !== 'body' && p !== 'query' && p !== 'params');
          const fieldName = String(cleanPath[cleanPath.length - 1] || rawPath[rawPath.length - 1] || 'general');
          const fullPath = cleanPath.join('.');

          // Assign field-level error mapping
          if (!errorsMap[fieldName]) {
            errorsMap[fieldName] = issue.message;
          }
          if (fullPath && fullPath !== fieldName && !errorsMap[fullPath]) {
            errorsMap[fullPath] = issue.message;
          }

          // Alias common field variations (e.g. gstNumber / gstin, pinCode / pincode)
          if (fieldName === 'gstNumber' && !errorsMap['gstin']) {
            errorsMap['gstin'] = issue.message;
          } else if (fieldName === 'gstin' && !errorsMap['gstNumber']) {
            errorsMap['gstNumber'] = issue.message;
          }
          if (fieldName === 'pinCode' && !errorsMap['pincode']) {
            errorsMap['pincode'] = issue.message;
          } else if (fieldName === 'pincode' && !errorsMap['pinCode']) {
            errorsMap['pinCode'] = issue.message;
          }

          formattedErrors.push({
            field: fullPath || fieldName,
            message: issue.message,
            code: issue.code
          });
        }

        // Detailed server console logging in development
        console.log('\n==============================');
        console.log('Validation Error:');
        Object.entries(errorsMap).forEach(([field, msg]) => {
          console.log(`${field} -> ${msg}`);
        });
        console.log('==============================\n');

        return next(
          new ValidationError(
            'Validation Failed',
            errorsMap,
            formattedErrors
          )
        );
      }
      next(error);
    }
  };
};

export default validateRequest;
