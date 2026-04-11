import mongoose, { Schema, Document } from 'mongoose'

export interface ITeamInvitation extends Document {
  teamId: mongoose.Types.ObjectId
  invitedEmail: string
  invitedById: mongoose.Types.ObjectId
  status: 'pending' | 'accepted' | 'declined'
  expiresAt: Date
  createdAt: Date
}

const teamInvitationSchema = new Schema<ITeamInvitation>(
  {
    teamId: {
      type: Schema.Types.ObjectId,
      ref: 'Team',
      required: true,
    },
    invitedEmail: {
      type: String,
      required: true,
      lowercase: true,
    },
    invitedById: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined'],
      default: 'pending',
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  },
  {
    timestamps: true,
  }
)

// Index for faster queries
teamInvitationSchema.index({ teamId: 1, status: 1 })
teamInvitationSchema.index({ invitedEmail: 1, status: 1 })
teamInvitationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export const TeamInvitation = mongoose.model<ITeamInvitation>(
  'TeamInvitation',
  teamInvitationSchema
)
