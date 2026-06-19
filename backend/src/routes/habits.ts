import express, { Request, Response } from 'express'
import { auth } from '../middleware/auth'
import { HabitService } from '../services/HabitService'

const router = express.Router()
const habitService = new HabitService()

/**
 * POST /api/habits
 * Create a new habit
 */
router.post('/', auth, async (req: Request, res: Response) => {
  try {
    const habit = await habitService.createHabit(req.userId as string, req.body)

    res.status(201).json({
      success: true,
      data: habit,
      message: 'Habit created successfully',
    })
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message })
  }
})

/**
 * GET /api/habits
 * Get user's habits
 */
router.get('/', auth, async (req: Request, res: Response) => {
  try {
    const includeInactive = req.query.includeInactive === 'true'
    const habits = await habitService.getUserHabits(req.userId as string, includeInactive)

    res.json({
      success: true,
      data: habits,
    })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message })
  }
})

/**
 * GET /api/habits/:id
 * Get habit details
 */
router.get('/:id', auth, async (req: Request, res: Response) => {
  try {
    const habit = await habitService.getHabit(req.params.id)

    if (!habit) {
      return res.status(404).json({ success: false, error: 'Habit not found' })
    }

    res.json({
      success: true,
      data: habit,
    })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message })
  }
})

/**
 * PUT /api/habits/:id
 * Update habit
 */
router.put('/:id', auth, async (req: Request, res: Response) => {
  try {
    const habit = await habitService.updateHabit(req.params.id, req.body)

    if (!habit) {
      return res.status(404).json({ success: false, error: 'Habit not found' })
    }

    res.json({
      success: true,
      data: habit,
      message: 'Habit updated successfully',
    })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message })
  }
})

/**
 * POST /api/habits/:id/complete
 * Mark habit complete for today
 */
router.post('/:id/complete', auth, async (req: Request, res: Response) => {
  try {
    const result = await habitService.completeHabit(req.params.id)

    res.json({
      success: true,
      data: result.habit,
      streakIncreased: result.streakIncreased,
      message: 'Habit marked complete',
    })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message })
  }
})

/**
 * DELETE /api/habits/:id
 * Delete habit
 */
router.delete('/:id', auth, async (req: Request, res: Response) => {
  try {
    await habitService.deleteHabit(req.params.id)

    res.json({
      success: true,
      message: 'Habit deleted successfully',
    })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message })
  }
})

/**
 * GET /api/habits/stats
 * Get habit statistics
 */
router.get('/stats/summary', auth, async (req: Request, res: Response) => {
  try {
    const stats = await habitService.getHabitStats(req.userId as string)

    res.json({
      success: true,
      data: stats,
    })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message })
  }
})

/**
 * GET /api/habits/category/:category
 * Get habits by category
 */
router.get('/category/:category', auth, async (req: Request, res: Response) => {
  try {
    const habits = await habitService.getHabitsByCategory(
      req.userId as string,
      req.params.category
    )

    res.json({
      success: true,
      data: habits,
    })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message })
  }
})

/**
 * GET /api/habits/:id/data
 * Get habit completion data for chart
 */
router.get('/:id/data', auth, async (req: Request, res: Response) => {
  try {
    const days = parseInt(req.query.days as string) || 30
    const data = await habitService.getHabitCompletionData(req.params.id, days)

    res.json({
      success: true,
      data,
    })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message })
  }
})

/**
 * POST /api/habits/check-streaks
 * Check and reset streaks
 */
router.post('/check-streaks', auth, async (req: Request, res: Response) => {
  try {
    await habitService.checkAndResetStreaks(req.userId as string)

    res.json({
      success: true,
      message: 'Streaks checked and updated',
    })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message })
  }
})

export default router
