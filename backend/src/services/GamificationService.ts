import { User, IUserDocument } from '../models/User'
import { Achievement } from '../models/Achievement'
import { Task, ITaskDocument } from '../models/Task'
import mongoose from 'mongoose'

export interface XPReward {
  baseXP: number
  priorityMultiplier: number
  difficultyMultiplier: number
  timeBonus: number
  onTimeBonus: number
}

export class GamificationService {
  /**
   * Calculate XP reward for completing a task
   */
  calculateXP(task: ITaskDocument): XPReward {
    let baseXP = 50 // Base reward
    let priorityMultiplier = 1
    let difficultyMultiplier = 1
    let timeBonus = 0
    let onTimeBonus = 0

    // Priority multiplier
    const priorityMultipliers: Record<string, number> = {
      Critical: 4,
      High: 3,
      Medium: 2,
      Low: 1,
    }
    priorityMultiplier = priorityMultipliers[task.priority] || 1

    // Difficulty multiplier
    const difficultyMultipliers: Record<string, number> = {
      Hard: 2,
      Medium: 1.5,
      Easy: 1,
    }
    difficultyMultiplier = difficultyMultipliers[task.difficulty] || 1

    // Time-based bonuses
    if (task.dueDate && task.completedAt) {
      const dueDate = new Date(task.dueDate)
      const completedDate = new Date(task.completedAt)

      // On-time bonus (completed before or on due date)
      if (completedDate <= dueDate) {
        onTimeBonus = 20 // +20% bonus
      }

      // Early completion bonus (completed at least 24 hours early)
      const hoursEarly = (dueDate.getTime() - completedDate.getTime()) / (1000 * 60 * 60)
      if (hoursEarly >= 24) {
        timeBonus = Math.min(50, hoursEarly * 2) // Up to 50% bonus
      }
    }

    const totalXP =
      baseXP * priorityMultiplier * difficultyMultiplier +
      (baseXP * priorityMultiplier * difficultyMultiplier * onTimeBonus) / 100 +
      (baseXP * priorityMultiplier * difficultyMultiplier * timeBonus) / 100

    return {
      baseXP,
      priorityMultiplier,
      difficultyMultiplier,
      timeBonus,
      onTimeBonus,
    }
  }

  /**
   * Award XP to user and handle level-up
   */
  async awardXP(
    userId: string,
    xp: number
  ): Promise<{ newLevel: number; leveledUp: boolean; nextLevelXP: number }> {
    const user = await User.findById(userId)
    if (!user) throw new Error('User not found')

    user.totalXp += xp

    // Calculate new level
    const newLevel = this.calculateLevel(user.totalXp)
    const leveledUp = newLevel > user.level

    if (leveledUp) {
      user.level = newLevel
    }

    await user.save()

    return {
      newLevel: user.level,
      leveledUp,
      nextLevelXP: this.getNextLevelThreshold(user.level),
    }
  }

  /**
   * Calculate level from total XP
   */
  calculateLevel(totalXP: number): number {
    const thresholds = [
      0, 100, 350, 800, 1500, 2500, 3500, 4500, 5500, 6500, 8500, 10500, 12500,
      14500, 16500, 18500, 20500, 22500, 24500, 26500, 31500, 36500, 41500,
      46500, 51500, 61500, 71500, 81500, 91500, 101500, 151500, 201500, 251500,
      301500, 351500, 401500, 451500, 501500, 551500, 601500,
    ]

    for (let level = 0; level < thresholds.length; level++) {
      if (totalXP < thresholds[level]) {
        return level
      }
    }

    return 50 // Max level
  }

  /**
   * Get XP threshold for next level
   */
  getNextLevelThreshold(level: number): number {
    const thresholds = [
      0, 100, 350, 800, 1500, 2500, 3500, 4500, 5500, 6500, 8500, 10500, 12500,
      14500, 16500, 18500, 20500, 22500, 24500, 26500, 31500, 36500, 41500,
      46500, 51500, 61500, 71500, 81500, 91500, 101500, 151500, 201500, 251500,
      301500, 351500, 401500, 451500, 501500, 551500, 601500,
    ]

    if (level + 1 < thresholds.length) {
      return thresholds[level + 1]
    }

    return thresholds[thresholds.length - 1] + 50000 // 50k per level after max
  }

  /**
   * Get current level progress (0-100%)
   */
  getLevelProgress(totalXP: number): number {
    const level = this.calculateLevel(totalXP)
    const currentThreshold = [
      0, 100, 350, 800, 1500, 2500, 3500, 4500, 5500, 6500, 8500, 10500, 12500,
      14500, 16500, 18500, 20500, 22500, 24500, 26500, 31500, 36500, 41500,
      46500, 51500, 61500, 71500, 81500, 91500, 101500, 151500, 201500, 251500,
      301500, 351500, 401500, 451500, 501500, 551500, 601500,
    ][level] || 0

    const nextThreshold = this.getNextLevelThreshold(level)
    const xpInCurrentLevel = totalXP - currentThreshold
    const xpNeeded = nextThreshold - currentThreshold

    return (xpInCurrentLevel / xpNeeded) * 100
  }

  /**
   * Update user streak
   */
  async updateStreak(userId: string): Promise<number> {
    const user = await User.findById(userId)
    if (!user) throw new Error('User not found')

    // Check if user has completed task today
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const completedToday = await Task.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      completedAt: { $gte: today },
      status: 'Completed',
    })

    if (completedToday) {
      // Check if streak exists
      if (user.streak === 0) {
        user.streak = 1
      } else {
        // Check if streak continues from yesterday
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)

        const completedYesterday = await Task.findOne({
          userId: new mongoose.Types.ObjectId(userId),
          completedAt: {
            $gte: yesterday,
            $lt: today,
          },
          status: 'Completed',
        })

        if (completedYesterday) {
          user.streak += 1
        } else {
          user.streak = 1
        }
      }

      // Update longest streak
      if (user.streak > user.longestStreak) {
        user.longestStreak = user.streak
      }

      await user.save()
    }

    return user.streak
  }

  /**
   * Reset streak if no task completed today
   */
  async checkAndResetStreak(userId: string): Promise<boolean> {
    const user = await User.findById(userId)
    if (!user || user.streak === 0) return false

    // Check if user has completed task today
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    today.setHours(23, 59, 59, 999)

    const completedToday = await Task.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      completedAt: { $gte: today },
      status: 'Completed',
    })

    if (!completedToday) {
      // Check if in quiet hours or if it's a new day
      const now = new Date()
      const lastCompletion = await Task.findOne(
        { userId: new mongoose.Types.ObjectId(userId), completedAt: { $exists: true } },
        {},
        { sort: { completedAt: -1 } }
      )

      if (lastCompletion) {
        const lastDate = new Date(lastCompletion.completedAt!)
        lastDate.setHours(0, 0, 0, 0)

        const todayDate = new Date()
        todayDate.setHours(0, 0, 0, 0)

        // If last completion was more than 1 day ago, reset streak
        if (lastDate.getTime() < todayDate.getTime() - 86400000) {
          user.streak = 0
          await user.save()
          return true
        }
      }
    }

    return false
  }

  /**
   * Get streak milestones for user
   */
  getStreakMilestones(): number[] {
    return [7, 14, 30, 60, 100, 365]
  }

  /**
   * Check if user reached streak milestone
   */
  isStreakMilestone(streak: number): boolean {
    return [7, 14, 30, 60, 100, 365].includes(streak)
  }

  /**
   * Get user stats
   */
  async getUserGameificationStats(userId: string) {
    const user = await User.findById(userId)
    if (!user) throw new Error('User not found')

    const completedTasks = await Task.countDocuments({
      userId: new mongoose.Types.ObjectId(userId),
      status: 'Completed',
    })

    const achievements = await Achievement.countDocuments({
      userId: new mongoose.Types.ObjectId(userId),
      unlockedAt: { $exists: true },
    })

    return {
      level: user.level,
      totalXP: user.totalXp,
      currentStreak: user.streak,
      longestStreak: user.longestStreak,
      completedTasks,
      achievements,
      levelProgress: this.getLevelProgress(user.totalXp),
      nextLevelXP: this.getNextLevelThreshold(user.level),
    }
  }
}
