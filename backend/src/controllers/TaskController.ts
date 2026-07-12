import { Response } from 'express'
import { TaskService } from '../services/TaskService'
import { AchievementService } from '../services/AchievementService'
import { AuthenticatedRequest } from '../middleware/auth'

const taskService = new TaskService()
const achievementService = new AchievementService()

export const createTask = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const task = await taskService.createTask(req.userId!, req.body)

    return res.status(201).json({
      success: true,
      data: task,
      message: 'Task created successfully',
    })
  } catch (error: any) {
    return res.status(400).json({ success: false, error: error.message })
  }
}

export const getTasks = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const tasks = await taskService.getUserTasks(req.userId!, req.query)

    return res.json({
      success: true,
      data: tasks,
    })
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message })
  }
}

export const getTask = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const task = await taskService.getTaskById(req.params.id)

    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found' })
    }

    return res.json({
      success: true,
      data: task,
    })
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message })
  }
}

export const updateTask = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const task = await taskService.updateTask(req.params.id, req.body)

    return res.json({
      success: true,
      data: task,
      message: 'Task updated successfully',
    })
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message })
  }
}

export const deleteTask = async (req: AuthenticatedRequest, res: Response) => {
  try {
    await taskService.deleteTask(req.params.id)

    return res.json({
      success: true,
      message: 'Task deleted successfully',
    })
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message })
  }
}

export const completeTask = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const result = await taskService.completeTask(req.params.id, req.userId!)

    // Check achievements
    const achievements = await achievementService.checkAndUnlockAchievements(
      req.userId!
    )

    return res.json({
      success: true,
      data: {
        task: result.task,
        xpAwarded: result.xpAwarded,
        leveledUp: result.leveledUp,
        newLevel: result.newLevel,
        achievements,
      },
      message: 'Task completed successfully',
    })
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message })
  }
}

export const searchTasks = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { q } = req.query
    const tasks = await taskService.searchTasks(req.userId!, q as string)

    return res.json({
      success: true,
      data: tasks,
    })
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message })
  }
}

export const getTodaysTasks = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const tasks = await taskService.getTodaysTasks(req.userId!)

    return res.json({
      success: true,
      data: tasks,
    })
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message })
  }
}
