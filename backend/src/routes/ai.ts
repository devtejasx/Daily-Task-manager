import express, { Request, Response } from 'express'
import { auth } from '../middleware/auth'
import { AISuggestionsService } from '../services/AISuggestionsService'

const router = express.Router()
const aiService = new AISuggestionsService()

/**
 * GET /api/ai/suggestions
 * Get AI-generated task suggestions
 */
router.get('/suggestions', auth, async (req: Request, res: Response) => {
  try {
    const count = parseInt(req.query.count as string) || 5
    const suggestions = await aiService.generateTaskSuggestions(req.userId as string, count)

    res.json({
      success: true,
      data: suggestions,
    })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message })
  }
})

/**
 * GET /api/ai/smart-recommendations
 * Get smart task recommendations based on time of day
 */
router.get('/smart-recommendations', auth, async (req: Request, res: Response) => {
  try {
    const recommendations = await aiService.getSmartRecommendations(req.userId as string)

    res.json({
      success: true,
      data: recommendations,
    })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message })
  }
})

/**
 * GET /api/ai/analyze-patterns
 * Analyze user's task completion patterns
 */
router.get('/analyze-patterns', auth, async (req: Request, res: Response) => {
  try {
    const analysis = await aiService.analyzeTaskPatterns(req.userId as string)

    res.json({
      success: true,
      data: analysis,
    })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message })
  }
})

/**
 * POST /api/ai/suggest-priority
 * Get AI-suggested priority for a task
 */
router.post('/suggest-priority', auth, async (req: Request, res: Response) => {
  try {
    const { title, description } = req.body

    if (!title) {
      return res.status(400).json({ error: 'Task title is required' })
    }

    const priority = await aiService.suggestTaskPriority(title, description)

    res.json({
      success: true,
      data: priority,
    })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message })
  }
})

export default router
