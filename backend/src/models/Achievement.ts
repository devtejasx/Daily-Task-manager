import mongoose, { Schema, Document } from 'mongoose'

export interface IAchievementDocument extends Document {
  userId: mongoose.Types.ObjectId
  name: string
  description: string
  icon: string
  type: string
  requirement: number
  progress: number
  unlockedAt?: Date
}

const achievementSchema = new Schema<IAchievementDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    description: String,
    icon: String,
    type: {
      type: String,
      enum: ['Completion', 'Consistency', 'Mastery', 'Special'],
      default: 'Completion',
    },
    requirement: Number,
    progress: { type: Number, default: 0 },
    unlockedAt: Date,
  },
  { timestamps: true }
)

achievementSchema.index({ userId: 1 })
achievementSchema.index({ unlockedAt: 1 })

export const Achievement = mongoose.model<IAchievementDocument>(
  'Achievement',
  achievementSchema
)
