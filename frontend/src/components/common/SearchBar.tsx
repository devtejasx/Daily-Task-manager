'use client'

import { Search, X } from 'lucide-react'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

/** Controlled search input with a clear button. */
export function SearchBar({
  value,
  onChange,
  placeholder = 'Search tasks…',
  className = '',
}: SearchBarProps) {
  return (
    <div className={`relative ${className}`}>
      <Search
        size={16}
        aria-hidden="true"
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
      />
      <input
        type="search"
        role="searchbox"
        aria-label="Search tasks"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 py-2.5 pl-10 pr-9 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 outline-none transition focus:border-primary focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-primary/20"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <X size={14} />
        </button>
      )}
    </div>
  )
}
