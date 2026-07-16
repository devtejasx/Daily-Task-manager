'use client'

import { create } from 'zustand'
import { toast } from 'sonner'
import { Task, TaskInput } from '@/types/task-manager'
import * as taskService from '@/services/taskService'

/**
 * Global task state. All mutations go through taskService so the persistence
 * backend (localStorage today, Firestore later) stays swappable.
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
    } catch {
      toast.error('Failed to load tasks')
    } finally {
      set({ loading: false })
    }
  },

  addTask: async (input) => {
    const task = await taskService.addTask(input)
    set({ tasks: [task, ...get().tasks] })
    toast.success('Task added')
  },

  updateTask: async (id, patch) => {
    const updated = await taskService.updateTask(id, patch)
    set({ tasks: get().tasks.map((t) => (t.id === id ? updated : t)) })
    toast.success('Task updated')
  },

  deleteTask: async (id) => {
    await taskService.deleteTask(id)
    set({ tasks: get().tasks.filter((t) => t.id !== id) })
    toast.success('Task deleted')
  },

  toggleComplete: async (task) => {
    const updated = await taskService.toggleComplete(task)
    set({ tasks: get().tasks.map((t) => (t.id === task.id ? updated : t)) })
    toast.success(updated.status === 'Completed' ? 'Task completed 🎉' : 'Task reopened')
  },
}))
