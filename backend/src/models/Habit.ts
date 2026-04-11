import mongoose, { Schema, Document } from 'mongoose'

export interface IHabit extends Document {
  userId: mongoose.Types.ObjectId
  name: string
  description?: string
  category: string
  frequency: 'daily' | 'weekly' | 'monthly'
  targetDays: number[] // 0-6 for weekly, 1-31 for monthly
  streak: number
  longestStreak: number
  lastCompletedDate?: Date
  completedDates: Date[]
  isActive: boolean
  color?: string
  icon?: string
  reminderTime?: string
  createdAt: Date
  updatedAt: Date
}

const habitSchema = new Schema<IHabit>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      required: true,
      enum: ['Health', 'Fitness', 'Productivity', 'Learning', 'Personal', 'Other'],
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      default: 'daily',
    },
    targetDays: [Number],
    streak: {
      type: Number,
      default: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
    },
    lastCompletedDate: Date,
    completedDates: [
      {
        type: Date,
        default: Date.now,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    color: {
      type: String,
      default: '#3b82f6',
    },
    icon: {
      type: String,
      default: '⭐',
    },
    reminderTime: {
      type: String,
      default: '09:00',
    },
  },
  {
    timestamps: true,
  }
)

// Index for faster queries
habitSchema.index({ userId: 1, isActive: 1 })
habitSchema.index({ userId: 1, createdAt: -1 })
habitSchema.index({ lastCompletedDate: 1 })

export const Habit = mongoose.model<IHabit>('Habit', habitSchema)
