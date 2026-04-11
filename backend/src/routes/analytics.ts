import express, { Request, Response } from 'express'
import { auth } from '../middleware/auth'
import { AnalyticsService } from '../services/AnalyticsService'

const router = express.Router()
const analyticsService = new AnalyticsService()

/**
 * GET /api/analytics/metrics
 * Get comprehensive productivity metrics
 */
router.get('/metrics', auth, async (req: Request, res: Response) => {
  try {
    const metrics = await analyticsService.getProductivityMetrics(req.userId as string)
    res.json(metrics)
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
})

/**
 * GET /api/analytics/dashboard
 * Get dashboard statistics
 */
router.get('/dashboard', auth, async (req: Request, res: Response) => {
  try {
    const stats = await analyticsService.getDashboardStats(req.userId as string)
    res.json(stats)
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
})

/**
 * GET /api/analytics/completion
 * Get daily completion data for charts
 */
router.get('/completion', auth, async (req: Request, res: Response) => {
  try {
    const days = parseInt(req.query.days as string) || 30
    const data = await analyticsService.getDailyCompletion(req.userId as string, days)
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
})

/**
 * GET /api/analytics/categories
 * Get category breakdown
 */
router.get('/categories', auth, async (req: Request, res: Response) => {
  try {
    const categories = await analyticsService.getCategoryBreakdown(req.userId as string)
    res.json(categories)
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
})

/**
 * GET /api/analytics/priorities
 * Get priority breakdown
 */
router.get('/priorities', auth, async (req: Request, res: Response) => {
  try {
    const priorities = await analyticsService.getPriorityBreakdown(req.userId as string)
    res.json(priorities)
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
})

export default router
