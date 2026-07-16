'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

/** Numbered pagination with previous/next controls. Hidden when only one page. */
export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  return (
    <nav aria-label="Task list pagination" className="mt-6 flex items-center justify-center gap-1.5">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        aria-label="Previous page"
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 transition hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <ChevronLeft size={16} />
      </button>

      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          aria-label={`Page ${p}`}
          aria-current={p === page ? 'page' : undefined}
          className={`h-9 w-9 rounded-lg text-sm font-medium transition ${
            p === page
              ? 'bg-primary text-white shadow-sm'
              : 'border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
          }`}
        >
          {p}
        </button>
      ))}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        aria-label="Next page"
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 transition hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <ChevronRight size={16} />
      </button>
    </nav>
  )
}
