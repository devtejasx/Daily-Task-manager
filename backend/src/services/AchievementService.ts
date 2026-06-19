import { Achievement } from '../models/Achievement'
import { User } from '../models/User'
import { Task } from '../models/Task'
import mongoose from 'mongoose'

const ACHIEVEMENTS = [
  // Completion
  {
    name: 'Overachiever',
    type: 'Completion',
    icon: '🎯',
    requirement: 100,
    description: 'Complete 100 tasks',
  },
  {
    name: 'Perfectionist',
    type: 'Completion',
    icon: '🏆',
    requirement: 50,
    description: 'Complete 50 tasks on time',
  },
  {
    name: 'Speedster',
    type: 'Completion',
    icon: '🚀',
    requirement: 10,
    description: 'Complete 10 tasks in 1/4 of estimated time',
  },
  // Consistency
  {
    name: 'First Streak',
    type: 'Consistency',
    icon: '📅',
    requirement: 7,
    description: 'Maintain a 7-day streak',
  },
  {
    name: 'Habitual',
    type: 'Consistency',
    icon: '🔥',
    requirement: 30,
    description: 'Maintain a 30-day streak',
  },
  // Mastery
  {
    name: 'Work Master',
    type: 'Mastery',
    icon: '💼',
    requirement: 25,
    description: 'Complete 25 work tasks',
  },
  {
    name: 'Fitness Champion',
    type: 'Mastery',
    icon: '💪',
    requirement: 25,
    description: 'Complete 25 fitness tasks',
  },
]

export class AchievementService {
  async checkAndUnlockAchievements(userId: string): Promise<any[]> {
    const user = await User.findById(userId)
    if (!user) return []

    const unlockedAchievements = []

    // Check each achievement
    for (const achievementDef of ACHIEVEMENTS) {
      const existing = await Achievement.findOne({
        userId,
        name: achievementDef.name,
      })

      if (!existing) {
        const isUnlocked = await this.checkAchievementCondition(
          userId,
          achievementDef
        )

        if (isUnlocked) {
          const achievement = new Achievement({
            userId: new mongoose.Types.ObjectId(userId),
            ...achievementDef,
            unlockedAt: new Date(),
          })
          await achievement.save()
          unlockedAchievements.push(achievement)
        }
      }
    }

    return unlockedAchievements
  }

  private async checkAchievementCondition(userId: string, achievement: any) {
    switch (achievement.name) {
      case 'Overachiever':
        const completedTasks = await Task.countDocuments({
          userId: new mongoose.Types.ObjectId(userId),
          status: 'Completed',
        })
        return completedTasks >= 100

      case 'First Streak':
        const user = await User.findById(userId)
        return (user?.streak || 0) >= 7

      default:
        return false
    }
  }

  async getUserAchievements(userId: string) {
    return Achievement.find({
      userId: new mongoose.Types.ObjectId(userId),
    }).sort({ unlockedAt: -1 })
  }
}
