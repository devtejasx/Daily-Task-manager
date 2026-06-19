import mongoose, { Schema, Document } from 'mongoose'

export interface INotificationDocument extends Document {
  userId: mongoose.Types.ObjectId
  type: string
  title: string
  message: string
  taskId?: mongoose.Types.ObjectId
  read: boolean
  readAt?: Date
  createdAt: Date
}

const notificationSchema = new Schema<INotificationDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: String,
    title: String,
    message: String,
    taskId: { type: Schema.Types.ObjectId, ref: 'Task' },
    read: { type: Boolean, default: false },
    readAt: Date,
  },
  { timestamps: true }
)

notificationSchema.index({ userId: 1, createdAt: -1 })
notificationSchema.index({ read: 1 })

export const Notification = mongoose.model<INotificationDocument>(
  'Notification',
  notificationSchema
)
