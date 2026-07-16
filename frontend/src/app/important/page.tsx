'use client'

import { AppShell } from '@/layouts/AppShell'
import { TaskList } from '@/components/tasks/TaskList'

export default function ImportantTasksPage() {
  return (
    <AppShell>
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Important</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Starred tasks that need your attention first.
        </p>
      </header>
      <TaskList fixedFilter="important" />
    </AppShell>
  )
}
