import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load .env file from the api root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CLIENT_URL: z.string().url('CLIENT_URL must be a valid URL').default('http://localhost:3000'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required').default('postgresql://studysync:studysync_dev@localhost:5432/studysync'),
  REDIS_URL: z.string().min(1, 'REDIS_URL is required').default('redis://localhost:6379'),
  JWT_ACCESS_SECRET: z.string().min(1, 'JWT_ACCESS_SECRET is required').default('dev-access-secret-change-me'),
  JWT_REFRESH_SECRET: z.string().min(1, 'JWT_REFRESH_SECRET is required').default('dev-refresh-secret-change-me'),
  GOOGLE_CLIENT_ID: z.string().default(''),
  GOOGLE_CLIENT_SECRET: z.string().default(''),
  GOOGLE_CALLBACK_URL: z.string().url().default('http://localhost:4000/api/auth/google/callback'),
  CLOUDINARY_CLOUD_NAME: z.string().default(''),
  CLOUDINARY_API_KEY: z.string().default(''),
  CLOUDINARY_API_SECRET: z.string().default(''),
  OPENAI_API_KEY: z.string().default(''),
  RESEND_API_KEY: z.string().default(''),
});

// Helper to convert empty string environment variables to undefined so Zod defaults kick in
const cleanedEnv = Object.fromEntries(
  Object.entries(process.env).map(([key, value]) => [key, value === '' ? undefined : value])
);

const parsed = envSchema.safeParse(cleanedEnv);

if (!parsed.success) {
  const errorDetails = parsed.error.errors
    .map((e) => `${e.path.join('.')}: ${e.message}`)
    .join(', ');
  console.error('❌ Environment validation failed:', errorDetails);
  throw new Error(`Invalid environment variables: ${errorDetails}`);
}

export const env = {
  ...parsed.data,
  isDev: parsed.data.NODE_ENV === 'development',
  isProd: parsed.data.NODE_ENV === 'production',
  JWT_ACCESS_EXPIRY: '15m',
  JWT_REFRESH_EXPIRY: '7d',
} as const;
