import { useEffect, useState } from 'react'
import { useStore } from '@/store'
import { apiClient } from '@/services/api'
import { ITask } from '@/types'

export const useTasks = () => {
  const { tasks, setTasks, addTask, updateTask, removeTask } = useStore()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTasks = async (filters?: any) => {
    try {
      setIsLoading(true)
      const response = await apiClient.getTasks(filters)
      setTasks(response.data.data)
      setError(null)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const createTask = async (task: any) => {
    try {
      const response = await apiClient.createTask(task)
      addTask(response.data.data)
      return response.data.data
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const editTask = async (id: string, task: any) => {
    try {
      const response = await apiClient.updateTask(id, task)
      updateTask(id, response.data.data)
      return response.data.data
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const deleteTaskItem = async (id: string) => {
    try {
      await apiClient.deleteTask(id)
      removeTask(id)
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const completeTaskItem = async (id: string) => {
    try {
      const response = await apiClient.completeTask(id)
      updateTask(id, response.data.data.task)
      return response.data.data
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const getTodaysTasks = async () => {
    try {
      setIsLoading(true)
      const response = await apiClient.getTodaysTasks()
      return response.data.data
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const searchTasks = async (query: string) => {
    try {
      const response = await apiClient.searchTasks(query)
      return response.data.data
    } catch (err: any) {
      setError(err.message)
    }
  }

  return {
    tasks,
    isLoading,
    error,
    fetchTasks,
    createTask,
    editTask,
    deleteTaskItem,
    completeTaskItem,
    getTodaysTasks,
    searchTasks,
  }
}
