import { Router, Request, Response } from 'express'
import mongoose from 'mongoose'
import { Task } from '../models/Task'
import { authenticateToken } from '../middleware/auth'

const router = Router({ mergeParams: true }) // Merge parent params

// Helper functions
function calculateCompletion(subtasks: any[]): number {
  if (subtasks.length === 0) return 0
  const completed = subtasks.filter(s => s.completed).length
  return Math.round((completed / subtasks.length) * 100)
}

function allSubtasksDone(subtasks: any[]): boolean {
  return subtasks.length > 0 && subtasks.every(s => s.completed)
}

// Create subtask
router.post('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params
    const { title, description, estimatedTime } = req.body
    const userId = (req as any).user.id

    // Validate
    if (!title) {
      return res.status(400).json({ error: 'Subtask title required' })
    }

    // Find parent task
    const task = await Task.findById(taskId)
    if (!task) {
      return res.status(404).json({ error: 'Task not found' })
    }

    // Verify ownership
    if (task.userId.toString() !== userId) {
      return res.status(403).json({ error: 'Not authorized' })
    }

    // Create subtask
    const subtask = {
      _id: new mongoose.Types.ObjectId(),
      title,
      description,
      completed: false,
      estimatedTime,
      order: task.subtasks?.length || 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // Add to task
    if (!task.subtasks) {
      task.subtasks = []
    }
    task.subtasks.push(subtask)

    // Update completion percentage
    task.completionPercentage = calculateCompletion(task.subtasks)

    await task.save()

    res.status(201).json({
      success: true,
      data: { task, subtask },
    })
  } catch (error) {
    console.error('Failed to create subtask:', error)
    res.status(500).json({ error: 'Failed to create subtask' })
  }
})

// Update subtask
router.put('/:subtaskId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { taskId, subtaskId } = req.params
    const { title, description, completed, estimatedTime, actualTime } = req.body
    const userId = (req as any).user.id

    const task = await Task.findById(taskId)
    if (!task) return res.status(404).json({ error: 'Task not found' })

    // Verify ownership
    if (task.userId.toString() !== userId) {
      return res.status(403).json({ error: 'Not authorized' })
    }

    // Find subtask
    const subtask = task.subtasks?.find(s => s._id.toString() === subtaskId)
    if (!subtask) return res.status(404).json({ error: 'Subtask not found' })

    // Update fields
    if (title !== undefined) subtask.title = title
    if (description !== undefined) subtask.description = description
    if (completed !== undefined) {
      subtask.completed = completed
      subtask.completedAt = completed ? new Date() : undefined
    }
    if (estimatedTime !== undefined) subtask.estimatedTime = estimatedTime
    if (actualTime !== undefined) subtask.actualTime = actualTime

    subtask.updatedAt = new Date()

    // Update completion percentage
    task.completionPercentage = calculateCompletion(task.subtasks)

    // Update parent task completion if all subtasks done
    if (allSubtasksDone(task.subtasks) && task.status !== 'completed') {
      task.status = 'completed'
      task.completedAt = new Date()
    }

    await task.save()

    res.json({
      success: true,
      data: { task, subtask },
    })
  } catch (error) {
    console.error('Failed to update subtask:', error)
    res.status(500).json({ error: 'Failed to update subtask' })
  }
})

// Delete subtask
router.delete('/:subtaskId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { taskId, subtaskId } = req.params
    const userId = (req as any).user.id

    const task = await Task.findById(taskId)
    if (!task) return res.status(404).json({ error: 'Task not found' })

    if (task.userId.toString() !== userId) {
      return res.status(403).json({ error: 'Not authorized' })
    }

    // Remove subtask
    task.subtasks = task.subtasks?.filter(s => s._id.toString() !== subtaskId) || []

    // Update completion percentage
    task.completionPercentage = calculateCompletion(task.subtasks)

    await task.save()

    res.json({
      success: true,
      message: 'Subtask deleted',
      data: task,
    })
  } catch (error) {
    console.error('Failed to delete subtask:', error)
    res.status(500).json({ error: 'Failed to delete subtask' })
  }
})

// Reorder subtasks
router.patch('/reorder', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params
    const { subtaskIds } = req.body // Array of subtask IDs in new order
    const userId = (req as any).user.id

    if (!Array.isArray(subtaskIds)) {
      return res.status(400).json({ error: 'subtaskIds must be an array' })
    }

    const task = await Task.findById(taskId)
    if (!task) return res.status(404).json({ error: 'Task not found' })

    if (task.userId.toString() !== userId) {
      return res.status(403).json({ error: 'Not authorized' })
    }

    // Reorder subtasks
    const reorderedSubtasks = subtaskIds
      .map((id: string, index: number) => {
        const subtask = task.subtasks?.find(s => s._id.toString() === id)
        if (subtask) {
          subtask.order = index
        }
        return subtask
      })
      .filter(Boolean)

    task.subtasks = reorderedSubtasks

    await task.save()

    res.json({
      success: true,
      data: task,
    })
  } catch (error) {
    console.error('Failed to reorder subtasks:', error)
    res.status(500).json({ error: 'Failed to reorder subtasks' })
  }
})

export default router
