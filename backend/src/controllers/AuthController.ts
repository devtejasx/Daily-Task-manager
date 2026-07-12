import { Request, Response } from 'express'
import { AuthService } from '../services/AuthService'
import { AuthenticatedRequest } from '../middleware/auth'

const authService = new AuthService()

export const register = async (req: Request, res: Response) => {
  try {
    const { email, name, password } = req.body

    if (!email || !name || !password) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const result = await authService.register({ email, name, password })

    return res.status(201).json({
      success: true,
      data: result,
      message: 'User registered successfully',
    })
  } catch (error: any) {
    return res.status(400).json({ error: error.message })
  }
}

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' })
    }

    const result = await authService.login({ email, password })

    return res.json({
      success: true,
      data: result,
      message: 'Login successful',
    })
  } catch (error: any) {
    return res.status(401).json({ error: error.message })
  }
}

export const getProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await authService.getUserById(req.userId!)

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    return res.json({
      success: true,
      data: user,
    })
  } catch (error: any) {
    return res.status(500).json({ error: error.message })
  }
}

export const updateProfile = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { name, theme, settings } = req.body

    const user = await authService.updateUser(req.userId!, {
      name,
      theme,
      settings,
    })

    return res.json({
      success: true,
      data: user,
      message: 'Profile updated',
    })
  } catch (error: any) {
    return res.status(500).json({ error: error.message })
  }
}
