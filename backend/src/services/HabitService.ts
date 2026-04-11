import { Habit, IHabit } from '../models/Habit'
import { User } from '../models/User'
import mongoose from 'mongoose'

export class HabitService {
  /**
   * Create a new habit
   */
  async createHabit(userId: string, habitData: any): Promise<IHabit> {
    const habit = new Habit({
      userId: new mongoose.Types.ObjectId(userId),
      ...habitData,
      completedDates: [],
    })

    return habit.save()
  }

  /**
   * Get user habits
   */
  async getUserHabits(userId: string, includeInactive: boolean = false) {
    const query: any = { userId: new mongoose.Types.ObjectId(userId) }

    if (!includeInactive) {
      query.isActive = true
    }

    return Habit.find(query).sort({ createdAt: -1 })
  }

  /**
   * Get habit by ID
   */
  async getHabit(habitId: string): Promise<IHabit | null> {
    return Habit.findById(habitId)
  }

  /**
   * Update habit
   */
  async updateHabit(habitId: string, updates: any): Promise<IHabit | null> {
    return Habit.findByIdAndUpdate(habitId, updates, { new: true })
  }

  /**
   * Complete habit for today
   */
  async completeHabit(habitId: string): Promise<{ habit: IHabit; streakIncreased: boolean }> {
    const habit = await Habit.findById(habitId)
    if (!habit) throw new Error('Habit not found')

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Check if already completed today
    const completedToday = habit.completedDates.some((date) => {
      const d = new Date(date)
      d.setHours(0, 0, 0, 0)
      return d.getTime() === today.getTime()
    })

    let streakIncreased = false

    if (!completedToday) {
      habit.completedDates.push(today)
      habit.lastCompletedDate = today

      // Update streak
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)

      const completedYesterday = habit.completedDates.some((date) => {
        const d = new Date(date)
        d.setHours(0, 0, 0, 0)
        return d.getTime() === yesterday.getTime()
      })

      if (completedYesterday || habit.streak === 0) {
        habit.streak += 1
        streakIncreased = true
      } else {
        habit.streak = 1
      }

      // Update longest streak
      if (habit.streak > habit.longestStreak) {
        habit.longestStreak = habit.streak
      }

      await habit.save()
    }

    return { habit, streakIncreased }
  }

  /**
   * Delete habit
   */
  async deleteHabit(habitId: string): Promise<boolean> {
    const result = await Habit.findByIdAndDelete(habitId)
    return !!result
  }

  /**
   * Get habit statistics
   */
  async getHabitStats(userId: string) {
    const habits = await this.getUserHabits(userId, false)

    const totalHabits = habits.length
    const totalStreak = habits.reduce((sum, h) => sum + h.streak, 0)
    const averageStreak = totalHabits > 0 ? totalStreak / totalHabits : 0
    const longestStreakOverall = Math.max(...habits.map((h) => h.longestStreak), 0)

    // Completion rate for last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const completionsLast30Days = habits.reduce((sum, h) => {
      return (
        sum +
        h.completedDates.filter((date) => new Date(date) > thirtyDaysAgo).length
      )
    }, 0)

    const possibleCompletion = totalHabits * 30
    const completionRateLast30 = possibleCompletion > 0 ? (completionsLast30Days / possibleCompletion) * 100 : 0

    return {
      totalHabits,
      activeHabits: habits.filter((h) => h.isActive).length,
      averageStreak: Math.round(averageStreak * 100) / 100,
      longestStreak: longestStreakOverall,
      completionRateLast30: Math.round(completionRateLast30),
      completionsLast30Days,
    }
  }

  /**
   * Verify and reset streaks if needed
   */
  async checkAndResetStreaks(userId: string): Promise<void> {
    const habits = await this.getUserHabits(userId, true)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (const habit of habits) {
      if (!habit.lastCompletedDate || habit.streak === 0) continue

      const lastCompleted = new Date(habit.lastCompletedDate)
      lastCompleted.setHours(0, 0, 0, 0)

      const daysSinceLastCompletion = Math.floor(
        (today.getTime() - lastCompleted.getTime()) / (1000 * 60 * 60 * 24)
      )

      if (daysSinceLastCompletion > 1) {
        habit.streak = 0
        await habit.save()
      }
    }
  }

  /**
   * Get habits by category
   */
  async getHabitsByCategory(userId: string, category: string) {
    return Habit.find({
      userId: new mongoose.Types.ObjectId(userId),
      category,
      isActive: true,
    }).sort({ streak: -1 })
  }

  /**
   * Get habit completion data for chart
   */
  async getHabitCompletionData(habitId: string, days: number = 30) {
    const habit = await Habit.findById(habitId)
    if (!habit) throw new Error('Habit not found')

    const data: Record<string, number> = {}

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)

      const completed = habit.completedDates.some((d) => {
        const completedDate = new Date(d)
        completedDate.setHours(0, 0, 0, 0)
        return completedDate.getTime() === date.getTime()
      })

      const dateStr = date.toISOString().split('T')[0]
      data[dateStr] = completed ? 1 : 0
    }

    return data
  }
}
