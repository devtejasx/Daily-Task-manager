import mongoose, { Schema, Document } from 'mongoose'

export interface ITimerSession extends Document {
  taskId: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  startedAt: Date
  endedAt?: Date
  duration: number // in seconds
  isPaused: boolean
  pausedAt?: Date
  totalPausedTime: number // in seconds
  sessionType: 'work' | 'break' // For Pomodoro
  focusMode: boolean // Is this in focus mode?
  createdAt: Date
  updatedAt: Date
}

const TimerSessionSchema = new Schema(
  {
    taskId: { type: Schema.Types.ObjectId, ref: 'Task', required: true },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    startedAt: { type: Date, default: Date.now },
    endedAt: Date,
    duration: { type: Number, default: 0 }, // seconds
    isPaused: { type: Boolean, default: false },
    pausedAt: Date,
    totalPausedTime: { type: Number, default: 0 },
    sessionType: { type: String, enum: ['work', 'break'], default: 'work' },
    focusMode: { type: Boolean, default: false },
  },
  { timestamps: true }
)

// Index for user's timer history
TimerSessionSchema.index({ userId: 1, createdAt: -1 })
TimerSessionSchema.index({ taskId: 1 })

export const TimerSession = mongoose.model<ITimerSession>(
  'TimerSession',
  TimerSessionSchema
)
