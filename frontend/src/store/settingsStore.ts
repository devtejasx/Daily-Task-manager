'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { NotificationSettings } from '@/types/task-manager'

interface SettingsState {
  theme: 'light' | 'dark'
  notifications: NotificationSettings
  setTheme: (theme: 'light' | 'dark') => void
  toggleTheme: () => void
  setNotification: (key: keyof NotificationSettings, value: boolean) => void
}

/** Keep the <html> class in sync so Tailwind's `dark:` variants apply. */
function applyTheme(theme: 'light' | 'dark') {
  if (typeof document === 'undefined') return
  document.documentElement.classList.toggle('dark', theme === 'dark')
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      notifications: {
        email: true,
        push: false,
        taskReminders: true,
        weeklySummary: true,
      },

      setTheme: (theme) => {
        applyTheme(theme)
        set({ theme })
      },

      toggleTheme: () => get().setTheme(get().theme === 'light' ? 'dark' : 'light'),

      setNotification: (key, value) =>
        set((state) => ({
          notifications: { ...state.notifications, [key]: value },
        })),
    }),
    {
      name: 'taskmaster.settings',
      onRehydrateStorage: () => (state) => {
        // Re-apply persisted theme on page load
        if (state) applyTheme(state.theme)
      },
    }
  )
)
