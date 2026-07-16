/**
 * Core types for the Task Manager UI.
 *
 * Kept intentionally simple (plain serializable values) so the same shapes
 * can be stored in Firebase Firestore documents later without any mapping.
 */

export type Priority = 'High' | 'Medium' | 'Low'
export type Status = 'Pending' | 'Completed'

export interface Task {
  id: string
  title: string
  description: string
  priority: Priority
  status: Status
  dueDate: string // ISO date string (yyyy-MM-dd) — Firestore friendly
  category: string
  important: boolean
  createdAt: string // ISO timestamp
  completedAt?: string // ISO timestamp, set when marked complete
  userId?: string // Firestore owner uid, set by taskService
}

/** Payload for creating/updating a task (id, owner + timestamps are managed by the service). */
export type TaskInput = Omit<Task, 'id' | 'createdAt' | 'completedAt' | 'userId'>

export type TaskFilter = 'all' | 'completed' | 'pending' | 'high' | 'important'

export type SortOption = 'dueDate' | 'priority' | 'newest' | 'oldest'

export interface UserProfile {
  id: string
  name: string
  email: string
  avatar?: string
}

export interface NotificationSettings {
  email: boolean
  push: boolean
  taskReminders: boolean
  weeklySummary: boolean
}

export const CATEGORIES = ['Work', 'Personal', 'Study', 'Health', 'Shopping', 'Other'] as const

export const PRIORITY_ORDER: Record<Priority, number> = { High: 0, Medium: 1, Low: 2 }
