import express, { Request, Response } from 'express'
import { auth } from '../middleware/auth'
import { GamificationService } from '../services/GamificationService'
import { AnalyticsService } from '../services/AnalyticsService'
import { User } from '../models/User'
import { Achievement } from '../models/Achievement'
import mongoose from 'mongoose'

const router = express.Router()
const gamificationService = new GamificationService()
const analyticsService = new AnalyticsService()

/**
 * GET /api/gamification/stats
 * Get user's gamification stats (XP, level, streak, achievements)
 */
router.get('/stats', auth, async (req: Request, res: Response) => {
  try {
    const stats = await gamificationService.getUserGameificationStats(req.userId as string)
    res.json(stats)
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
})

/**
 * GET /api/gamification/xp-leaderboard
 * Get top 10 users by XP
 */
router.get('/xp-leaderboard', async (req: Request, res: Response) => {
  try {
    const leaderboard = await User.find()
      .sort({ totalXp: -1 })
      .limit(10)
      .select('username email level totalXp completedTasks')

    res.json(leaderboard)
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
})

/**
 * GET /api/gamification/streak-leaderboard
 * Get top 10 users by streak
 */
router.get('/streak-leaderboard', async (req: Request, res: Response) => {
  try {
    const leaderboard = await User.find()
      .sort({ streak: -1 })
      .limit(10)
      .select('username email streak longestStreak')

    res.json(leaderboard)
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
})

/**
 * GET /api/gamification/level-leaderboard
 * Get top 10 users by level
 */
router.get('/level-leaderboard', async (req: Request, res: Response) => {
  try {
    const leaderboard = await User.find()
      .sort({ level: -1, totalXp: -1 })
      .limit(10)
      .select('username email level totalXp')

    res.json(leaderboard)
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
})

/**
 * GET /api/gamification/achievements
 * Get user's achievements
 */
router.get('/achievements', auth, async (req: Request, res: Response) => {
  try {
    const achievements = await Achievement.find({
      userId: new mongoose.Types.ObjectId(req.userId as string),
    }).sort({ unlockedAt: -1 })

    res.json(achievements)
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
})

/**
 * GET /api/gamification/achievements/all
 * Get all possible achievements
 */
router.get('/achievements/all', async (req: Request, res: Response) => {
  try {
    const allAchievements = await Achievement.find({})
      .select('name description icon badge requirements points -userId -_id')
      .distinct('name')

    res.json(allAchievements)
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
})

/**
 * GET /api/gamification/next-level-progress
 * Get progress towards next level
 */
router.get('/next-level-progress', auth, async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.userId as string)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    const levelProgress = gamificationService.getLevelProgress(user.totalXp)
    const nextLevelThreshold = gamificationService.getNextLevelThreshold(user.level)
    const thresholds = [
      0, 100, 350, 800, 1500, 2500, 3500, 4500, 5500, 6500, 8500, 10500, 12500, 14500, 16500,
      18500, 20500, 22500, 24500, 26500, 31500, 36500, 41500, 46500, 51500, 61500, 71500,
      81500, 91500, 101500, 151500, 201500, 251500, 301500, 351500, 401500, 451500, 501500,
      551500, 601500,
    ]
    const currentThreshold = thresholds[user.level] || 0

    res.json({
      currentLevel: user.level,
      currentXP: user.totalXp,
      xpInCurrentLevel: user.totalXp - currentThreshold,
      xpNeededForNextLevel: nextLevelThreshold - currentThreshold,
      progressPercentage: levelProgress,
      nextLevelXP: nextLevelThreshold,
    })
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
})

/**
 * POST /api/gamification/check-streak
 * Check and potentially reset user's streak
 */
router.post('/check-streak', auth, async (req: Request, res: Response) => {
  try {
    const resetOccurred = await gamificationService.checkAndResetStreak(req.userId as string)
    const user = await User.findById(req.userId as string)

    res.json({
      resetOccurred,
      currentStreak: user?.streak || 0,
      longestStreak: user?.longestStreak || 0,
    })
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
})

/**
 * GET /api/gamification/streak-milestones
 * Get streak milestone values
 */
router.get('/streak-milestones', (req: Request, res: Response) => {
  const milestones = gamificationService.getStreakMilestones()
  res.json(milestones)
})

export default router
