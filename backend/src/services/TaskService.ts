import { Task, ITaskDocument } from '../models/Task'
import { User } from '../models/User'
import { GamificationService } from './GamificationService'
import mongoose from 'mongoose'

export class TaskService {
  private gamificationService: GamificationService

  constructor() {
    this.gamificationService = new GamificationService()
  }
  async createTask(userId: string, taskData: any): Promise<ITaskDocument> {
    const task = new Task({
      ...taskData,
      userId: new mongoose.Types.ObjectId(userId),
    })
    return task.save()
  }

  async getTaskById(taskId: string): Promise<ITaskDocument | null> {
    return Task.findById(taskId).populate('assignedTo')
  }

  async getUserTasks(
    userId: string,
    filters?: any
  ): Promise<ITaskDocument[]> {
    const query: any = { userId: new mongoose.Types.ObjectId(userId) }

    if (filters?.status) query.status = filters.status
    if (filters?.category) query.category = filters.category
    if (filters?.priority) query.priority = filters.priority
    if (filters?.dueDate) {
      const startOfDay = new Date(filters.dueDate)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(filters.dueDate)
      endOfDay.setHours(23, 59, 59, 999)
      query.dueDate = { $gte: startOfDay, $lte: endOfDay }
    }

    return Task.find(query).sort({ dueDate: 1, priority: -1 })
  }

  async updateTask(
    taskId: string,
    updateData: any
  ): Promise<ITaskDocument | null> {
    return Task.findByIdAndUpdate(taskId, updateData, { new: true })
  }

  async deleteTask(taskId: string): Promise<boolean> {
    const result = await Task.findByIdAndDelete(taskId)
    return !!result
  }

  async completeTask(taskId: string): Promise<{ task: ITaskDocument; xpAwarded: number; leveledUp: boolean; newLevel: number }> {
    const task = await Task.findById(taskId)
    if (!task) throw new Error('Task not found')

    task.status = 'Completed'
    task.completedAt = new Date()
    task.completionPercentage = 100

    // Calculate XP reward
    const xpReward = this.gamificationService.calculateXP(task)
    const totalXP =
      xpReward.baseXP * xpReward.priorityMultiplier * xpReward.difficultyMultiplier +
      (xpReward.baseXP * xpReward.priorityMultiplier * xpReward.difficultyMultiplier * xpReward.onTimeBonus) /
        100 +
      (xpReward.baseXP * xpReward.priorityMultiplier * xpReward.difficultyMultiplier * xpReward.timeBonus) / 100

    // Award XP and handle level-up
    const result = await this.gamificationService.awardXP(task.userId.toString(), Math.floor(totalXP))

    // Update streak
    await this.gamificationService.updateStreak(task.userId.toString())

    // Increment completed tasks
    const user = await User.findById(task.userId)
    if (user) {
      user.completedTasks += 1
      await user.save()
    }

    await task.save()

    return {
      task,
      xpAwarded: Math.floor(totalXP),
      leveledUp: result.leveledUp,
      newLevel: result.newLevel,
    }
  }

  async getTodaysTasks(userId: string): Promise<ITaskDocument[]> {
    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date()
    endOfDay.setHours(23, 59, 59, 999)

    return Task.find({
      userId: new mongoose.Types.ObjectId(userId),
      dueDate: { $gte: startOfDay, $lte: endOfDay },
    })
  }

  async searchTasks(userId: string, query: string): Promise<ITaskDocument[]> {
    return Task.find({
      userId: new mongoose.Types.ObjectId(userId),
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { tags: { $regex: query, $options: 'i' } },
      ],
    })
  }
}
