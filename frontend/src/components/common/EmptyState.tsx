'use client'

import { motion } from 'framer-motion'
import { ClipboardList } from 'lucide-react'
import { ReactNode } from 'react'

interface EmptyStateProps {
  title?: string
  message?: string
  action?: ReactNode
}

/** Friendly empty state shown when a list has no items. */
export function EmptyState({
  title = 'No tasks found',
  message = 'Try changing your filters or add a new task to get started.',
  action,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 py-16 px-6 text-center"
    >
      <div className="mb-4 rounded-2xl bg-primary/10 p-4 text-primary">
        <ClipboardList size={32} aria-hidden="true" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-gray-500 dark:text-gray-400">{message}</p>
      {action && <div className="mt-5">{action}</div>}
    </motion.div>
  )
}
