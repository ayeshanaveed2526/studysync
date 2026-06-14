import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { env } from './env';
import { authService } from '../modules/auth/auth.service';

if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        callbackURL: env.GOOGLE_CALLBACK_URL,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          const name = profile.displayName;
          const googleId = profile.id;
          const avatarUrl = profile.photos?.[0]?.value || null;

          if (!email) {
            return done(new Error('No email returned from Google OAuth'));
          }

          const user = await authService.googleOAuth({
            email,
            name,
            googleId,
            avatarUrl,
          });

          return done(null, {
            userId: user.id,
            email: user.email,
          });
        } catch (error) {
          return done(error as Error);
        }
      }
    )
  );
} else {
  console.warn('⚠️ Google OAuth credentials not found in env. Passport strategy not registered.');
}

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user as { userId: string; email: string });
});
