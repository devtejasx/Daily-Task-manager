export interface ITask {
  _id: string
  userId: string
  title: string
  description?: string
  category?: string
  priority: 'Low' | 'Medium' | 'High' | 'Critical'
  dueDate?: Date
  completedAt?: Date
  isCompleted: boolean
  xpReward?: number
  createdAt: Date
  updatedAt: Date
  recurrencePattern?: string
  tags?: string[]
  status: 'pending' | 'in_progress' | 'completed'
}

export interface CreateTaskInput {
  title: string
  description?: string
  category?: string
  priority?: 'Low' | 'Medium' | 'High' | 'Critical'
  dueDate?: Date
  recurrencePattern?: string
  tags?: string[]
}

export interface UpdateTaskInput {
  title?: string
  description?: string
  category?: string
  priority?: 'Low' | 'Medium' | 'High' | 'Critical'
  dueDate?: Date
  isCompleted?: boolean
  status?: 'pending' | 'in_progress' | 'completed'
  recurrencePattern?: string
  tags?: string[]
}
