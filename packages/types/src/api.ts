// ─── API Response Types ──────────────────────────────────────────────────────

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  code: string;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface PaginatedResponse<T> {
  items: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

// ─── User Types ──────────────────────────────────────────────────────────────

export interface UserPublic {
  id: string;
  name: string;
  email: string;
  department: string | null;
  semester: number | null;
  skills: string[];
  avatarUrl: string | null;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: UserPublic;
  tokens: AuthTokens;
}

// ─── Group Types ─────────────────────────────────────────────────────────────

export type GroupType = 'ASSIGNMENT' | 'PROJECT' | 'STUDY';
export type MemberRole = 'ADMIN' | 'LEADER' | 'MEMBER';

export interface GroupMemberPublic {
  id: string;
  userId: string;
  role: MemberRole;
  joinedAt: string;
  user: UserPublic;
}

export interface GroupPublic {
  id: string;
  name: string;
  description: string | null;
  type: GroupType;
  inviteCode: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  members: GroupMemberPublic[];
  _count?: {
    tasks: number;
    messages: number;
    files: number;
  };
}

// ─── Task Types ──────────────────────────────────────────────────────────────

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'COMPLETED';

export interface TaskPublic {
  id: string;
  groupId: string;
  title: string;
  description: string | null;
  priority: Priority;
  status: TaskStatus;
  assignedToId: string | null;
  createdById: string;
  dueDate: string | null;
  aiAssigned: boolean;
  createdAt: string;
  updatedAt: string;
  assignedTo: UserPublic | null;
  createdBy: UserPublic;
}

// ─── Message Types ───────────────────────────────────────────────────────────

export type MessageType = 'TEXT' | 'FILE' | 'AI_SUMMARY' | 'SYSTEM';

export interface MessageReactionPublic {
  id: string;
  emoji: string;
  userId: string;
}

export interface MessagePublic {
  id: string;
  groupId: string;
  senderId: string;
  content: string;
  type: MessageType;
  replyToId: string | null;
  sentAt: string;
  sender: UserPublic;
  reactions: MessageReactionPublic[];
  replyTo?: MessagePublic | null;
}

// ─── File Types ──────────────────────────────────────────────────────────────

export interface FilePublic {
  id: string;
  groupId: string;
  uploadedById: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  version: number;
  uploadedAt: string;
  uploadedBy: UserPublic;
}

// ─── Note Types ──────────────────────────────────────────────────────────────

export interface NotePublic {
  id: string;
  groupId: string;
  title: string;
  content: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

// ─── Meeting Types ───────────────────────────────────────────────────────────

export interface MeetingAttendancePublic {
  id: string;
  userId: string;
  present: boolean;
}

export interface MeetingPublic {
  id: string;
  groupId: string;
  title: string;
  scheduledAt: string;
  duration: number | null;
  notes: string | null;
  createdAt: string;
  attendances: MeetingAttendancePublic[];
}

// ─── Notification Types ──────────────────────────────────────────────────────

export type NotificationType =
  | 'TASK_ASSIGNED'
  | 'TASK_DUE_SOON'
  | 'TASK_OVERDUE'
  | 'FILE_UPLOADED'
  | 'MENTION'
  | 'GROUP_INVITE'
  | 'MEETING_REMINDER'
  | 'AI_SUMMARY_READY'
  | 'PEER_EVAL_REQUEST';

export interface NotificationPublic {
  id: string;
  userId: string;
  type: NotificationType;
  entityType: string;
  entityId: string;
  message: string;
  read: boolean;
  createdAt: string;
}

// ─── Peer Evaluation Types ───────────────────────────────────────────────────

export interface PeerEvaluationPublic {
  id: string;
  groupId: string;
  evaluatorId: string;
  evaluatedId: string;
  contribution: number;
  communication: number;
  quality: number;
  comment: string | null;
  createdAt: string;
  evaluator: UserPublic;
  evaluated: UserPublic;
}

// ─── AI Types ────────────────────────────────────────────────────────────────

export interface AiTaskAssignment {
  taskId: string;
  assignedToUserId: string;
  reason: string;
}

export interface AiTaskDistributionResponse {
  assignments: AiTaskAssignment[];
}

export interface AiAssignmentBreakdown {
  title: string;
  requirements: string[];
  deliverables: string[];
  suggestedTasks: {
    title: string;
    description: string;
    estimatedHours: number;
    priority: Priority;
  }[];
}

export interface AiPromptPublic {
  id: string;
  groupId: string;
  userId: string;
  prompt: string;
  response: string;
  tokens: number | null;
  createdAt: string;
  user: UserPublic;
}

export interface AiSummaryPublic {
  id: string;
  groupId: string;
  content: string;
  date: string;
  createdAt: string;
}
