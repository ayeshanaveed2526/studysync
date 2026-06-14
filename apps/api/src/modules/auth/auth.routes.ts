import { Router } from 'express';
import passport from 'passport';
import { authController } from './auth.controller';
import { validate } from '../../middleware/validate';
import { authLimiter } from '../../middleware/rateLimiter';
import { registerSchema, loginSchema } from '@studysync/types';

const router = Router();

// Credentials routes
router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);

// Google OAuth routes
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
  })
);

router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/api/auth/google/failure',
    session: false,
  }),
  authController.googleCallback
);

// Fallback path if strategy authentication fails
router.get('/google/failure', (_req, res) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  res.redirect(`${clientUrl}/login?error=oauth_failed`);
});

export default router;
