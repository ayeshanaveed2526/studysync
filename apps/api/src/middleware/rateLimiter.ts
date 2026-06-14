import rateLimit from 'express-rate-limit';
import { AppError } from './error';

/**
 * General rate limiter: 100 requests per minute per IP
 */
export const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  handler: (req, res, next) => {
    next(new AppError('Too many requests. Please try again later.', 429, 'RATE_LIMIT_EXCEEDED'));
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Auth rate limiter: 10 requests per minute per IP (applied to register/login)
 */
export const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  handler: (req, res, next) => {
    next(new AppError('Too many login or registration attempts. Please try again in a minute.', 429, 'AUTH_RATE_LIMIT_EXCEEDED'));
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * AI rate limiter: 20 requests per hour per userId (or IP if unauthenticated)
 */
export const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  keyGenerator: (req) => {
    return req.user?.userId || req.ip || '';
  },
  handler: (req, res, next) => {
    next(new AppError('AI assistant rate limit exceeded. Please try again in an hour.', 429, 'AI_RATE_LIMIT_EXCEEDED'));
  },
  standardHeaders: true,
  legacyHeaders: false,
});
