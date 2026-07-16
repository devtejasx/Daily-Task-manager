'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, CheckCircle2, Clock, ListTodo, Plus, TrendingUp } from 'lucide-react'
import { AppShell } from '@/layouts/AppShell'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { TaskList } from '@/components/tasks/TaskList'
import { TaskFormModal } from '@/components/tasks/TaskFormModal'
import { useAuthStore } from '@/store/authStore'
import { useTaskStore } from '@/store/taskStore'

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user)
  const { tasks, addTask } = useTaskStore()
  const [quickAddOpen, setQuickAddOpen] = useState(false)

  const stats = useMemo(() => {
    const total = tasks.length
    const completed = tasks.filter((t) => t.status === 'Completed').length
    const pending = total - completed
    const productivity = total === 0 ? 0 : Math.round((completed / total) * 100)
    return { total, completed, pending, productivity }
  }, [tasks])

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <AppShell>
      {/* Welcome section */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {greeting()}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {stats.pending > 0
              ? `You have ${stats.pending} pending task${stats.pending === 1 ? '' : 's'} — let's get them done.`
              : 'All caught up. Great work!'}
          </p>
        </div>
        <button
          onClick={() => setQuickAddOpen(true)}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-primary/25 transition hover:bg-primary-dark hover:shadow-md active:scale-[0.98]"
        >
          <Plus size={17} aria-hidden="true" />
          Quick Add Task
        </button>
      </motion.section>

      {/* Statistics cards */}
      <section aria-label="Task statistics" className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          index={0}
          label="Total Tasks"
          value={stats.total}
          icon={ListTodo}
          accent="bg-blue-50 text-primary dark:bg-blue-500/10 dark:text-blue-400"
        />
        <StatsCard
          index={1}
          label="Completed"
          value={stats.completed}
          icon={CheckCircle2}
          accent="bg-emerald-50 text-emerald-500 dark:bg-emerald-500/10 dark:text-emerald-400"
        />
        <StatsCard
          index={2}
          label="Pending"
          value={stats.pending}
          icon={Clock}
          accent="bg-amber-50 text-amber-500 dark:bg-amber-500/10 dark:text-amber-400"
        />
        <StatsCard
          index={3}
          label="Productivity"
          value={`${stats.productivity}%`}
          icon={TrendingUp}
          accent="bg-violet-50 text-violet-500 dark:bg-violet-500/10 dark:text-violet-400"
        />
      </section>

      {/* Recent tasks preview */}
      <section aria-label="Recent tasks">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Your Tasks</h2>
          <Link
            href="/tasks"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            View all <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </div>
        <TaskList compact limit={6} />
      </section>

      <TaskFormModal
        open={quickAddOpen}
        onClose={() => setQuickAddOpen(false)}
        onSubmit={(input) => addTask(input)}
      />
    </AppShell>
  )
}
