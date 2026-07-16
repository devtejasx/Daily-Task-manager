'use client'

import { motion } from 'framer-motion'
import { Calendar, Check, Pencil, RotateCcw, Star, Trash2 } from 'lucide-react'
import { Task } from '@/types/task-manager'
import { PriorityBadge, StatusBadge, CategoryBadge } from './Badges'

interface TaskCardProps {
  task: Task
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
  onToggleComplete: (task: Task) => void
  onToggleImportant: (task: Task) => void
}

/** Format an ISO date (yyyy-MM-dd) for display, flagging overdue tasks. */
function formatDueDate(iso: string): { label: string; overdue: boolean } {
  const due = new Date(`${iso}T23:59:59`)
  const overdue = due.getTime() < Date.now()
  const label = due.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  return { label, overdue }
}

export function TaskCard({ task, onEdit, onDelete, onToggleComplete, onToggleImportant }: TaskCardProps) {
  const completed = task.status === 'Completed'
  const { label: dueLabel, overdue } = formatDueDate(task.dueDate)

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      className={`group flex flex-col rounded-2xl border bg-white dark:bg-gray-900 p-5 shadow-sm transition-shadow hover:shadow-md ${
        completed
          ? 'border-gray-100 dark:border-gray-800 opacity-75'
          : 'border-gray-100 dark:border-gray-800'
      }`}
      aria-label={`Task: ${task.title}`}
    >
      {/* Header: title + important star */}
      <div className="flex items-start justify-between gap-2">
        <h3
          className={`font-semibold text-gray-900 dark:text-white leading-snug ${
            completed ? 'line-through text-gray-400 dark:text-gray-500' : ''
          }`}
        >
          {task.title}
        </h3>
        <button
          onClick={() => onToggleImportant(task)}
          aria-label={task.important ? 'Remove from important' : 'Mark as important'}
          aria-pressed={task.important}
          className={`shrink-0 rounded-lg p-1 transition ${
            task.important
              ? 'text-amber-400 hover:text-amber-500'
              : 'text-gray-300 dark:text-gray-600 hover:text-amber-400'
          }`}
        >
          <Star size={18} fill={task.important ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Description */}
      {task.description && (
        <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Badges */}
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <PriorityBadge priority={task.priority} />
        <StatusBadge status={task.status} />
        <CategoryBadge category={task.category} />
      </div>

      {/* Footer: due date + actions */}
      <div className="mt-4 flex items-center justify-between border-t border-gray-50 dark:border-gray-800 pt-3">
        <span
          className={`inline-flex items-center gap-1.5 text-xs font-medium ${
            overdue && !completed ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          <Calendar size={13} aria-hidden="true" />
          {dueLabel}
          {overdue && !completed && <span className="text-red-500">· Overdue</span>}
        </span>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onToggleComplete(task)}
            aria-label={completed ? 'Mark as pending' : 'Mark as completed'}
            title={completed ? 'Reopen task' : 'Complete task'}
            className={`rounded-lg p-1.5 transition ${
              completed
                ? 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                : 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10'
            }`}
          >
            {completed ? <RotateCcw size={16} /> : <Check size={16} />}
          </button>
          <button
            onClick={() => onEdit(task)}
            aria-label={`Edit ${task.title}`}
            title="Edit task"
            className="rounded-lg p-1.5 text-gray-400 transition hover:bg-blue-50 hover:text-primary dark:hover:bg-blue-500/10"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={() => onDelete(task)}
            aria-label={`Delete ${task.title}`}
            title="Delete task"
            className="rounded-lg p-1.5 text-gray-400 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </motion.article>
  )
}
