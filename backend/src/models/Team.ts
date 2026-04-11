import mongoose, { Schema, Document } from 'mongoose'

export interface ITeam extends Document {
  name: string
  description?: string
  ownerId: mongoose.Types.ObjectId
  members: mongoose.Types.ObjectId[]
  memberRoles: Map<string, 'admin' | 'member' | 'viewer'>
  sharedTasks: mongoose.Types.ObjectId[]
  createdAt: Date
  updatedAt: Date
}

const teamSchema = new Schema<ITeam>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    memberRoles: {
      type: Map,
      of: String,
      default: new Map(),
    },
    sharedTasks: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Task',
      },
    ],
  },
  {
    timestamps: true,
  }
)

// Index for faster queries
teamSchema.index({ ownerId: 1 })
teamSchema.index({ members: 1 })
teamSchema.index({ createdAt: -1 })

export const Team = mongoose.model<ITeam>('Team', teamSchema)
