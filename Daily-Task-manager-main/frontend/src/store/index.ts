import { create } from 'zustand'
import { IUser, ITask, TaskStatus } from '@/types'

interface GamificationStats {
  level: number
  totalXP: number
  currentStreak: number
  longestStreak: number
  completedTasks: number
  achievements: number
  levelProgress: number
  nextLevelXP: number
}

interface StoreState {
  user: IUser | null
  tasks: ITask[]
  gamification: GamificationStats | null
  isAuthenticated: boolean
  isLoading: boolean

  // Auth actions
  setUser: (user: IUser | null) => void
  setAuthenticated: (auth: boolean) => void
  setLoading: (loading: boolean) => void

  // Gamification actions
  setGamification: (stats: GamificationStats) => void
  updateXP: (xpAwarded: number, leveledUp: boolean, newLevel: number) => void
  updateStreak: (streak: number) => void

  // Task actions
  setTasks: (tasks: ITask[]) => void
  addTask: (task: ITask) => void
  updateTask: (id: string, task: Partial<ITask>) => void
  removeTask: (id: string) => void
}

export const useStore = create<StoreState>((set) => ({
  user: null,
  tasks: [],
  gamification: null,
  isAuthenticated: false,
  isLoading: false,

  setUser: (user) => set({ user }),
  setAuthenticated: (auth) => set({ isAuthenticated: auth }),
  setLoading: (loading) => set({ isLoading: loading }),

  setGamification: (stats) => set({ gamification: stats }),
  updateXP: (xpAwarded, leveledUp, newLevel) =>
    set((state) => {
      if (!state.gamification) return state
      return {
        gamification: {
          ...state.gamification,
          totalXP: state.gamification.totalXP + xpAwarded,
          level: newLevel,
          levelProgress:
            ((state.gamification.totalXP + xpAwarded) /
              state.gamification.nextLevelXP) *
            100,
        },
      }
    }),
  updateStreak: (streak) =>
    set((state) => {
      if (!state.gamification) return state
      return {
        gamification: {
          ...state.gamification,
          currentStreak: streak,
          longestStreak: Math.max(state.gamification.longestStreak, streak),
        },
      }
    }),

  setTasks: (tasks) => set({ tasks }),
  addTask: (task) =>
    set((state) => ({ tasks: [...state.tasks, task] })),
  updateTask: (id, updates) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    })),
  removeTask: (id) =>
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== id),
    })),
}))
