'use client'

import { ReactNode, useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/store/authStore'
import { Sidebar } from '@/components/layout/Sidebar'
import { TopNavbar } from '@/components/layout/TopNavbar'
import { PageLoader } from '@/components/common/Loader'

/**
 * Authenticated app shell: sidebar + top navbar + animated page content.
 * Redirects to /login when there is no (mock) session.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const user = useAuthStore((s) => s.user)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  // zustand persist rehydrates after mount — wait a tick before deciding auth
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => setHydrated(true), [])

  useEffect(() => {
    if (hydrated && !user) router.replace('/login')
  }, [hydrated, user, router])

  if (!hydrated || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
        <PageLoader />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar mobileOpen={sidebarOpen} onMobileClose={() => setSidebarOpen(false)} />

      <div className="lg:pl-64">
        <TopNavbar onMenuClick={() => setSidebarOpen(true)} />

        {/* Keyed by route so navigation gets a subtle fade/slide transition */}
        <motion.main
          key={pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8"
        >
          {children}
        </motion.main>
      </div>
    </div>
  )
}
