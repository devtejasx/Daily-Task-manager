import { User } from '../models/User'
import { Task } from '../models/Task'
import mongoose from 'mongoose'

export class AnalyticsService {
  /**
   * Get comprehensive productivity metrics
   */
  async getProductivityMetrics(userId: string) {
    const userId_obj = new mongoose.Types.ObjectId(userId)

    // Get all tasks for user
    const allTasks = await Task.find({ userId: userId_obj })
    const completedTasks = allTasks.filter((t) => t.status === 'Completed')
    const overdueTasks = allTasks.filter((t) => {
      if (!t.dueDate || t.status === 'Completed') return false
      return new Date(t.dueDate) < new Date()
    })

    // Completion rate
    const completionRate =
      allTasks.length > 0 ? (completedTasks.length / allTasks.length) * 100 : 0

    // On-time completion
    const onTimeCount = completedTasks.filter((t) => {
      if (!t.dueDate) return true
      return new Date(t.completedAt!) <= new Date(t.dueDate)
    }).length

    const onTimeRate = completedTasks.length > 0 ? (onTimeCount / completedTasks.length) * 100 : 0

    // Average time spent
    const timeSpents = completedTasks
      .map((t) => t.timeSpent)
      .filter((t) => t > 0)
    const averageTimeSpent =
      timeSpents.length > 0 ? timeSpents.reduce((a, b) => a + b, 0) / timeSpents.length : 0

    // Category performance
    const categoryPerformance: Record<string, number> = {}
    allTasks.forEach((task) => {
      if (!categoryPerformance[task.category]) {
        categoryPerformance[task.category] = 0
      }
      if (task.status === 'Completed') {
        categoryPerformance[task.category] += 1
      }
    })

    // Priority distribution
    const priorityDistribution: Record<string, number> = {
      Critical: 0,
      High: 0,
      Medium: 0,
      Low: 0,
    }
    allTasks.forEach((task) => {
      priorityDistribution[task.priority]++
    })

    // Peak productivity hour
    const hourCounts: Record<number, number> = {}
    completedTasks.forEach((task) => {
      if (task.completedAt) {
        const hour = new Date(task.completedAt).getHours()
        hourCounts[hour] = (hourCounts[hour] || 0) + 1
      }
    })
    const peakHour =
      Object.keys(hourCounts).length > 0
        ? parseInt(
            Object.keys(hourCounts).reduce((a, b) =>
              hourCounts[parseInt(a)] > hourCounts[parseInt(b)] ? a : b
            )
          )
        : 9

    // Consistency score (0-100)
    const consistencyScore = Math.min(
      100,
      (completionRate + onTimeRate) / 2
    )

    return {
      completionRate: Math.round(completionRate * 100) / 100,
      onTimeRate: Math.round(onTimeRate * 100) / 100,
      averageTimeSpent: Math.round(averageTimeSpent),
      peakProductivityHour: peakHour,
      categoryPerformance,
      priorityDistribution,
      consistencyScore: Math.round(consistencyScore * 100) / 100,
      totalTasks: allTasks.length,
      completedTasks: completedTasks.length,
      overdueTasks: overdueTasks.length,
    }
  }

  /**
   * Get dashboard statistics
   */
  async getDashboardStats(userId: string) {
    const userId_obj = new mongoose.Types.ObjectId(userId)
    const user = await User.findById(userId_obj)

    if (!user) throw new Error('User not found')

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const endOfDay = new Date(today)
    endOfDay.setHours(23, 59, 59, 999)

    // Today's tasks
    const todayTasks = await Task.find({
      userId: userId_obj,
      dueDate: { $gte: today, $lte: endOfDay },
    })
    const completedToday = todayTasks.filter((t) => t.status === 'Completed').length

    // This week
    const weekStart = new Date(today)
    weekStart.setDate(weekStart.getDate() - weekStart.getDay())
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 6)
    weekEnd.setHours(23, 59, 59, 999)

    const weekTasks = await Task.find({
      userId: userId_obj,
      dueDate: { $gte: weekStart, $lte: weekEnd },
    })
    const completedWeek = weekTasks.filter((t) => t.status === 'Completed').length

    // This month
    const monthStart = new Date(today)
    monthStart.setDate(1)
    const monthEnd = new Date(monthStart)
    monthEnd.setMonth(monthEnd.getMonth() + 1)
    monthEnd.setDate(0)
    monthEnd.setHours(23, 59, 59, 999)

    const monthTasks = await Task.find({
      userId: userId_obj,
      dueDate: { $gte: monthStart, $lte: monthEnd },
    })
    const completedMonth = monthTasks.filter((t) => t.status === 'Completed').length

    const allTasks = await Task.find({ userId: userId_obj })
    const overdue = allTasks.filter((t) => {
      if (!t.dueDate || t.status === 'Completed') return false
      return new Date(t.dueDate) < new Date()
    }).length

    return {
      todayCompleted: completedToday,
      todayTotal: todayTasks.length,
      weekCompleted: completedWeek,
      weekTotal: weekTasks.length,
      monthCompleted: completedMonth,
      monthTotal: monthTasks.length,
      currentStreak: user.streak,
      longestStreak: user.longestStreak,
      totalCompleted: user.completedTasks,
      overdueTasks: overdue,
    }
  }

  /**
   * Get daily completion data for charts
   */
  async getDailyCompletion(userId: string, days: number = 30) {
    const userId_obj = new mongoose.Types.ObjectId(userId)
    const data: Record<string, number> = {}

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)

      const nextDate = new Date(date)
      nextDate.setDate(nextDate.getDate() + 1)

      const completed = await Task.countDocuments({
        userId: userId_obj,
        completedAt: { $gte: date, $lt: nextDate },
        status: 'Completed',
      })

      const dateStr = date.toISOString().split('T')[0]
      data[dateStr] = completed
    }

    return data
  }

  /**
   * Get category breakdown
   */
  async getCategoryBreakdown(userId: string) {
    const userId_obj = new mongoose.Types.ObjectId(userId)

    const tasks = await Task.find({ userId: userId_obj })
    const breakdown: Record<string, { total: number; completed: number }> = {}

    tasks.forEach((task) => {
      if (!breakdown[task.category]) {
        breakdown[task.category] = { total: 0, completed: 0 }
      }

      breakdown[task.category].total++

      if (task.status === 'Completed') {
        breakdown[task.category].completed++
      }
    })

    return Object.entries(breakdown).map(([category, stats]) => ({
      category,
      ...stats,
      completionRate: stats.total > 0 ? (stats.completed / stats.total) * 100 : 0,
    }))
  }

  /**
   * Get priority breakdown
   */
  async getPriorityBreakdown(userId: string) {
    const userId_obj = new mongoose.Types.ObjectId(userId)

    const tasks = await Task.find({ userId: userId_obj })
    const breakdown: Record<string, { total: number; completed: number }> = {
      Critical: { total: 0, completed: 0 },
      High: { total: 0, completed: 0 },
      Medium: { total: 0, completed: 0 },
      Low: { total: 0, completed: 0 },
    }

    tasks.forEach((task) => {
      breakdown[task.priority].total++

      if (task.status === 'Completed') {
        breakdown[task.priority].completed++
      }
    })

    return Object.entries(breakdown).map(([priority, stats]) => ({
      priority,
      ...stats,
      completionRate: stats.total > 0 ? (stats.completed / stats.total) * 100 : 0,
    }))
  }
}
