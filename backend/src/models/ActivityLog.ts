import mongoose, { Schema, Document } from 'mongoose'

export interface IActivityLog extends Document {
  userId: mongoose.Types.ObjectId
  teamId?: mongoose.Types.ObjectId
  action: string
  entity: 'task' | 'team' | 'habit'
  entityId: mongoose.Types.ObjectId
  changes?: Record<string, any>
  timestamp: Date
}

const activityLogSchema = new Schema<IActivityLog>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    teamId: {
      type: Schema.Types.ObjectId,
      ref: 'Team',
    },
    action: {
      type: String,
      required: true,
    },
    entity: {
      type: String,
      enum: ['task', 'team', 'habit'],
      required: true,
    },
    entityId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    changes: {
      type: Schema.Types.Mixed,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
)

// Index for real-time activity streams
activityLogSchema.index({ userId: 1, timestamp: -1 })
activityLogSchema.index({ teamId: 1, timestamp: -1 })
activityLogSchema.index({ timestamp: -1 })

export const ActivityLog = mongoose.model<IActivityLog>(
  'ActivityLog',
  activityLogSchema
)
