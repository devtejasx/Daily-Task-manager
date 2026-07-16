'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { UserProfile } from '@/types/task-manager'

/**
 * Mock authentication store.
 *
 * FIREBASE INTEGRATION: replace login/register/loginWithGoogle with
 * signInWithEmailAndPassword / createUserWithEmailAndPassword /
 * signInWithPopup(GoogleAuthProvider) and hydrate `user` from
 * onAuthStateChanged. The rest of the app only reads `user` and calls
 * these actions, so no UI changes are needed.
 */
interface AuthState {
  user: UserProfile | null
  login: (email: string, password: string) => Promise<void>
  loginWithGoogle: () => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  updateProfile: (patch: Partial<UserProfile>) => void
  logout: () => void
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,

      login: async (email, _password) => {
        await delay(600) // simulate auth round-trip
        set({
          user: {
            id: 'mock-user-1',
            name: email.split('@')[0].replace(/[._]/g, ' '),
            email,
          },
        })
      },

      loginWithGoogle: async () => {
        await delay(600)
        set({
          user: {
            id: 'mock-google-user',
            name: 'Demo User',
            email: 'demo.user@gmail.com',
          },
        })
      },

      register: async (name, email, _password) => {
        await delay(600)
        set({ user: { id: crypto.randomUUID(), name, email } })
      },

      updateProfile: (patch) =>
        set((state) => (state.user ? { user: { ...state.user, ...patch } } : state)),

      logout: () => set({ user: null }),
    }),
    { name: 'taskmaster.auth' }
  )
)
