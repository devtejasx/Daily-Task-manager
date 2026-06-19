export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginationQuery {
  page?: number
  limit?: number
  sort?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  pages: number
}

export interface AuthRequest {
  email: string
  password: string
  name?: string
}

export interface JWTPayload {
  userId: string
  email: string
  iat?: number
  exp?: number
}

// Enums for tasks
export enum TaskStatus {
  NotStarted = 'not_started',
  InProgress = 'in_progress',
  Completed = 'completed',
  OnHold = 'on_hold',
  Cancelled = 'cancelled',
}

export enum TaskPriority {
  Low = 'low',
  Medium = 'medium',
  High = 'high',
  Critical = 'critical',
}

export enum TaskDifficulty {
  Easy = 'easy',
  Medium = 'medium',
  Hard = 'hard',
  VeryHard = 'very_hard',
}
