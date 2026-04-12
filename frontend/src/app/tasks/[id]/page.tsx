'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Edit, Trash2, CheckCircle2, Clock, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { useTasks } from '@/hooks/useTasks'
import { toast } from 'sonner'
import { ITask } from '@/types'

export default function TaskDetailPage() {
  const params = useParams()
  const taskId = params.id as string
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const { getTask, deleteTask, completeTask } = useTasks()
  const [task, setTask] = useState<ITask | null>(null)
  const [isLoadingTask, setIsLoadingTask] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, isLoading, router])

  useEffect(() => {
    if (isAuthenticated && taskId) {
      loadTask()
    }
  }, [isAuthenticated, taskId])

  const loadTask = async () => {
    try {
      setIsLoadingTask(true)
      const loadedTask = await getTask(taskId)
      if (loadedTask) {
        setTask(loadedTask)
      } else {
        toast.error('Task not found')
        router.push('/tasks')
      }
    } finally {
      setIsLoadingTask(false)
    }
  }

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this task?')) {
      setIsDeleting(true)
      const success = await deleteTask(taskId)
      if (success) {
        router.push('/tasks')
      }
      setIsDeleting(false)
    }
  }

  const handleComplete = async () => {
    const result = await completeTask(taskId)
    if (result) {
      setTask(result.task)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'Low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'Hard':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle2 className="w-6 h-6 text-green-500" />
      case 'InProgress':
        return <Clock className="w-6 h-6 text-blue-500" />
      case 'NotStarted':
        return <AlertCircle className="w-6 h-6 text-gray-500" />
      default:
        return null
    }
  }

  if (isLoading || isLoadingTask) {
    return (
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </main>
    )
  }

  if (!task) {
    return (
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">Task not found</p>
          <Link href="/tasks" className="mt-4 inline-block text-blue-600 hover:text-blue-700">
            Back to tasks
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Link href="/tasks" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div className="flex items-center gap-3">
              {getStatusIcon(task.status)}
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">{task.title}</h1>
            </div>
          </div>
          <div className="flex gap-2">
            {task.status !== 'Completed' && (
              <button
                onClick={handleComplete}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                Complete
              </button>
            )}
            <Link
              href={`/tasks/${taskId}/edit`}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
            >
              <Edit className="w-5 h-5" />
              Edit
            </Link>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition flex items-center gap-2"
            >
              <Trash2 className="w-5 h-5" />
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
          {/* Description */}
          {task.description && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Description</h2>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{task.description}</p>
            </div>
          )}

          {/* Task Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              {/* Priority */}
              <div>
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Priority</h3>
                <span className={`inline-block px-3 py-1 rounded-lg text-sm font-semibold ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
              </div>

              {/* Difficulty */}
              <div>
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Difficulty</h3>
                <span className={`inline-block px-3 py-1 rounded-lg text-sm font-semibold ${getDifficultyColor(task.difficulty)}`}>
                  {task.difficulty}
                </span>
              </div>

              {/* Category */}
              <div>
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Category</h3>
                <p className="text-gray-900 dark:text-white">{task.category}</p>
              </div>

              {/* Status */}
              <div>
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Status</h3>
                <p className="text-gray-900 dark:text-white capitalize">{task.status}</p>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {/* Due Date */}
              {task.dueDate && (
                <div>
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Due Date</h3>
                  <p className="text-gray-900 dark:text-white">
                    {new Date(task.dueDate).toLocaleDateString()} {task.dueTime && `at ${task.dueTime}`}
                  </p>
                </div>
              )}

              {/* Start Date */}
              {task.startDate && (
                <div>
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Start Date</h3>
                  <p className="text-gray-900 dark:text-white">
                    {new Date(task.startDate).toLocaleDateString()}
                  </p>
                </div>
              )}

              {/* Estimated Duration */}
              {task.estimatedDuration && (
                <div>
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Estimated Duration</h3>
                  <p className="text-gray-900 dark:text-white">{task.estimatedDuration} minutes</p>
                </div>
              )}

              {/* XP Reward */}
              <div>
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">XP Reward</h3>
                <p className="text-gray-900 dark:text-white flex items-center gap-2">
                  <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded text-sm font-semibold">
                    +{task.xpReward} XP
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {task.tags.map((tag: string, index: number) => (
                  <span
                    key={index}
                    className="inline-block px-3 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded-full text-sm font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Completion Info */}
          {task.completedAt && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Completed</h3>
              <p className="text-gray-900 dark:text-white">
                {new Date(task.completedAt).toLocaleDateString()} at{' '}
                {new Date(task.completedAt).toLocaleTimeString()}
              </p>
            </div>
          )}

          {/* Time Tracking */}
          {task.timeSpent && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Time Spent</h3>
              <p className="text-gray-900 dark:text-white">{task.timeSpent} minutes</p>
            </div>
          )}

          {/* Completion Percentage */}
          {task.completionPercentage !== undefined && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Progress</h3>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${task.completionPercentage || 0}%` }}
                ></div>
              </div>
              <p className="text-gray-900 dark:text-white mt-2">{task.completionPercentage || 0}%</p>
            </div>
          )}
        </div>
      </motion.div>
    </main>
  )
}
