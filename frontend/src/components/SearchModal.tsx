'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, X, Clock, Flag } from 'lucide-react'
import { ITask } from '@/types'
import { apiClient } from '@/services/api'

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<ITask[]>([])
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }

    const timer = setTimeout(() => {
      performSearch()
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  const performSearch = async () => {
    try {
      setIsSearching(true)
      const response = await apiClient.searchTasks(query)
      setResults(response.data.data || [])
    } catch (error) {
      console.error('Search failed:', error)
      setResults([])
    } finally {
      setIsSearching(false)
    }
  }

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-20"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl mx-4 bg-gray-900 border border-gray-700 rounded-lg shadow-2xl"
      >
        {/* Search Header */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-700">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            autoFocus
            type="text"
            placeholder="Search tasks, descriptions, and tags..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent outline-none text-white placeholder-gray-500"
          />
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-800 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Results */}
        <div className="max-h-96 overflow-y-auto">
          {isSearching ? (
            <div className="p-6 text-center text-gray-400">Searching...</div>
          ) : results.length > 0 ? (
            <div className="divide-y divide-gray-700">
              {results.map((task) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-4 hover:bg-gray-800/50 cursor-pointer transition"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-medium truncate">
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className="text-sm text-gray-400 truncate line-clamp-2">
                          {task.description}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-2">
                        <span
                          className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded ${
                            task.priority === 'Critical'
                              ? 'bg-red-500/20 text-red-400'
                              : task.priority === 'High'
                                ? 'bg-orange-500/20 text-orange-400'
                                : task.priority === 'Medium'
                                  ? 'bg-yellow-500/20 text-yellow-400'
                                  : 'bg-green-500/20 text-green-400'
                          }`}
                        >
                          <Flag className="w-3 h-3" />
                          {task.priority}
                        </span>
                        <span className="text-xs text-gray-500">
                          {task.category}
                        </span>
                        {task.dueDate && (
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded whitespace-nowrap ${
                        task.status === 'Completed'
                          ? 'bg-green-500/20 text-green-400'
                          : task.status === 'In Progress'
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'bg-gray-700 text-gray-300'
                      }`}
                    >
                      {task.status}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : query ? (
            <div className="p-6 text-center text-gray-400">
              No tasks found for "{query}"
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500">
              Start typing to search tasks...
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
