import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService } from '../modules/auth/auth.service';
import { prisma } from '../lib/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '../config';

vi.mock('../lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}));

describe('AuthService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('register', () => {
    it('should register a user and return tokens', async () => {
      const mockUser = {
        id: 'user-123',
        name: 'John Doe',
        email: 'john@example.com',
        passwordHash: 'hashedpassword',
        department: null,
        semester: null,
        skills: [],
        avatarUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        googleId: null,
      };

      vi.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);
      vi.spyOn(prisma.user, 'create').mockResolvedValue(mockUser);

      const result = await authService.register({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123',
      });

      expect(result.user.email).toBe('john@example.com');
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });

    it('should throw conflict if user email exists', async () => {
      const mockUser = {
        id: 'user-123',
        name: 'John Doe',
        email: 'john@example.com',
        passwordHash: 'hashedpassword',
        department: null,
        semester: null,
        skills: [],
        avatarUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        googleId: null,
      };

      vi.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser);

      await expect(
        authService.register({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'Password123',
        })
      ).rejects.toThrow('An account with this email address already exists.');
    });
  });

  describe('login', () => {
    it('should login user and return tokens on correct credentials', async () => {
      const hash = await bcrypt.hash('Password123', 12);
      const mockUser = {
        id: 'user-123',
        name: 'John Doe',
        email: 'john@example.com',
        passwordHash: hash,
        department: null,
        semester: null,
        skills: [],
        avatarUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        googleId: null,
      };

      vi.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser);

      const result = await authService.login({
        email: 'john@example.com',
        password: 'Password123',
      });

      expect(result.user.email).toBe('john@example.com');
      expect(result.accessToken).toBeDefined();
    });

    it('should throw on incorrect password', async () => {
      const hash = await bcrypt.hash('Password123', 12);
      const mockUser = {
        id: 'user-123',
        name: 'John Doe',
        email: 'john@example.com',
        passwordHash: hash,
        department: null,
        semester: null,
        skills: [],
        avatarUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        googleId: null,
      };

      vi.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser);

      await expect(
        authService.login({
          email: 'john@example.com',
          password: 'WrongPassword',
        })
      ).rejects.toThrow('Invalid email or password.');
    });
  });

  describe('refresh', () => {
    it('should rotate token pair', async () => {
      const mockUser = {
        id: 'user-123',
        name: 'John Doe',
        email: 'john@example.com',
        passwordHash: 'hash',
        department: null,
        semester: null,
        skills: [],
        avatarUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        googleId: null,
      };

      vi.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser);

      const refreshToken = jwt.sign({ userId: 'user-123' }, env.JWT_REFRESH_SECRET);
      const result = await authService.refresh(refreshToken);

      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });
  });
});
