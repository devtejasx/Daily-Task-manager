'use client'

import { motion } from 'framer-motion'

interface TaskCardProps {
  title: string
  priority: 'Critical' | 'High' | 'Medium' | 'Low'
  dueDate?: string
  completed?: boolean
  onClick?: () => void
  onComplete?: () => void
}

const priorityColors: Record<string, string> = {
  Critical: 'bg-red-500',
  High: 'bg-orange-500',
  Medium: 'bg-yellow-500',
  Low: 'bg-green-500',
}

export const TaskCard = ({
  title,
  priority,
  dueDate,
  completed,
  onClick,
  onComplete,
}: TaskCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`p-4 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer transition-all hover:shadow-md ${
        completed ? 'bg-gray-100 dark:bg-gray-800' : 'bg-white dark:bg-gray-900'
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={completed}
              onChange={onComplete}
              className="w-5 h-5 rounded cursor-pointer"
              onClick={(e) => e.stopPropagation()}
            />
            <h3
              className={`font-medium ${
                completed ? 'line-through text-gray-500' : ''
              }`}
            >
              {title}
            </h3>
          </div>
          {dueDate && (
            <p className="text-sm text-gray-500 mt-1 ml-7">{dueDate}</p>
          )}
        </div>
        <div className={`px-2 py-1 rounded text-white text-xs font-medium ${priorityColors[priority]}`}>
          {priority}
        </div>
      </div>
    </motion.div>
  )
}
