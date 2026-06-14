import { io, Socket } from 'socket.io-client';
import type { ClientToServerEvents, ServerToClientEvents } from '@studysync/types';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000';

export type StudySyncSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

let socket: StudySyncSocket | null = null;

/**
 * Get or create the Socket.IO client connection.
 * Automatically authenticates with the stored access token.
 */
export function getSocket(): StudySyncSocket {
  if (!socket) {
    const token = localStorage.getItem('accessToken');
    socket = io(SOCKET_URL, {
      auth: { token },
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
  }
  return socket;
}

/**
 * Connect the socket (call after login).
 */
export function connectSocket(): void {
  const s = getSocket();
  if (!s.connected) {
    // Update token in case it changed
    const token = localStorage.getItem('accessToken');
    s.auth = { token };
    s.connect();
  }
}

/**
 * Disconnect the socket (call on logout).
 */
export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
