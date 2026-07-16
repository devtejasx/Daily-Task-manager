'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { PageLoader } from '@/components/common/Loader'

/** Root route: send signed-in users to the dashboard, everyone else to login. */
export default function Home() {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)

  useEffect(() => {
    // Wait a tick for zustand-persist to rehydrate before deciding
    const id = setTimeout(() => router.replace(user ? '/dashboard' : '/login'), 50)
    return () => clearTimeout(id)
  }, [user, router])

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
      <PageLoader />
    </main>
  )
}
