import mongoose, { Schema, Document } from 'mongoose'
import bcryptjs from 'bcryptjs'

export interface IUserDocument extends Document {
  email: string
  name: string
  password: string
  avatar?: string
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
  comparePassword(candidatePassword: string): Promise<boolean>
}

const userSchema = new Schema<IUserDocument>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: { type: String, required: true },
    password: { type: String, required: true },
    avatar: String,
    level: { type: Number, default: 1 },
    totalXp: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    completedTasks: { type: Number, default: 0 },
    theme: { type: String, enum: ['light', 'dark'], default: 'light' },
    settings: {
      notifications: { type: Boolean, default: true },
      emailNotifications: { type: Boolean, default: true },
      quietHours: {
        start: String,
        end: String,
      },
      soundEnabled: { type: Boolean, default: true },
    },
    lastLoginAt: Date,
  },
  { timestamps: true }
)

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()

  try {
    const salt = await bcryptjs.genSalt(10)
    this.password = await bcryptjs.hash(this.password, salt)
    next()
  } catch (error) {
    next(error as Error)
  }
})

// Method to compare passwords
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcryptjs.compare(candidatePassword, this.password)
}

userSchema.index({ email: 1 })
userSchema.index({ createdAt: -1 })

export const User = mongoose.model<IUserDocument>('User', userSchema)
