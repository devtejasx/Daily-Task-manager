// Timer session as serialized by the REST API (ObjectIds and Dates arrive
// as strings over JSON). Mirrors backend/src/models/TimerSession.ts.
export interface ITimerSession {
  _id: string
  taskId: string
  userId: string
  startedAt: string
  endedAt?: string
  duration: number // in seconds
  isPaused: boolean
  pausedAt?: string
  totalPausedTime: number // in seconds
  sessionType: 'work' | 'break'
  focusMode: boolean
  createdAt: string
  updatedAt: string
}
