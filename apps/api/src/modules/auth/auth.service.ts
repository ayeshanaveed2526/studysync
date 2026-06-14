import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../../lib/prisma';
import { env } from '../../config';
import { AppError } from '../../middleware/error';
import type { User } from '@prisma/client';
import type { UserDTO, RegisterInput, LoginInput } from '@studysync/types';

export function mapUserToDTO(user: User): UserDTO {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    department: user.department,
    semester: user.semester,
    skills: user.skills,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt.toISOString(),
  };
}

export class AuthService {
  /**
   * Register a new user
   */
  async register(data: RegisterInput) {
    const existing = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existing) {
      throw AppError.conflict('An account with this email address already exists.', 'EMAIL_ALREADY_EXISTS');
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
        passwordHash,
        department: data.department || null,
        semester: data.semester || null,
        skills: data.skills || [],
      },
    });

    const tokens = this.generateTokens(user.id, user.email);
    return { user: mapUserToDTO(user), ...tokens };
  }

  /**
   * Log in user
   */
  async login(data: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (!user || !user.passwordHash) {
      throw AppError.unauthorized('Invalid email or password.', 'INVALID_CREDENTIALS');
    }

    const passwordMatch = await bcrypt.compare(data.password, user.passwordHash);
    if (!passwordMatch) {
      throw AppError.unauthorized('Invalid email or password.', 'INVALID_CREDENTIALS');
    }

    const tokens = this.generateTokens(user.id, user.email);
    return { user: mapUserToDTO(user), ...tokens };
  }

  /**
   * Refresh the access and refresh token pair
   */
  async refresh(refreshToken: string) {
    try {
      const payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as { userId: string };
      
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
      });

      if (!user) {
        throw AppError.unauthorized('User not found.', 'USER_NOT_FOUND');
      }

      const tokens = this.generateTokens(user.id, user.email);
      return { user: mapUserToDTO(user), ...tokens };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw AppError.unauthorized('Refresh token expired. Please login again.', 'REFRESH_TOKEN_EXPIRED');
      }
      throw AppError.unauthorized('Invalid refresh token.', 'INVALID_REFRESH_TOKEN');
    }
  }

  /**
   * Find or create user by Google OAuth details
   */
  async googleOAuth(data: { email: string; name: string; googleId: string; avatarUrl: string | null }) {
    let user = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (user) {
      // If user exists but googleId isn't linked, link it.
      if (!user.googleId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { googleId: data.googleId },
        });
      }
    } else {
      // Create new user
      user = await prisma.user.create({
        data: {
          email: data.email.toLowerCase(),
          name: data.name,
          googleId: data.googleId,
          avatarUrl: data.avatarUrl,
          skills: [],
        },
      });
    }

    return user;
  }

  /**
   * Helper to generate token pair
   */
  generateTokens(userId: string, email: string) {
    const accessToken = jwt.sign(
      { userId, email },
      env.JWT_ACCESS_SECRET,
      { expiresIn: env.JWT_ACCESS_EXPIRY }
    );
    const refreshToken = jwt.sign(
      { userId },
      env.JWT_REFRESH_SECRET,
      { expiresIn: env.JWT_REFRESH_EXPIRY }
    );
    return { accessToken, refreshToken };
  }
}

export const authService = new AuthService();
