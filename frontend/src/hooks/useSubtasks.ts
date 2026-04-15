import { useState } from 'react'
import { apiClient } from '@/services/api'
import { ITask, ISubtask } from '@/types'

export const useSubtasks = (task: ITask | null, onTaskUpdate: (task: ITask) => void) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const addSubtask = async (subtask: Partial<ISubtask>) => {
    if (!task) {
      setError('No task selected')
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const response = await apiClient.createSubtask(task.id, {
        title: subtask.title,
        description: subtask.description,
        estimatedTime: subtask.estimatedTime,
      })

      if (response.data.success) {
        onTaskUpdate(response.data.data.task)
      }
    } catch (err: any) {
      const message = err.response?.data?.error || 'Failed to add subtask'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const updateSubtask = async (subtaskId: string, updates: Partial<ISubtask>) => {
    if (!task) {
      setError('No task selected')
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const response = await apiClient.updateSubtask(task.id, subtaskId, {
        title: updates.title,
        description: updates.description,
        completed: updates.completed,
        estimatedTime: updates.estimatedTime,
        actualTime: updates.actualTime,
      })

      if (response.data.success) {
        onTaskUpdate(response.data.data.task)
      }
    } catch (err: any) {
      const message = err.response?.data?.error || 'Failed to update subtask'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const deleteSubtask = async (subtaskId: string) => {
    if (!task) {
      setError('No task selected')
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const response = await apiClient.deleteSubtask(task.id, subtaskId)

      if (response.data.success) {
        onTaskUpdate(response.data.data)
      }
    } catch (err: any) {
      const message = err.response?.data?.error || 'Failed to delete subtask'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const reorderSubtasks = async (subtaskIds: string[]) => {
    if (!task) {
      setError('No task selected')
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const response = await apiClient.reorderSubtasks(task.id, subtaskIds)

      if (response.data.success) {
        onTaskUpdate(response.data.data)
      }
    } catch (err: any) {
      const message = err.response?.data?.error || 'Failed to reorder subtasks'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return {
    isLoading,
    error,
    addSubtask,
    updateSubtask,
    deleteSubtask,
    reorderSubtasks,
    clearError: () => setError(null),
  }
}
