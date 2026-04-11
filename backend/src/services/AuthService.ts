import { User, IUserDocument } from '../models/User'
import { generateToken } from '../middleware/auth'
import mongoose from 'mongoose'

export interface RegisterData {
  email: string
  name: string
  password: string
}

export interface LoginData {
  email: string
  password: string
}

export class AuthService {
  async register(data: RegisterData): Promise<{
    user: IUserDocument
    token: string
  }> {
    // Check if user exists
    const existingUser = await User.findOne({ email: data.email })
    if (existingUser) {
      throw new Error('User already exists')
    }

    // Create new user
    const user = new User({
      email: data.email,
      name: data.name,
      password: data.password,
    })

    await user.save()
    const token = generateToken(user._id.toString())

    return { user, token }
  }

  async login(
    data: LoginData
  ): Promise<{ user: IUserDocument; token: string }> {
    const user = await User.findOne({ email: data.email })
    if (!user) {
      throw new Error('Invalid email or password')
    }

    const isValidPassword = await user.comparePassword(data.password)
    if (!isValidPassword) {
      throw new Error('Invalid email or password')
    }

    user.lastLoginAt = new Date()
    await user.save()

    const token = generateToken(user._id.toString())
    return { user, token }
  }

  async getUserById(userId: string): Promise<IUserDocument | null> {
    return User.findById(userId)
  }

  async updateUser(
    userId: string,
    updateData: any
  ): Promise<IUserDocument | null> {
    return User.findByIdAndUpdate(userId, updateData, { new: true })
  }
}
