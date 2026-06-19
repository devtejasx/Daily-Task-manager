import { Router } from 'express'
import * as TaskController from '../controllers/TaskController'
import { authenticateToken } from '../middleware/auth'
import subtasksRouter from './subtasks'

const router = Router()

router.use(authenticateToken)

router.post('/', TaskController.createTask)
router.get('/', TaskController.getTasks)
router.get('/today', TaskController.getTodaysTasks)
router.get('/search', TaskController.searchTasks)
router.get('/:id', TaskController.getTask)
router.put('/:id', TaskController.updateTask)
router.delete('/:id', TaskController.deleteTask)
router.post('/:id/complete', TaskController.completeTask)

// Subtasks routes
router.use('/:taskId/subtasks', subtasksRouter)

export default router
