import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import { env } from './config';
import { errorHandler, generalLimiter } from './middleware';
import { initializeSocket } from './socket';
import { authRouter } from './modules/auth';
import { usersRouter } from './modules/users';

// ─── App Setup ───────────────────────────────────────────────────────────────

const app = express();
const httpServer = createServer(app);

// ─── Core Middleware ─────────────────────────────────────────────────────────

app.use(generalLimiter);
app.use(helmet());
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());

// ─── Health Check ────────────────────────────────────────────────────────────

app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
    },
  });
});

// ─── API Routes ──────────────────────────────────────────────────────────────

app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);

// ─── Error Handler (must be last middleware) ─────────────────────────────────

app.use(errorHandler);

// ─── Socket.IO ───────────────────────────────────────────────────────────────

initializeSocket(httpServer);

// ─── Start Server ────────────────────────────────────────────────────────────

httpServer.listen(env.PORT, () => {
  console.info(`
  ╔══════════════════════════════════════════════════╗
  ║                                                  ║
  ║     🚀 StudySync API Server                      ║
  ║                                                  ║
  ║     Port:        ${String(env.PORT).padEnd(29)}║
  ║     Environment: ${env.NODE_ENV.padEnd(29)}║
  ║     Health:      http://localhost:${env.PORT}/api/health  ║
  ║                                                  ║
  ╚══════════════════════════════════════════════════╝
  `);
});

export { app, httpServer };
