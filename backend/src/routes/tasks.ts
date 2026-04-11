import { Router } from 'express'
import * as TaskController from '../controllers/TaskController'
import { authenticateToken } from '../middleware/auth'

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

export default router
