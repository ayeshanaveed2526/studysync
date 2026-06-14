import type { Request, Response, NextFunction } from 'express';
import { usersService } from './users.service';
import { AppError } from '../../middleware/error';

export class UsersController {
  /**
   * Get current authenticated user details
   */
  async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw AppError.unauthorized('Not authenticated.', 'NOT_AUTHENTICATED');
      }

      const user = await usersService.getMe(userId);
      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update profile fields
   */
  async updateMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw AppError.unauthorized('Not authenticated.', 'NOT_AUTHENTICATED');
      }

      const user = await usersService.updateMe(userId, req.body);
      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Upload and update user avatar image
   */
  async uploadAvatar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw AppError.unauthorized('Not authenticated.', 'NOT_AUTHENTICATED');
      }

      const file = req.file;
      if (!file) {
        throw AppError.badRequest('No file uploaded.', 'MISSING_FILE');
      }

      const updatedUser = await usersService.uploadAvatar(userId, file.buffer);
      res.status(200).json({
        success: true,
        data: updatedUser,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const usersController = new UsersController();
