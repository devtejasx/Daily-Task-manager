'use client'

import { create } from 'zustand'
import { toast } from 'sonner'
import { Task, TaskInput } from '@/types/task-manager'
import * as taskService from '@/services/taskService'

/**
 * Global task state. All mutations go through taskService (Firestore).
 * The store keeps an optimistic local copy so the UI updates instantly.
 */
interface TaskState {
  tasks: Task[]
  loading: boolean
  loaded: boolean
  fetchTasks: () => Promise<void>
  addTask: (input: TaskInput) => Promise<void>
  updateTask: (id: string, patch: Partial<Task>) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  toggleComplete: (task: Task) => Promise<void>
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  loading: false,
  loaded: false,

  fetchTasks: async () => {
    if (get().loading) return
    set({ loading: true })
    try {
      const tasks = await taskService.getTasks()
      set({ tasks, loaded: true })
    } catch (error) {
      console.error('Failed to load tasks:', error)
      toast.error('Failed to load tasks — check your connection')
    } finally {
      set({ loading: false })
    }
  },

  addTask: async (input) => {
    try {
      const task = await taskService.addTask(input)
      set({ tasks: [task, ...get().tasks] })
      toast.success('Task added')
    } catch (error) {
      console.error('Failed to add task:', error)
      toast.error('Failed to add task')
      throw error
    }
  },

  updateTask: async (id, patch) => {
    try {
      await taskService.updateTask(id, patch)
      set({ tasks: get().tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)) })
      toast.success('Task updated')
    } catch (error) {
      console.error('Failed to update task:', error)
      toast.error('Failed to update task')
      throw error
    }
  },

  deleteTask: async (id) => {
    try {
      await taskService.deleteTask(id)
      set({ tasks: get().tasks.filter((t) => t.id !== id) })
      toast.success('Task deleted')
    } catch (error) {
      console.error('Failed to delete task:', error)
      toast.error('Failed to delete task')
      throw error
    }
  },

  toggleComplete: async (task) => {
    const completing = task.status !== 'Completed'
    const patch: Partial<Task> = {
      status: completing ? 'Completed' : 'Pending',
      completedAt: completing ? new Date().toISOString() : undefined,
    }
    try {
      await taskService.updateTask(task.id, patch)
      set({
        tasks: get().tasks.map((t) => (t.id === task.id ? { ...t, ...patch } : t)),
      })
      toast.success(completing ? 'Task completed 🎉' : 'Task reopened')
    } catch (error) {
      console.error('Failed to toggle task:', error)
      toast.error('Failed to update task')
    }
  },
}))
