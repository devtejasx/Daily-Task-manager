import React, { useState } from 'react'
import { ITask, ISubtask } from '@/types'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, ChevronDown, ChevronUp, Clock } from 'lucide-react'

interface SubtaskListProps {
  task: ITask
  onUpdate: (updatedTask: ITask) => void
  onAddSubtask: (subtask: Partial<ISubtask>) => Promise<void>
  onUpdateSubtask: (subtaskId: string, updates: Partial<ISubtask>) => Promise<void>
  onDeleteSubtask: (subtaskId: string) => Promise<void>
  isLoading?: boolean
}

export const SubtaskList: React.FC<SubtaskListProps> = ({
  task,
  onUpdate,
  onAddSubtask,
  onUpdateSubtask,
  onDeleteSubtask,
  isLoading = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [loadingSubtaskId, setLoadingSubtaskId] = useState<string | null>(null)

  const subtasks = task.subtasks || []
  const completedCount = subtasks.filter(s => s.completed).length
  const completionPercentage = task.completionPercentage || 0

  const handleAddSubtask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSubtaskTitle.trim()) return

    try {
      setLoadingSubtaskId('adding')
      await onAddSubtask({
        title: newSubtaskTitle,
        estimatedTime: 30,
      })
      setNewSubtaskTitle('')
      setIsAdding(false)
    } catch (error) {
      console.error('Failed to add subtask:', error)
    } finally {
      setLoadingSubtaskId(null)
    }
  }

  const handleToggleSubtask = async (subtaskId: string, currentCompleted: boolean) => {
    try {
      setLoadingSubtaskId(subtaskId)
      await onUpdateSubtask(subtaskId, { completed: !currentCompleted })
    } catch (error) {
      console.error('Failed to update subtask:', error)
    } finally {
      setLoadingSubtaskId(null)
    }
  }

  const handleDeleteSubtask = async (subtaskId: string) => {
    if (window.confirm('Delete this subtask?')) {
      try {
        setLoadingSubtaskId(subtaskId)
        await onDeleteSubtask(subtaskId)
      } catch (error) {
        console.error('Failed to delete subtask:', error)
      } finally {
        setLoadingSubtaskId(null)
      }
    }
  }

  return (
    <div className="mt-4 border-t pt-4">
      {/* Subtask Progress Bar */}
      {subtasks.length > 0 && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-700">
                Progress: {completionPercentage}%
              </span>
              <span className="text-xs text-gray-500">
                ({completedCount}/{subtasks.length})
              </span>
            </div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition"
            >
              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              {subtasks.length} {subtasks.length === 1 ? 'subtask' : 'subtasks'}
            </button>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <motion.div
              className="bg-blue-500 h-2 rounded-full"
              animate={{ width: `${completionPercentage}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>
      )}

      {/* Subtask List */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-2"
          >
            {subtasks.map((subtask) => (
              <motion.div
                key={subtask._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
              >
                <input
                  type="checkbox"
                  checked={subtask.completed}
                  onChange={() => handleToggleSubtask(subtask._id, subtask.completed)}
                  disabled={loadingSubtaskId === subtask._id}
                  className="w-4 h-4 cursor-pointer disabled:opacity-50"
                />

                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm transition ${
                      subtask.completed
                        ? 'line-through text-gray-400'
                        : 'text-gray-700'
                    }`}
                  >
                    {subtask.title}
                  </p>
                  {subtask.description && (
                    <p className="text-xs text-gray-500 mt-1 truncate">
                      {subtask.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {subtask.estimatedTime && (
                    <span className="flex items-center gap-1 text-xs text-gray-500 bg-white px-2 py-1 rounded whitespace-nowrap">
                      <Clock size={12} />
                      {subtask.estimatedTime}m
                    </span>
                  )}

                  <button
                    onClick={() => handleDeleteSubtask(subtask._id)}
                    disabled={loadingSubtaskId === subtask._id}
                    className="text-red-500 hover:text-red-700 transition disabled:opacity-50"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </motion.div>
            ))}

            {/* Add Subtask Form */}
            {isAdding || subtasks.length === 0 ? (
              <motion.form
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={handleAddSubtask}
                className="flex gap-2"
              >
                <input
                  type="text"
                  placeholder="Add a subtask..."
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  disabled={loadingSubtaskId !== null}
                  className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-blue-500 disabled:bg-gray-100"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={loadingSubtaskId !== null || !newSubtaskTitle.trim()}
                  className="px-3 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition disabled:bg-blue-300"
                >
                  {loadingSubtaskId === 'adding' ? 'Adding...' : 'Add'}
                </button>
              </motion.form>
            ) : (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => setIsAdding(true)}
                className="flex items-center gap-2 w-full p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition text-sm"
              >
                <Plus size={16} />
                Add subtask
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick add button when collapsed */}
      {!isExpanded && subtasks.length === 0 && (
        <button
          onClick={() => setIsExpanded(true)}
          className="flex items-center gap-2 w-full p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition text-sm"
        >
          <Plus size={16} />
          Add subtasks to break down this task
        </button>
      )}
    </div>
  )
}

export default SubtaskList
