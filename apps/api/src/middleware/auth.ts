import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config';
import { AppError } from './error';

export interface AuthPayload {
  userId: string;
  email: string;
}

/**
 * Middleware that verifies the JWT access token from the Authorization header.
 * Attaches `req.user` with `{ userId, email }` on success.
 * Returns 401 with code AUTH_TOKEN_INVALID or AUTH_TOKEN_EXPIRED.
 */
export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw AppError.unauthorized('Missing or invalid authorization header', 'AUTH_TOKEN_INVALID');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw AppError.unauthorized('Missing token', 'AUTH_TOKEN_INVALID');
    }

    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as AuthPayload;
    req.user = payload;
    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
      return;
    }
    if (error instanceof jwt.TokenExpiredError) {
      next(AppError.unauthorized('Token expired', 'AUTH_TOKEN_EXPIRED'));
      return;
    }
    if (error instanceof jwt.JsonWebTokenError) {
      next(AppError.unauthorized('Invalid token', 'AUTH_TOKEN_INVALID'));
      return;
    }
    next(error);
  }
}
