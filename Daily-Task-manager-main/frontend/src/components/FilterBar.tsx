'use client'

import React, { useState } from 'react'
import { Search, Sliders, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface FilterBarProps {
  onSearch: (query: string) => void
  onFilterChange: (filters: TaskFilters) => void
  onReset: () => void
}

export interface TaskFilters {
  priority?: string
  category?: string
  status?: string
  dueDateRange?: 'today' | 'week' | 'month' | 'overdue'
}

export const FilterBar: React.FC<FilterBarProps> = ({
  onSearch,
  onFilterChange,
  onReset,
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  const [filters, setFilters] = useState<TaskFilters>({})

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    onSearch(value)
  }

  const handleFilterChange = (key: keyof TaskFilters, value: string) => {
    const newFilters = {
      ...filters,
      [key]: value === 'all' ? undefined : value,
    }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleReset = () => {
    setSearchQuery('')
    setFilters({})
    setIsExpanded(false)
    onReset()
  }

  const hasActiveFilters =
    Object.values(filters).some((v) => v !== undefined) || searchQuery

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none transition"
        />
      </div>

      {/* Filter Toggle */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition ${
          hasActiveFilters
            ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
            : 'bg-gray-800 border-gray-700 hover:border-gray-600'
        }`}
      >
        <SliderslideUpIcon className="w-4 h-4" />
        Filters
        {hasActiveFilters && (
          <span className="ml-2 px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full">
            {Object.values(filters).filter((v) => v !== undefined).length}
          </span>
        )}
      </button>

      {/* Expanded Filters */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3 p-4 bg-gray-800/50 border border-gray-700/50 rounded-lg"
          >
            {/* Priority Filter */}
            <div>
              <label className="text-sm font-medium text-gray-300 block mb-2">
                Priority
              </label>
              <select
                value={filters.priority || 'all'}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:border-blue-500 focus:outline-none transition"
              >
                <option value="all">All Priorities</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="text-sm font-medium text-gray-300 block mb-2">
                Category
              </label>
              <select
                value={filters.category || 'all'}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:border-blue-500 focus:outline-none transition"
              >
                <option value="all">All Categories</option>
                <option value="Work">Work</option>
                <option value="Personal">Personal</option>
                <option value="Health">Health</option>
                <option value="Education">Education</option>
                <option value="Shopping">Shopping</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="text-sm font-medium text-gray-300 block mb-2">
                Status
              </label>
              <select
                value={filters.status || 'all'}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:border-blue-500 focus:outline-none transition"
              >
                <option value="all">All Status</option>
                <option value="Not Started">Not Started</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            {/* Due Date Range Filter */}
            <div>
              <label className="text-sm font-medium text-gray-300 block mb-2">
                Due Date
              </label>
              <select
                value={filters.dueDateRange || 'all'}
                onChange={(e) =>
                  handleFilterChange(
                    'dueDateRange',
                    e.target.value as any
                  )
                }
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:border-blue-500 focus:outline-none transition"
              >
                <option value="all">Any Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>

            {/* Action Buttons */}
            {hasActiveFilters && (
              <button
                onClick={handleReset}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg hover:bg-red-500/30 transition"
              >
                <X className="w-4 h-4" />
                Clear Filters
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function SliderslideUpIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="4" x2="20" y1="21" y2="21"></line>
      <line x1="7" x2="17" y1="16" y2="16"></line>
      <line x1="10" x2="14" y1="11" y2="11"></line>
    </svg>
  )
}
