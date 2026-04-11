import { useEffect, useState } from 'react'
import { useStore } from '@/store'
import { apiClient } from '@/services/api'
import { IUser } from '@/types'

export const useAuth = () => {
  const { user, setUser, setAuthenticated, isAuthenticated } = useStore()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token')
      if (token) {
        try {
          const response = await apiClient.getProfile()
          setUser(response.data.data)
          setAuthenticated(true)
        } catch (error) {
          localStorage.removeItem('token')
          setUser(null)
          setAuthenticated(false)
        }
      }
      setIsLoading(false)
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await apiClient.login(email, password)
      localStorage.setItem('token', response.data.data.token)
      setUser(response.data.data.user)
      setAuthenticated(true)
      return response.data.data
    } catch (error) {
      throw error
    }
  }

  const register = async (email: string, name: string, password: string) => {
    try {
      const response = await apiClient.register(email, name, password)
      localStorage.setItem('token', response.data.data.token)
      setUser(response.data.data.user)
      setAuthenticated(true)
      return response.data.data
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
    setAuthenticated(false)
  }

  const updateProfile = async (data: any) => {
    try {
      const response = await apiClient.updateProfile(data)
      setUser(response.data.data)
      return response.data.data
    } catch (error) {
      throw error
    }
  }

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
  }
}
