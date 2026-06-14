import type { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from '../config';
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData,
} from '@studysync/types';

export type StudySyncServer = Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

let io: StudySyncServer;

/**
 * Initialize Socket.IO server with JWT authentication and room management.
 */
export function initializeSocket(httpServer: HttpServer): StudySyncServer {
  io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(
    httpServer,
    {
      cors: {
        origin: env.CLIENT_URL,
        methods: ['GET', 'POST'],
        credentials: true,
      },
      pingTimeout: 60000,
      pingInterval: 25000,
    },
  );

  // JWT authentication middleware for socket connections
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token as string | undefined;
      if (!token) {
        next(new Error('Authentication required'));
        return;
      }

      const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as {
        userId: string;
        email: string;
      };
      socket.data.userId = payload.userId;
      socket.data.userName = ''; // Will be populated on connection
      next();
    } catch {
      next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.data.userId;
    console.info(`🔌 Socket connected: ${userId}`);

    // Join personal notification room
    socket.join(`user:${userId}`);

    // Group room management
    socket.on('group:join', (groupId) => {
      socket.join(`group:${groupId}`);
      console.info(`  → User ${userId} joined room group:${groupId}`);
    });

    socket.on('group:leave', (groupId) => {
      socket.leave(`group:${groupId}`);
      console.info(`  ← User ${userId} left room group:${groupId}`);
    });

    // Typing indicator
    socket.on('message:typing', (data) => {
      socket.to(`group:${data.groupId}`).emit('message:typing', {
        groupId: data.groupId,
        userId,
        userName: socket.data.userName,
        isTyping: data.isTyping,
      });
    });

    socket.on('disconnect', () => {
      console.info(`🔌 Socket disconnected: ${userId}`);
    });
  });

  return io;
}

/**
 * Get the Socket.IO server instance.
 * Throws if called before initialization.
 */
export function getIO(): StudySyncServer {
  if (!io) {
    throw new Error('Socket.IO not initialized. Call initializeSocket first.');
  }
  return io;
}
