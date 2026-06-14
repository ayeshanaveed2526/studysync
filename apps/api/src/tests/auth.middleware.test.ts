import { describe, it, expect, vi } from 'vitest';
import { authenticate } from '../middleware/auth';
import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config';

describe('Auth Middleware', () => {
  it('should pass on valid access token', () => {
    const token = jwt.sign({ userId: 'user-123', email: 'john@example.com' }, env.JWT_ACCESS_SECRET);
    
    const req = {
      headers: {
        authorization: `Bearer ${token}`,
      },
    } as unknown as Request;

    const res = {} as unknown as Response;
    const next = vi.fn();

    authenticate(req, res, next);

    expect(req.user).toBeDefined();
    expect(req.user?.userId).toBe('user-123');
    expect(next).toHaveBeenCalledWith();
  });

  it('should return error on expired token', () => {
    const token = jwt.sign(
      { userId: 'user-123', email: 'john@example.com' },
      env.JWT_ACCESS_SECRET,
      { expiresIn: '-1s' }
    );
    
    const req = {
      headers: {
        authorization: `Bearer ${token}`,
      },
    } as unknown as Request;

    const res = {} as unknown as Response;
    const next = vi.fn();

    authenticate(req, res, next);

    expect(next).toHaveBeenCalled();
    const error = next.mock.calls[0]?.[0] as { code?: string; statusCode?: number };
    expect(error?.code).toBe('AUTH_TOKEN_EXPIRED');
    expect(error?.statusCode).toBe(401);
  });

  it('should return error on missing header', () => {
    const req = {
      headers: {},
    } as unknown as Request;

    const res = {} as unknown as Response;
    const next = vi.fn();

    authenticate(req, res, next);

    expect(next).toHaveBeenCalled();
    const error = next.mock.calls[0]?.[0] as { code?: string; statusCode?: number };
    expect(error?.code).toBe('AUTH_TOKEN_INVALID');
    expect(error?.statusCode).toBe(401);
  });
});
