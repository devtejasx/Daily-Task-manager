export interface IUser {
  _id: string
  name: string
  email: string
  password: string
  level: number
  totalXP: number
  currentStreak: number
  longestStreak: number
  avatar?: string
  preferences?: {
    theme?: string
    notifications?: boolean
    language?: string
  }
  createdAt: Date
  updatedAt: Date
}

export interface CreateUserInput {
  name: string
  email: string
  password: string
}

export interface UpdateUserInput {
  name?: string
  email?: string
  avatar?: string
  preferences?: {
    theme?: string
    notifications?: boolean
    language?: string
  }
}

export interface AuthResponse {
  token: string
  user: IUser
}
