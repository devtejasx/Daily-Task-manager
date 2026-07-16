'use client'

import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Task } from '@/types/task-manager'
import { Modal } from '@/components/common/Modal'
import { Loader } from '@/components/common/Loader'

interface DeleteModalProps {
  task: Task | null
  onClose: () => void
  onConfirm: (task: Task) => Promise<void>
}

/** Confirmation dialog shown before a task is deleted. */
export function DeleteModal({ task, onClose, onConfirm }: DeleteModalProps) {
  const [deleting, setDeleting] = useState(false)

  const handleConfirm = async () => {
    if (!task) return
    setDeleting(true)
    try {
      await onConfirm(task)
      onClose()
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Modal open={Boolean(task)} onClose={onClose} title="Delete Task" size="max-w-md">
      <div className="flex items-start gap-4">
        <div className="rounded-xl bg-red-50 dark:bg-red-500/10 p-3 text-red-500">
          <AlertTriangle size={22} aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Are you sure you want to delete{' '}
            <span className="font-semibold text-gray-900 dark:text-white">
              &ldquo;{task?.title}&rdquo;
            </span>
            ?
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            This action cannot be undone.
          </p>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <button
          onClick={onClose}
          className="rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 transition hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          Cancel
        </button>
        <button
          onClick={handleConfirm}
          disabled={deleting}
          className="inline-flex items-center gap-2 rounded-xl bg-red-500 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-red-600 active:scale-[0.98] disabled:opacity-60"
        >
          {deleting && <Loader size={14} />}
          Delete
        </button>
      </div>
    </Modal>
  )
}
