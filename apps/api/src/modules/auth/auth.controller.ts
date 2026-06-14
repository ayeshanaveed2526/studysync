import type { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import { env } from '../../config';
import type { CookieOptions } from 'express';

const COOKIE_NAME = 'refreshToken';

const getCookieOptions = (): CookieOptions => {
  const isProduction = env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };
};

export class AuthController {
  /**
   * Register user
   */
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { user, accessToken, refreshToken } = await authService.register(req.body);
      
      res.cookie(COOKIE_NAME, refreshToken, getCookieOptions());
      res.status(201).json({
        success: true,
        data: {
          user,
          accessToken,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Login user
   */
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { user, accessToken, refreshToken } = await authService.login(req.body);

      res.cookie(COOKIE_NAME, refreshToken, getCookieOptions());
      res.status(200).json({
        success: true,
        data: {
          user,
          accessToken,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Refresh token
   */
  async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = req.cookies[COOKIE_NAME] || req.body.refreshToken;
      
      if (!token) {
        res.status(401).json({
          success: false,
          error: 'Refresh token is missing.',
          code: 'REFRESH_TOKEN_MISSING',
        });
        return;
      }

      const { user, accessToken, refreshToken: newRefreshToken } = await authService.refresh(token);

      res.cookie(COOKIE_NAME, newRefreshToken, getCookieOptions());
      res.status(200).json({
        success: true,
        data: {
          user,
          accessToken,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Logout user
   */
  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const isProduction = env.NODE_ENV === 'production';
      res.clearCookie(COOKIE_NAME, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
      });
      res.status(200).json({
        success: true,
        data: null,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handle Google OAuth Success callback
   */
  async googleCallback(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userObj = req.user;
      if (!userObj) {
        res.redirect(`${env.CLIENT_URL}/login?error=oauth_failed`);
        return;
      }

      const { accessToken, refreshToken } = authService.generateTokens(userObj.userId, userObj.email);

      res.cookie(COOKIE_NAME, refreshToken, getCookieOptions());
      res.redirect(`${env.CLIENT_URL}/auth/callback?token=${accessToken}`);
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
