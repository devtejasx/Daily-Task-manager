'use client'

import { FormEvent, useEffect, useState } from 'react'
import { CATEGORIES, Priority, Task, TaskInput } from '@/types/task-manager'
import { Modal } from '@/components/common/Modal'
import { Loader } from '@/components/common/Loader'

interface TaskFormModalProps {
  open: boolean
  onClose: () => void
  /** When provided the modal acts as "Edit Task", otherwise "Add Task". */
  task?: Task | null
  onSubmit: (input: TaskInput) => Promise<void>
}

const PRIORITIES: Priority[] = ['High', 'Medium', 'Low']

/** Today's date in yyyy-MM-dd for the date input default/min. */
const todayISO = () => new Date().toISOString().slice(0, 10)

const emptyForm = (): TaskInput => ({
  title: '',
  description: '',
  priority: 'Medium',
  status: 'Pending',
  dueDate: todayISO(),
  category: 'Work',
  important: false,
})

const inputClass =
  'w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3.5 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 outline-none transition focus:border-primary focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-primary/20'

const labelClass = 'mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300'

/** Shared Add/Edit task form modal with validation. */
export function TaskFormModal({ open, onClose, task, onSubmit }: TaskFormModalProps) {
  const [form, setForm] = useState<TaskInput>(emptyForm())
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  const editing = Boolean(task)

  // Re-seed the form each time the modal opens
  useEffect(() => {
    if (open) {
      setForm(
        task
          ? {
              title: task.title,
              description: task.description,
              priority: task.priority,
              status: task.status,
              dueDate: task.dueDate,
              category: task.category,
              important: task.important,
            }
          : emptyForm()
      )
      setErrors({})
    }
  }, [open, task])

  const set = <K extends keyof TaskInput>(key: K, value: TaskInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  const validate = (): boolean => {
    const next: Record<string, string> = {}
    if (!form.title.trim()) next.title = 'Title is required'
    if (!form.dueDate) next.dueDate = 'Due date is required'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    try {
      await onSubmit({ ...form, title: form.title.trim(), description: form.description.trim() })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Edit Task' : 'Add New Task'}>
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Title */}
        <div>
          <label htmlFor="task-title" className={labelClass}>
            Title <span className="text-red-500">*</span>
          </label>
          <input
            id="task-title"
            type="text"
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            placeholder="e.g. Finish project report"
            aria-invalid={Boolean(errors.title)}
            aria-describedby={errors.title ? 'task-title-error' : undefined}
            className={inputClass}
            autoFocus
          />
          {errors.title && (
            <p id="task-title-error" role="alert" className="mt-1 text-xs text-red-500">
              {errors.title}
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="task-description" className={labelClass}>
            Description
          </label>
          <textarea
            id="task-description"
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            placeholder="Add more details about this task…"
            rows={3}
            className={`${inputClass} resize-none`}
          />
        </div>

        {/* Due date + category */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="task-due" className={labelClass}>
              Due Date <span className="text-red-500">*</span>
            </label>
            <input
              id="task-due"
              type="date"
              value={form.dueDate}
              onChange={(e) => set('dueDate', e.target.value)}
              aria-invalid={Boolean(errors.dueDate)}
              className={inputClass}
            />
            {errors.dueDate && (
              <p role="alert" className="mt-1 text-xs text-red-500">
                {errors.dueDate}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="task-category" className={labelClass}>
              Category
            </label>
            <select
              id="task-category"
              value={form.category}
              onChange={(e) => set('category', e.target.value)}
              className={inputClass}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Priority segmented control */}
        <div>
          <span className={labelClass}>Priority</span>
          <div role="radiogroup" aria-label="Priority" className="grid grid-cols-3 gap-2">
            {PRIORITIES.map((p) => (
              <button
                key={p}
                type="button"
                role="radio"
                aria-checked={form.priority === p}
                onClick={() => set('priority', p)}
                className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${
                  form.priority === p
                    ? p === 'High'
                      ? 'border-red-500 bg-red-50 text-red-600 dark:bg-red-500/10'
                      : p === 'Medium'
                        ? 'border-amber-500 bg-amber-50 text-amber-600 dark:bg-amber-500/10'
                        : 'border-emerald-500 bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10'
                    : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Important toggle */}
        <label className="flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            checked={form.important}
            onChange={(e) => set('important', e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary/30"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">Mark as important</span>
        </label>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 transition hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-primary-dark active:scale-[0.98] disabled:opacity-60"
          >
            {saving && <Loader size={14} />}
            {editing ? 'Save Changes' : 'Add Task'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
