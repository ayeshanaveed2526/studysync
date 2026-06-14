import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema } from 'zod';
import { AppError } from './error';

/**
 * Middleware factory that validates request body against a Zod schema.
 */
export function validate(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const messages = result.error.errors
        .map((e) => `${e.path.join('.')}: ${e.message}`)
        .join(', ');
      next(AppError.badRequest(`Validation failed: ${messages}`, 'VALIDATION_ERROR'));
      return;
    }
    req.body = result.data;
    next();
  };
}

/**
 * Middleware factory that validates request query params against a Zod schema.
 */
export function validateQuery(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      const messages = result.error.errors
        .map((e) => `${e.path.join('.')}: ${e.message}`)
        .join(', ');
      next(AppError.badRequest(`Invalid query params: ${messages}`, 'VALIDATION_ERROR'));
      return;
    }
    req.query = result.data;
    next();
  };
}
