import mongoose, { Schema, Document } from 'mongoose'
import { TaskStatus, TaskPriority, TaskDifficulty, RecurrenceType } from '../types'

// Subtask interface
export interface ISubtask {
  _id: mongoose.Types.ObjectId
  title: string
  description?: string
  completed: boolean
  completedAt?: Date
  estimatedTime?: number // in minutes
  actualTime?: number // in minutes
  order: number // for ordering subtasks
  createdAt: Date
  updatedAt: Date
}

export interface ITaskDocument extends Document {
  title: string
  description?: string
  dueDate?: Date
  dueTime?: string
  startDate?: Date
  startTime?: string
  estimatedDuration?: number
  category: string
  tags: string[]
  priority: TaskPriority
  status: TaskStatus
  difficulty: TaskDifficulty
  isRecurring: boolean
  recurrencePattern?: {
    frequency: string
    interval: number
    daysOfWeek?: number[]
    endDate?: Date
    occurrences?: number
  }
  reminders: Array<{
    time: number
    unit: string
    type: string
    sent?: boolean
  }>
  attachments: Array<{
    name: string
    url: string
    type: string
    size: number
  }>
  notes?: string
  xpReward: number
  userId: mongoose.Types.ObjectId
  sharedWith: mongoose.Types.ObjectId[]
  assignedTo?: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
  completedAt?: Date
  timeSpent: number
  completionPercentage: number
  subtasks: ISubtask[]
}

const attachmentSchema = new Schema({
  name: String,
  url: String,
  type: String,
  size: Number,
  uploadedAt: { type: Date, default: Date.now },
})

const reminderSchema = new Schema({
  time: Number,
  unit: { type: String, enum: ['minutes', 'hours', 'days'] },
  type: String,
  sent: { type: Boolean, default: false },
})

const recurrenceSchema = new Schema({
  frequency: String,
  interval: Number,
  daysOfWeek: [Number],
  endDate: Date,
  occurrences: Number,
})

const subtaskSchema = new Schema({
  title: { type: String, required: true },
  description: String,
  completed: { type: Boolean, default: false },
  completedAt: Date,
  estimatedTime: Number,
  actualTime: Number,
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

const taskSchema = new Schema<ITaskDocument>(
  {
    title: { type: String, required: true },
    description: String,
    dueDate: Date,
    dueTime: String,
    startDate: Date,
    startTime: String,
    estimatedDuration: Number,
    category: { type: String, required: true, default: 'Personal' },
    tags: [String],
    priority: {
      type: String,
      enum: Object.values(TaskPriority),
      default: TaskPriority.Medium,
    },
    status: {
      type: String,
      enum: Object.values(TaskStatus),
      default: TaskStatus.NotStarted,
    },
    difficulty: {
      type: String,
      enum: Object.values(TaskDifficulty),
      default: TaskDifficulty.Medium,
    },
    isRecurring: { type: Boolean, default: false },
    recurrencePattern: recurrenceSchema,
    reminders: [reminderSchema],
    attachments: [attachmentSchema],
    notes: String,
    xpReward: { type: Number, default: 50 },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    sharedWith: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
    completedAt: Date,
    timeSpent: { type: Number, default: 0 },
    completionPercentage: { type: Number, default: 0 },
    subtasks: [subtaskSchema],
  },
  { timestamps: true }
)

taskSchema.index({ userId: 1, createdAt: -1 })
taskSchema.index({ dueDate: 1, status: 1 })

export const Task = mongoose.model<ITaskDocument>('Task', taskSchema)
