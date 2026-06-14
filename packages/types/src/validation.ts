import { z } from 'zod';

// ─── Auth Schemas ────────────────────────────────────────────────────────────

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  department: z.string().max(100).optional(),
  semester: z.number().int().min(1).max(12).optional(),
  skills: z.array(z.string().max(50)).max(20).optional(),
});

// ─── Group Schemas ───────────────────────────────────────────────────────────

export const groupTypeSchema = z.enum(['ASSIGNMENT', 'PROJECT', 'STUDY']);

export const createGroupSchema = z.object({
  name: z.string().min(2, 'Group name must be at least 2 characters').max(100),
  description: z.string().max(500).optional(),
  type: groupTypeSchema,
});

export const updateGroupSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().max(500).optional(),
});

export const joinGroupSchema = z.object({
  inviteCode: z.string().min(1, 'Invite code is required'),
});

// ─── Task Schemas ────────────────────────────────────────────────────────────

export const prioritySchema = z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']);
export const taskStatusSchema = z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED']);

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(2000).optional(),
  priority: prioritySchema.default('MEDIUM'),
  status: taskStatusSchema.default('TODO'),
  assignedToId: z.string().uuid().optional(),
  dueDate: z.string().datetime().optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  priority: prioritySchema.optional(),
  status: taskStatusSchema.optional(),
  assignedToId: z.string().uuid().nullable().optional(),
  dueDate: z.string().datetime().nullable().optional(),
});

// ─── Message Schemas ─────────────────────────────────────────────────────────

export const messageTypeSchema = z.enum(['TEXT', 'FILE', 'AI_SUMMARY', 'SYSTEM']);

export const sendMessageSchema = z.object({
  content: z.string().min(1, 'Message cannot be empty').max(5000),
  type: messageTypeSchema.default('TEXT'),
  replyToId: z.string().uuid().optional(),
});

export const addReactionSchema = z.object({
  emoji: z.string().min(1).max(10),
});

// ─── File Schemas ────────────────────────────────────────────────────────────

export const fileUploadSchema = z.object({
  fileName: z.string().min(1).max(255),
  mimeType: z.string().min(1),
  fileSize: z.number().int().positive().max(50 * 1024 * 1024), // 50MB max
});

// ─── Note Schemas ────────────────────────────────────────────────────────────

export const createNoteSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  content: z.record(z.unknown()).default({}),
});

export const updateNoteSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.record(z.unknown()).optional(),
});

// ─── Meeting Schemas ─────────────────────────────────────────────────────────

export const createMeetingSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  scheduledAt: z.string().datetime(),
  duration: z.number().int().min(5).max(480).optional(),
  notes: z.string().max(5000).optional(),
});

export const updateMeetingSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  scheduledAt: z.string().datetime().optional(),
  duration: z.number().int().min(5).max(480).optional(),
  notes: z.string().max(5000).optional(),
});

// ─── Peer Evaluation Schemas ─────────────────────────────────────────────────

export const createEvaluationSchema = z.object({
  evaluatedId: z.string().uuid(),
  contribution: z.number().int().min(1).max(5),
  communication: z.number().int().min(1).max(5),
  quality: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

// ─── AI Schemas ──────────────────────────────────────────────────────────────

export const aiAssistantSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required').max(5000),
});

// ─── Pagination Schema ──────────────────────────────────────────────────────

export const paginationSchema = z.object({
  cursor: z.string().uuid().optional(),
  limit: z.number().int().min(1).max(50).default(20),
});

// ─── Type Exports ────────────────────────────────────────────────────────────

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type CreateGroupInput = z.infer<typeof createGroupSchema>;
export type UpdateGroupInput = z.infer<typeof updateGroupSchema>;
export type JoinGroupInput = z.infer<typeof joinGroupSchema>;
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type AddReactionInput = z.infer<typeof addReactionSchema>;
export type FileUploadInput = z.infer<typeof fileUploadSchema>;
export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;
export type CreateMeetingInput = z.infer<typeof createMeetingSchema>;
export type UpdateMeetingInput = z.infer<typeof updateMeetingSchema>;
export type CreateEvaluationInput = z.infer<typeof createEvaluationSchema>;
export type AiAssistantInput = z.infer<typeof aiAssistantSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
