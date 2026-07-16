'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { PageLoader } from '@/components/common/Loader'

/** Root route: send signed-in users to the dashboard, everyone else to login. */
export default function Home() {
  const router = useRouter()
  const { user, initialized } = useAuthStore()

  useEffect(() => {
    // Wait for Firebase to restore the session before deciding
    if (initialized) router.replace(user ? '/dashboard' : '/login')
  }, [initialized, user, router])

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
      <PageLoader />
    </main>
  )
}
