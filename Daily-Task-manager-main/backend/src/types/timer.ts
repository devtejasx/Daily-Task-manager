// File: backend/src/types/timer.ts
// Timer-related TypeScript types

export interface ITimerSession {
  _id: string
  taskId: string
  userId: string
  startedAt: Date
  endedAt?: Date
  duration: number // in seconds
  isPaused: boolean
  pausedAt?: Date
  totalPausedTime: number // in seconds
  sessionType: 'work' | 'break'
  focusMode: boolean
  createdAt: Date
  updatedAt: Date
}

export interface StartTimerRequest {
  focusMode?: boolean
}

export interface StartTimerResponse {
  success: boolean
  data: ITimerSession
  message: string
}

export interface StopTimerResponse {
  success: boolean
  data: ITimerSession
  durationMinutes: number
  message: string
}

export interface PauseTimerRequest {
  isPaused: boolean
}

export interface PauseTimerResponse {
  success: boolean
  data: ITimerSession
  isPaused: boolean
  message: string
}

export interface TimerHistoryResponse {
  success: boolean
  data: {
    sessions: ITimerSession[]
    totalMinutes: number
    sessionCount: number
    averageSessionMinutes: number
  }
}

export interface DailyStatsResponse {
  success: boolean
  data: {
    totalMinutesToday: number
    sessionsCount: number
    workSessionsCount: number
    breakSessionsCount: number
    focusSessionsCount: number
    averageSessionMinutes: number
  }
}

export interface WeeklyStatsDay {
  date: string
  totalSeconds: number
  sessionCount: number
  focusSessionCount: number
  totalMinutes: number
}

export interface WeeklyStatsResponse {
  success: boolean
  data: {
    byDay: WeeklyStatsDay[]
    totalMinutesWeek: number
    totalSessionsWeek: number
    averageMinutesPerDay: number
  }
}

export type TimerSessionType = 'work' | 'break'
