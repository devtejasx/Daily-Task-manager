'use client'

import { ReactNode, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  /** Max width utility class, defaults to max-w-lg */
  size?: string
}

/**
 * Base modal: backdrop blur, spring entrance, Escape-to-close,
 * body scroll lock, and ARIA dialog semantics.
 */
export function Modal({ open, onClose, title, children, size = 'max-w-lg' }: ModalProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm"
            aria-hidden="true"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: 'spring', duration: 0.35, bounce: 0.2 }}
            className={`relative w-full ${size} rounded-2xl bg-white dark:bg-gray-900 shadow-2xl border border-gray-100 dark:border-gray-800 max-h-[90vh] overflow-y-auto`}
          >
            <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
              <button
                onClick={onClose}
                aria-label="Close dialog"
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 dark:hover:text-gray-300 transition"
              >
                <X size={18} />
              </button>
            </div>
            <div className="px-6 py-5">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
