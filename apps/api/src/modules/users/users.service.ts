import { v2 as cloudinary } from 'cloudinary';
import { env } from '../../config';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../middleware/error';
import { mapUserToDTO } from '../auth/auth.service';
import type { UpdateProfileInput, UserDTO } from '@studysync/types';

// Configure Cloudinary only if credentials are provided
if (env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
  });
} else {
  console.warn('⚠️ Cloudinary credentials not configured. Avatar uploads will fail.');
}

export class UsersService {
  /**
   * Get user profile details
   */
  async getMe(userId: string): Promise<UserDTO> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw AppError.notFound('User not found.', 'USER_NOT_FOUND');
    }
    return mapUserToDTO(user);
  }

  /**
   * Update profile fields
   */
  async updateMe(userId: string, data: UpdateProfileInput): Promise<UserDTO> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw AppError.notFound('User not found.', 'USER_NOT_FOUND');
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        department: data.department !== undefined ? data.department : undefined,
        semester: data.semester !== undefined ? data.semester : undefined,
        skills: data.skills !== undefined ? data.skills : undefined,
        avatarUrl: data.avatarUrl !== undefined ? data.avatarUrl : undefined,
      },
    });

    return mapUserToDTO(updatedUser);
  }

  /**
   * Upload user avatar to Cloudinary
   */
  async uploadAvatar(userId: string, fileBuffer: Buffer): Promise<UserDTO> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw AppError.notFound('User not found.', 'USER_NOT_FOUND');
    }

    if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
      throw AppError.badRequest('Cloudinary is not configured. Cannot upload avatar.', 'CLOUDINARY_NOT_CONFIGURED');
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'studysync/avatars',
          public_id: `user_${userId}`,
          overwrite: true,
          resource_type: 'image',
        },
        async (error, result) => {
          if (error) {
            reject(AppError.internal(`Avatar upload failed: ${error.message}`));
            return;
          }
          if (!result) {
            reject(AppError.internal('Avatar upload failed: Empty result from Cloudinary.'));
            return;
          }

          try {
            const updated = await prisma.user.update({
              where: { id: userId },
              data: { avatarUrl: result.secure_url },
            });
            resolve(mapUserToDTO(updated));
          } catch (dbError) {
            reject(dbError);
          }
        }
      );

      uploadStream.end(fileBuffer);
    });
  }
}

export const usersService = new UsersService();
