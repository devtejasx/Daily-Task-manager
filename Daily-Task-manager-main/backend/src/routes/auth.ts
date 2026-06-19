import { Router } from 'express'
import * as AuthController from '../controllers/AuthController'
import { authenticateToken } from '../middleware/auth'

const router = Router()

router.post('/register', AuthController.register)
router.post('/login', AuthController.login)
router.get('/profile', authenticateToken, AuthController.getProfile)
router.put('/profile', authenticateToken, AuthController.updateProfile)

export default router
