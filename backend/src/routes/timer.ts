import { Router, Response } from 'express'
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth'
import { TimerSession } from '../models/TimerSession'
import { Task } from '../models/Task'

const router = Router()

// Apply authentication to all routes
router.use(authenticateToken)

// Start timer
router.post('/start/:taskId', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { taskId } = req.params
    const { focusMode = false } = req.body

    // Check if task exists and user owns it
    const task = await Task.findById(taskId)
    if (!task) return res.status(404).json({ error: 'Task not found' })
    if (task.userId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Not authorized' })
    }

    // Stop any existing running timer for this task
    await TimerSession.updateMany(
      { taskId, userId: req.userId, endedAt: null },
      { endedAt: new Date(), duration: 0 }
    )

    // Create new timer session
    const session = new TimerSession({
      taskId,
      userId: req.userId,
      focusMode,
      sessionType: 'work',
    })

    await session.save()

    // Update task status to in-progress
    task.status = 'in-progress'
    await task.save()

    res.json({
      success: true,
      data: session,
      message: 'Timer started successfully',
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to start timer' })
  }
})

// Stop timer
router.post('/stop/:sessionId', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { sessionId } = req.params

    const session = await TimerSession.findById(sessionId)
    if (!session) return res.status(404).json({ error: 'Session not found' })
    if (session.userId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Not authorized' })
    }

    // Calculate elapsed time (exclude pause time)
    const now = new Date()
    const startTime = session.startedAt.getTime()
    const totalMs = now.getTime() - startTime - session.totalPausedTime * 1000
    const totalSeconds = Math.floor(totalMs / 1000)

    session.endedAt = now
    session.duration = totalSeconds
    await session.save()

    // Update task's total time spent
    const task = await Task.findById(session.taskId)
    if (task) {
      task.timeSpent = (task.timeSpent || 0) + totalSeconds
      await task.save()
    }

    res.json({
      success: true,
      data: session,
      durationMinutes: Math.round(totalSeconds / 60),
      message: 'Timer stopped successfully',
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to stop timer' })
  }
})

// Pause/Resume timer
router.patch('/pause/:sessionId', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { sessionId } = req.params
    const { isPaused } = req.body

    const session = await TimerSession.findById(sessionId)
    if (!session) return res.status(404).json({ error: 'Session not found' })
    if (session.userId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Not authorized' })
    }

    session.isPaused = isPaused
    if (isPaused) {
      session.pausedAt = new Date()
    } else if (session.pausedAt) {
      // Add pause duration to total paused time
      const pauseDuration = Math.floor(
        (new Date().getTime() - session.pausedAt.getTime()) / 1000
      )
      session.totalPausedTime += pauseDuration
      session.pausedAt = undefined
    }

    await session.save()

    res.json({
      success: true,
      data: session,
      isPaused: session.isPaused,
      message: isPaused ? 'Timer paused' : 'Timer resumed',
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to pause timer' })
  }
})

// Get timer history for a task
router.get('/history/:taskId', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { taskId } = req.params

    // Verify task ownership
    const task = await Task.findById(taskId)
    if (!task) return res.status(404).json({ error: 'Task not found' })
    if (task.userId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Not authorized' })
    }

    const sessions = await TimerSession.find({
      taskId,
      userId: req.userId,
    }).sort({ startedAt: -1 })

    const totalDuration = sessions.reduce((sum, s) => sum + s.duration, 0)
    const completedSessions = sessions.filter((s) => s.endedAt)

    res.json({
      success: true,
      data: {
        sessions,
        totalMinutes: Math.round(totalDuration / 60),
        sessionCount: completedSessions.length,
        averageSessionMinutes:
          completedSessions.length > 0
            ? Math.round(totalDuration / 60 / completedSessions.length)
            : 0,
      },
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch timer history' })
  }
})

// Get user's time tracking stats for today
router.get('/stats/daily', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const sessions = await TimerSession.find({
      userId,
      startedAt: { $gte: today },
      endedAt: { $exists: true },
    })

    const totalSeconds = sessions.reduce((sum, s) => sum + s.duration, 0)
    const focusSessions = sessions.filter((s) => s.focusMode).length
    const workSessions = sessions.filter((s) => s.sessionType === 'work').length
    const breakSessions = sessions.filter((s) => s.sessionType === 'break').length

    res.json({
      success: true,
      data: {
        totalMinutesToday: Math.round(totalSeconds / 60),
        sessionsCount: sessions.length,
        workSessionsCount: workSessions,
        breakSessionsCount: breakSessions,
        focusSessionsCount: focusSessions,
        averageSessionMinutes:
          sessions.length > 0 ? Math.round(totalSeconds / 60 / sessions.length) : 0,
      },
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch stats' })
  }
})

// Get user's weekly time tracking stats
router.get('/stats/weekly', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId
    const today = new Date()
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    weekAgo.setHours(0, 0, 0, 0)

    const sessions = await TimerSession.find({
      userId,
      startedAt: { $gte: weekAgo },
      endedAt: { $exists: true },
    }).sort({ startedAt: 1 })

    // Group by day
    const statsByDay: { [key: string]: any } = {}
    sessions.forEach((session) => {
      const dateKey = session.startedAt.toISOString().split('T')[0]
      if (!statsByDay[dateKey]) {
        statsByDay[dateKey] = {
          date: dateKey,
          totalSeconds: 0,
          sessionCount: 0,
          focusSessionCount: 0,
        }
      }
      statsByDay[dateKey].totalSeconds += session.duration
      statsByDay[dateKey].sessionCount += 1
      if (session.focusMode) {
        statsByDay[dateKey].focusSessionCount += 1
      }
    })

    const weeklyStats = Object.values(statsByDay).map((day: any) => ({
      ...day,
      totalMinutes: Math.round(day.totalSeconds / 60),
    }))

    const totalSeconds = sessions.reduce((sum, s) => sum + s.duration, 0)

    res.json({
      success: true,
      data: {
        byDay: weeklyStats,
        totalMinutesWeek: Math.round(totalSeconds / 60),
        totalSessionsWeek: sessions.length,
        averageMinutesPerDay:
          weeklyStats.length > 0
            ? Math.round(totalSeconds / 60 / weeklyStats.length)
            : 0,
      },
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch weekly stats' })
  }
})

export default router
