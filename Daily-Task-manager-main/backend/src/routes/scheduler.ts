import { Router, Request, Response } from 'express';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { smartSchedulerService } from '../services/smartScheduler';

const router = Router();

// Apply authentication to all routes
router.use(authenticateToken);

/**
 * GET /api/scheduler/suggestions
 * Get schedule suggestions for unscheduled tasks
 */
router.get('/suggestions', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const suggestions = await smartSchedulerService.generateSchedule(req.userId);

    res.json({
      success: true,
      data: {
        suggestions,
        count: suggestions.length,
        message:
          suggestions.length > 0
            ? `${suggestions.length} tasks can be scheduled`
            : 'All tasks are already scheduled'
      }
    });
  } catch (error: any) {
    console.error('Failed to generate schedule suggestions:', error);
    res.status(500).json({ error: error.message || 'Failed to generate suggestions' });
  }
});

/**
 * POST /api/scheduler/apply
 * Apply schedule suggestions to tasks
 */
router.post('/apply', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { suggestions } = req.body;

    if (!Array.isArray(suggestions)) {
      return res.status(400).json({ error: 'Suggestions must be an array' });
    }

    const applied = await smartSchedulerService.applySuggestions(req.userId, suggestions);

    res.json({
      success: true,
      data: {
        applied,
        message: `${applied} tasks have been scheduled`
      }
    });
  } catch (error: any) {
    console.error('Failed to apply schedule:', error);
    res.status(500).json({ error: error.message || 'Failed to apply schedule' });
  }
});

/**
 * POST /api/scheduler/auto-schedule
 * Automatically schedule all unscheduled tasks
 */
router.post('/auto-schedule', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const count = await smartSchedulerService.autoScheduleAll(req.userId);

    res.json({
      success: true,
      data: {
        count,
        message: `${count} tasks have been automatically scheduled`
      }
    });
  } catch (error: any) {
    console.error('Failed to auto-schedule:', error);
    res.status(500).json({ error: error.message || 'Failed to auto-schedule' });
  }
});

/**
 * GET /api/scheduler/optimizations
 * Get optimization recommendations for better productivity
 */
router.get('/optimizations', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const recommendations = await smartSchedulerService.getOptimizations(req.userId);

    res.json({
      success: true,
      data: {
        recommendations,
        count: recommendations.length
      }
    });
  } catch (error: any) {
    console.error('Failed to get optimizations:', error);
    res.status(500).json({ error: error.message || 'Failed to get optimizations' });
  }
});

/**
 * GET /api/scheduler/distribution
 * Get task distribution analysis
 */
router.get('/distribution', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const analysis = await smartSchedulerService.getDistributionAnalysis(req.userId);

    res.json({
      success: true,
      data: analysis
    });
  } catch (error: any) {
    console.error('Failed to get distribution analysis:', error);
    res.status(500).json({ error: error.message || 'Failed to get distribution' });
  }
});

/**
 * GET /api/scheduler/day-order?date=YYYY-MM-DD
 * Get suggested task order for a specific day
 */
router.get('/day-order', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ error: 'Date parameter is required' });
    }

    const parsedDate = new Date(date as string);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ error: 'Invalid date format' });
    }

    const suggestions = await smartSchedulerService.suggestDayOrder(req.userId, parsedDate);

    res.json({
      success: true,
      data: {
        date: parsedDate.toISOString().split('T')[0],
        suggestions,
        count: suggestions.length
      }
    });
  } catch (error: any) {
    console.error('Failed to get day order:', error);
    res.status(500).json({ error: error.message || 'Failed to get day order' });
  }
});

export default router;
