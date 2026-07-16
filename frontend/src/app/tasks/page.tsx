'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { AppShell } from '@/layouts/AppShell'
import { TaskList } from '@/components/tasks/TaskList'
import { PageLoader } from '@/components/common/Loader'

function AllTasksContent() {
  // Navbar search routes here as /tasks?q=<query>
  const searchParams = useSearchParams()
  const q = searchParams.get('q') ?? ''

  return (
    <>
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">All Tasks</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Search, filter, and manage everything in one place.
        </p>
      </header>
      <TaskList initialSearch={q} />
    </>
  )
}

export default function AllTasksPage() {
  return (
    <AppShell>
      {/* useSearchParams requires a Suspense boundary in the App Router */}
      <Suspense fallback={<PageLoader />}>
        <AllTasksContent />
      </Suspense>
    </AppShell>
  )
}
