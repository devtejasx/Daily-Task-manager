'use client'

import { create } from 'zustand'
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile as fbUpdateProfile,
  type User as FirebaseUser,
} from 'firebase/auth'
import { auth, googleProvider } from '@/lib/firebase'
import { UserProfile } from '@/types/task-manager'
import { useTaskStore } from './taskStore'

/**
 * Authentication state backed by Firebase Auth.
 * Firebase persists the session itself; `initialized` flips to true once
 * the first onAuthStateChanged event resolves, so guards can wait for it.
 */
interface AuthState {
  user: UserProfile | null
  /** True once Firebase has restored (or ruled out) a session. */
  initialized: boolean
  login: (email: string, password: string) => Promise<void>
  loginWithGoogle: () => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updateProfile: (patch: Partial<UserProfile>) => Promise<void>
  logout: () => Promise<void>
}

function toProfile(u: FirebaseUser): UserProfile {
  return {
    id: u.uid,
    name: u.displayName || u.email?.split('@')[0] || 'User',
    email: u.email ?? '',
    avatar: u.photoURL ?? undefined,
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  initialized: false,

  login: async (email, password) => {
    await signInWithEmailAndPassword(auth, email, password)
  },

  loginWithGoogle: async () => {
    await signInWithPopup(auth, googleProvider)
  },

  register: async (name, email, password) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    // Attach the display name, then sync it into local state (the initial
    // onAuthStateChanged event fired before the name was set)
    await fbUpdateProfile(cred.user, { displayName: name })
    set({ user: toProfile(cred.user) })
  },

  resetPassword: async (email) => {
    await sendPasswordResetEmail(auth, email)
  },

  updateProfile: async (patch) => {
    if (!auth.currentUser) return
    if (patch.name) {
      await fbUpdateProfile(auth.currentUser, { displayName: patch.name })
    }
    set({ user: toProfile(auth.currentUser) })
  },

  logout: async () => {
    await signOut(auth)
  },
}))

// Single global listener keeps the store in sync with Firebase sessions
// (login, logout, page reload restore). Client-side only.
if (typeof window !== 'undefined') {
  onAuthStateChanged(auth, (fbUser) => {
    // Clear cached tasks whenever the signed-in user changes
    useTaskStore.setState({ tasks: [], loaded: false, loading: false })
    useAuthStore.setState({ user: fbUser ? toProfile(fbUser) : null, initialized: true })
  })
}
