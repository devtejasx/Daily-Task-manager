import { User } from '../models/User'
import { TaskPriority, TaskDifficulty, TaskStatus } from '../types'
import { Achievement } from '../models/Achievement'
import { Task, ITaskDocument } from '../models/Task'
import mongoose from 'mongoose'

export interface XPReward {
  totalXP: number
  baseXP: number
  priorityMultiplier: number
  difficultyMultiplier: number
  timeBonus: number
  onTimeBonus: number
}

// Cumulative XP required to reach each level. Index i is the floor of level i,
// so a user is at level L when LEVEL_THRESHOLDS[L-1] <= totalXP < LEVEL_THRESHOLDS[L].
const LEVEL_THRESHOLDS = [
  0, 100, 350, 800, 1500, 2500, 3500, 4500, 5500, 6500, 8500, 10500, 12500,
  14500, 16500, 18500, 20500, 22500, 24500, 26500, 31500, 36500, 41500, 46500,
  51500, 61500, 71500, 81500, 91500, 101500, 151500, 201500, 251500, 301500,
  351500, 401500, 451500, 501500, 551500, 601500,
]
const XP_PER_LEVEL_AFTER_MAX = 50000

export class GamificationService {
  /**
   * Calculate XP reward for completing a task
   */
  calculateXP(task: ITaskDocument): XPReward {
    const baseXP = 50 // Base reward
    let priorityMultiplier = 1
    let difficultyMultiplier = 1
    let timeBonus = 0
    let onTimeBonus = 0

    // Priority multiplier
    const priorityMultipliers: Record<string, number> = {
      [TaskPriority.Critical]: 4,
      [TaskPriority.High]: 3,
      [TaskPriority.Medium]: 2,
      [TaskPriority.Low]: 1,
    }
    priorityMultiplier = priorityMultipliers[task.priority] || 1

    // Difficulty multiplier
    const difficultyMultipliers: Record<string, number> = {
      [TaskDifficulty.VeryHard]: 2.5,
      [TaskDifficulty.Hard]: 2,
      [TaskDifficulty.Medium]: 1.5,
      [TaskDifficulty.Easy]: 1,
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
      totalXP,
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
    // Level L means the user has passed LEVEL_THRESHOLDS[L-1] but not [L].
    // A fresh user (0 XP) is level 1, since 0 < LEVEL_THRESHOLDS[1] (=100).
    for (let level = 0; level < LEVEL_THRESHOLDS.length; level++) {
      if (totalXP < LEVEL_THRESHOLDS[level]) {
        return level
      }
    }

    return LEVEL_THRESHOLDS.length // Max level
  }

  /**
   * Total XP required to advance out of the given level (i.e. the ceiling of
   * the current level / the floor of the next one).
   */
  getNextLevelThreshold(level: number): number {
    if (level < LEVEL_THRESHOLDS.length) {
      return LEVEL_THRESHOLDS[level]
    }

    // Past the defined table: a flat cost per level beyond the last threshold.
    const beyond = level - (LEVEL_THRESHOLDS.length - 1)
    return LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1] + beyond * XP_PER_LEVEL_AFTER_MAX
  }

  /**
   * Get current level progress (0-100%)
   */
  getLevelProgress(totalXP: number): number {
    const level = this.calculateLevel(totalXP)
    // Floor of the current level is the previous threshold; using
    // LEVEL_THRESHOLDS[level] here was the off-by-one that produced negative
    // progress (e.g. 150 XP at level 2 gave (150-350)/450 = -44%).
    const currentThreshold = LEVEL_THRESHOLDS[level - 1] ?? 0
    const nextThreshold = this.getNextLevelThreshold(level)
    const xpInCurrentLevel = totalXP - currentThreshold
    const xpNeeded = nextThreshold - currentThreshold

    if (xpNeeded <= 0) return 100
    return Math.max(0, Math.min(100, (xpInCurrentLevel / xpNeeded) * 100))
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
      status: TaskStatus.Completed,
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
          status: TaskStatus.Completed,
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
      status: TaskStatus.Completed,
    })

    if (!completedToday) {
      // Check if in quiet hours or if it's a new day
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
      status: TaskStatus.Completed,
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
