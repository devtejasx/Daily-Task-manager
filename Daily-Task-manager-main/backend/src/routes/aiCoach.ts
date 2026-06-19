import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { aiCoachService } from '../services/aiCoach';

const router = Router();

// Get AI insights
router.get('/insights', authenticate, async (req: Request, res: Response) => {
  try {
    const insights = await aiCoachService.generateInsights(req.user.id);

    res.json({
      success: true,
      data: {
        insights,
        generatedAt: new Date(),
        nextRefresh: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      }
    });
  } catch (error) {
    console.error('Coach error:', error);
    res.status(500).json({ error: 'Failed to generate insights' });
  }
});

// Get specific recommendation
router.post('/recommendation', authenticate, async (req: Request, res: Response) => {
  try {
    const { topic } = req.body; // e.g., "productivity", "streaks", "time-management"

    // Generate specific recommendation based on topic
    const recommendation = await generateSpecificRecommendation(
      req.user.id,
      topic
    );

    res.json({
      success: true,
      data: recommendation
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate recommendation' });
  }
});

export default router;
