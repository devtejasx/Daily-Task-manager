// Enums
// Values mirror the backend enum (backend/src/types/common.ts), which is
// the source of truth: these exact strings are what the API stores and
// serves. Use TASK_STATUS_LABELS for display.
export enum TaskStatus {
  Pending = 'pending',
  InProgress = 'in_progress',
  Completed = 'completed',
  OnHold = 'on_hold',
  Cancelled = 'cancelled',
}

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  [TaskStatus.Pending]: 'Pending',
  [TaskStatus.InProgress]: 'In Progress',
  [TaskStatus.Completed]: 'Completed',
  [TaskStatus.OnHold]: 'On Hold',
  [TaskStatus.Cancelled]: 'Cancelled',
}

export const formatTaskStatus = (status: string): string =>
  TASK_STATUS_LABELS[status as TaskStatus] ?? status

export enum TaskPriority {
  Critical = 'critical',
  High = 'high',
  Medium = 'medium',
  Low = 'low',
}

export enum TaskDifficulty {
  Easy = 'easy',
  Medium = 'medium',
  Hard = 'hard',
}

export enum RecurrenceType {
  Daily = 'Daily',
  Weekly = 'Weekly',
  Monthly = 'Monthly',
  Yearly = 'Yearly',
  Custom = 'Custom',
}

export enum ReminderType {
  InApp = 'InApp',
  Email = 'Email',
  SMS = 'SMS',
  Browser = 'Browser',
  Push = 'Push',
}

export enum UserRole {
  Admin = 'Admin',
  Manager = 'Manager',
  Member = 'Member',
  Viewer = 'Viewer',
}

export enum AchievementType {
  Completion = 'Completion',
  Consistency = 'Consistency',
  Mastery = 'Mastery',
  Special = 'Special',
}

// Interfaces
export interface IReminder {
  id: string
  time: number
  unit: 'minutes' | 'hours' | 'days'
  type: ReminderType
  sent?: boolean
  sentAt?: Date
}

export interface IAttachment {
  id: string
  name: string
  url: string
  type: string
  size: number
  uploadedAt: Date
}

export interface IComment {
  id: string
  author: IUser
  text: string
  timestamp: Date
  edited?: boolean
}

export interface IRecurrencePattern {
  frequency: string
  interval: number
  daysOfWeek?: number[]
  endDate?: string
  occurrences?: number
}

export interface ICollaborator {
  id: string
  name: string
  email: string
  role: UserRole
  joinedAt: Date
}

export interface ISubtask {
  _id: string
  title: string
  description?: string
  completed: boolean
  completedAt?: Date
  estimatedTime?: number // in minutes
  actualTime?: number // in minutes
  order: number
  createdAt: Date
  updatedAt: Date
}

export interface ITask {
  id: string
  title: string
  description?: string
  dueDate?: string
  dueTime?: string
  startDate?: string
  startTime?: string
  estimatedDuration?: number
  category: string
  tags: string[]
  subCategory?: string
  priority: TaskPriority
  status: TaskStatus
  difficulty: TaskDifficulty
  isRecurring: boolean
  recurrencePattern?: IRecurrencePattern
  reminders: IReminder[]
  attachments: IAttachment[]
  notes?: string
  xpReward: number
  sharedWith: string[]
  assignedTo?: string
  collaborators: ICollaborator[]
  comments: IComment[]
  createdAt: Date
  updatedAt: Date
  completedAt?: Date
  startedAt?: Date
  timeSpent: number
  completionPercentage: number
  habitId?: string
  isHabit: boolean
  streak: number
  suggestedPriority?: TaskPriority
  aiSuggestions?: string[]
  estimatedCompletionTime?: number
  subtasks?: ISubtask[]
}

export interface IUser {
  id: string
  email: string
  name: string
  avatar?: string
  password?: string
  level: number
  totalXp: number
  streak: number
  longestStreak: number
  completedTasks: number
  theme: 'light' | 'dark'
  settings: {
    notifications: boolean
    emailNotifications: boolean
    quietHours?: { start: string; end: string }
    soundEnabled: boolean
  }
  createdAt: Date
  updatedAt: Date
  lastLoginAt?: Date
}

export interface IAchievement {
  id: string
  name: string
  description: string
  icon: string
  type: AchievementType
  requirement: number
  unlockedAt: Date
  userId: string
}

export interface ILeaderboardEntry {
  rank: number
  userId: string
  userName: string
  avatar?: string
  xp: number
  level: number
  completedCount: number
  streak: number
}

export interface IDashboardStats {
  todayCompleted: number
  todayTotal: number
  weekCompleted: number
  weekTotal: number
  monthCompleted: number
  monthTotal: number
  currentStreak: number
  longestStreak: number
  totalCompleted: number
  completionRate: number
  overdueTasks: number
}

export interface IProductivityMetrics {
  completionRate: number
  onTimeRate: number
  averageTimeSpent: number
  peakProductivityHour: number
  categoryPerformance: Record<string, number>
  priorityDistribution: Record<TaskPriority, number>
  consistencyScore: number
}

export interface IApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  timestamp: Date
}

export interface IAuthResponse {
  token: string
  refreshToken: string
  user: IUser
}

export interface IPaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}
