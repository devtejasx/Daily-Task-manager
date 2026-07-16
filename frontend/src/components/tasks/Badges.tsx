'use client'

import { Priority, Status } from '@/types/task-manager'

const priorityStyles: Record<Priority, string> = {
  High: 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 ring-red-600/20',
  Medium: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 ring-amber-600/20',
  Low: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 ring-emerald-600/20',
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${priorityStyles[priority]}`}
    >
      {priority}
    </span>
  )
}

const statusStyles: Record<Status, string> = {
  Pending: 'bg-blue-50 text-primary dark:bg-blue-500/10 dark:text-blue-400 ring-blue-600/20',
  Completed: 'bg-gray-100 text-gray-600 dark:bg-gray-500/10 dark:text-gray-400 ring-gray-500/20',
}

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${statusStyles[status]}`}
    >
      {status}
    </span>
  )
}

export function CategoryBadge({ category }: { category: string }) {
  return (
    <span className="inline-flex items-center rounded-full bg-violet-50 dark:bg-violet-500/10 px-2.5 py-0.5 text-xs font-medium text-violet-600 dark:text-violet-400 ring-1 ring-inset ring-violet-600/20">
      {category}
    </span>
  )
}
