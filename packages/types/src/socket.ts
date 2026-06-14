import type {
  MessagePublic,
  TaskPublic,
  NotificationPublic,
  MessageReactionPublic,
} from './api';

// ─── Client → Server Events ─────────────────────────────────────────────────

export interface ClientToServerEvents {
  'group:join': (groupId: string) => void;
  'group:leave': (groupId: string) => void;
  'message:send': (data: {
    groupId: string;
    content: string;
    type: 'TEXT' | 'FILE';
    replyToId?: string;
  }) => void;
  'message:reaction': (data: {
    messageId: string;
    emoji: string;
  }) => void;
  'message:typing': (data: {
    groupId: string;
    isTyping: boolean;
  }) => void;
}

// ─── Server → Client Events ─────────────────────────────────────────────────

export interface ServerToClientEvents {
  'message:new': (message: MessagePublic) => void;
  'message:updated': (message: MessagePublic) => void;
  'message:deleted': (data: { messageId: string; groupId: string }) => void;
  'message:reaction:added': (data: {
    messageId: string;
    reaction: MessageReactionPublic;
  }) => void;
  'message:reaction:removed': (data: {
    messageId: string;
    reactionId: string;
  }) => void;
  'message:typing': (data: {
    groupId: string;
    userId: string;
    userName: string;
    isTyping: boolean;
  }) => void;
  'task:created': (task: TaskPublic) => void;
  'task:updated': (task: TaskPublic) => void;
  'task:deleted': (data: { taskId: string; groupId: string }) => void;
  'notification:push': (notification: NotificationPublic) => void;
  'group:member:joined': (data: {
    groupId: string;
    userId: string;
    userName: string;
  }) => void;
  'group:member:left': (data: {
    groupId: string;
    userId: string;
    userName: string;
  }) => void;
}

// ─── Inter-Server Events (for multi-instance setups) ─────────────────────────

export interface InterServerEvents {
  ping: () => void;
}

// ─── Socket Data ─────────────────────────────────────────────────────────────

export interface SocketData {
  userId: string;
  userName: string;
}
