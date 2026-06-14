import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './config';
import { errorHandler } from './middleware';
import { initializeSocket } from './socket';

// ─── App Setup ───────────────────────────────────────────────────────────────

const app = express();
const httpServer = createServer(app);

// ─── Core Middleware ─────────────────────────────────────────────────────────

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
// Routes will be registered here as features are implemented.
// Example: app.use('/api/auth', authRouter);

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
