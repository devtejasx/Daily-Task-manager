'use client'

import { useEffect, useRef, useState, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUpDown, Check, ChevronDown, ListFilter } from 'lucide-react'
import { SortOption, TaskFilter } from '@/types/task-manager'

/* ------------------------------------------------------------------ */
/* Generic dropdown shell (click-outside close, keyboard accessible)   */
/* ------------------------------------------------------------------ */

interface DropdownProps<T extends string> {
  label: string
  icon: ReactNode
  value: T
  options: { value: T; label: string }[]
  onChange: (value: T) => void
}

function Dropdown<T extends string>({ label, icon, value, options, onChange }: DropdownProps<T>) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const current = options.find((o) => o.value === value)

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
        className="inline-flex items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3.5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm transition hover:bg-gray-50 dark:hover:bg-gray-800"
      >
        <span className="text-gray-400">{icon}</span>
        <span className="hidden sm:inline">{current?.label ?? label}</span>
        <ChevronDown size={14} className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            aria-label={label}
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 z-30 mt-2 w-44 overflow-hidden rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 py-1.5 shadow-lg"
          >
            {options.map((option) => (
              <li key={option.value}>
                <button
                  role="option"
                  aria-selected={option.value === value}
                  onClick={() => {
                    onChange(option.value)
                    setOpen(false)
                  }}
                  className={`flex w-full items-center justify-between px-3.5 py-2 text-left text-sm transition hover:bg-gray-50 dark:hover:bg-gray-800 ${
                    option.value === value
                      ? 'font-medium text-primary'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {option.label}
                  {option.value === value && <Check size={14} />}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Filter dropdown                                                     */
/* ------------------------------------------------------------------ */

const FILTER_OPTIONS: { value: TaskFilter; label: string }[] = [
  { value: 'all', label: 'All Tasks' },
  { value: 'completed', label: 'Completed' },
  { value: 'pending', label: 'Pending' },
  { value: 'high', label: 'High Priority' },
]

export function FilterDropdown({
  value,
  onChange,
}: {
  value: TaskFilter
  onChange: (value: TaskFilter) => void
}) {
  return (
    <Dropdown
      label="Filter tasks"
      icon={<ListFilter size={15} />}
      value={value}
      options={FILTER_OPTIONS}
      onChange={onChange}
    />
  )
}

/* ------------------------------------------------------------------ */
/* Sort dropdown                                                       */
/* ------------------------------------------------------------------ */

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'dueDate', label: 'Due Date' },
  { value: 'priority', label: 'Priority' },
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
]

export function SortDropdown({
  value,
  onChange,
}: {
  value: SortOption
  onChange: (value: SortOption) => void
}) {
  return (
    <Dropdown
      label="Sort tasks"
      icon={<ArrowUpDown size={15} />}
      value={value}
      options={SORT_OPTIONS}
      onChange={onChange}
    />
  )
}
