'use client'

import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Plus } from 'lucide-react'
import { PRIORITY_ORDER, SortOption, Task, TaskFilter, TaskInput } from '@/types/task-manager'
import { useTaskStore } from '@/store/taskStore'
import { SearchBar } from '@/components/common/SearchBar'
import { SkeletonGrid } from '@/components/common/SkeletonCard'
import { EmptyState } from '@/components/common/EmptyState'
import { Pagination } from '@/components/common/Pagination'
import { TaskCard } from './TaskCard'
import { FilterDropdown, SortDropdown } from './Dropdowns'
import { TaskFormModal } from './TaskFormModal'
import { DeleteModal } from './DeleteModal'

const PAGE_SIZE = 6

interface TaskListProps {
  /** Locks the list to one filter (used by Completed/Pending/Important pages). */
  fixedFilter?: TaskFilter
  /** Hide the search/filter/sort toolbar (used on the dashboard). */
  compact?: boolean
  /** Cap the number of tasks shown (dashboard preview). */
  limit?: number
  /** Pre-fill the search box (e.g. from the navbar's ?q= param). */
  initialSearch?: string
}

function applyFilter(tasks: Task[], filter: TaskFilter): Task[] {
  switch (filter) {
    case 'completed':
      return tasks.filter((t) => t.status === 'Completed')
    case 'pending':
      return tasks.filter((t) => t.status === 'Pending')
    case 'high':
      return tasks.filter((t) => t.priority === 'High')
    case 'important':
      return tasks.filter((t) => t.important)
    default:
      return tasks
  }
}

function applySort(tasks: Task[], sort: SortOption): Task[] {
  const sorted = [...tasks]
  switch (sort) {
    case 'dueDate':
      return sorted.sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    case 'priority':
      return sorted.sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority])
    case 'newest':
      return sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    case 'oldest':
      return sorted.sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  }
}

/**
 * Task list with search, filter, sort, pagination, and the add/edit/delete
 * modals. All data flows through useTaskStore -> taskService.
 */
export function TaskList({ fixedFilter, compact = false, limit, initialSearch = '' }: TaskListProps) {
  const { tasks, loading, loaded, fetchTasks, addTask, updateTask, deleteTask, toggleComplete } =
    useTaskStore()

  const [search, setSearch] = useState(initialSearch)

  // Keep in sync when the navbar pushes a new ?q= value
  useEffect(() => {
    setSearch(initialSearch)
  }, [initialSearch])
  const [filter, setFilter] = useState<TaskFilter>('all')
  const [sort, setSort] = useState<SortOption>('dueDate')
  const [page, setPage] = useState(1)

  const [addOpen, setAddOpen] = useState(false)
  const [editTask, setEditTask] = useState<Task | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null)

  useEffect(() => {
    if (!loaded) fetchTasks()
  }, [loaded, fetchTasks])

  // Reset to page 1 whenever the visible set changes
  useEffect(() => {
    setPage(1)
  }, [search, filter, sort])

  const visible = useMemo(() => {
    let result = applyFilter(tasks, fixedFilter ?? filter)
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q)
      )
    }
    result = applySort(result, sort)
    return limit ? result.slice(0, limit) : result
  }, [tasks, search, filter, fixedFilter, sort, limit])

  const totalPages = limit ? 1 : Math.ceil(visible.length / PAGE_SIZE)
  const pageTasks = limit ? visible : visible.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handleToggleImportant = (task: Task) =>
    updateTask(task.id, { important: !task.important })

  return (
    <div>
      {/* Toolbar */}
      {!compact && (
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchBar value={search} onChange={setSearch} className="flex-1" />
          <div className="flex items-center gap-2">
            {!fixedFilter && <FilterDropdown value={filter} onChange={setFilter} />}
            <SortDropdown value={sort} onChange={setSort} />
            <button
              onClick={() => setAddOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-primary-dark hover:shadow active:scale-[0.98]"
            >
              <Plus size={16} aria-hidden="true" />
              <span className="hidden sm:inline">Add Task</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </div>
      )}

      {/* List */}
      {loading && !loaded ? (
        <SkeletonGrid count={6} />
      ) : pageTasks.length === 0 ? (
        <EmptyState
          action={
            !compact ? (
              <button
                onClick={() => setAddOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-primary-dark"
              >
                <Plus size={16} /> Add your first task
              </button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence initial={false}>
            {pageTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={setEditTask}
                onDelete={setDeleteTarget}
                onToggleComplete={toggleComplete}
                onToggleImportant={handleToggleImportant}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      {/* Modals */}
      <TaskFormModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSubmit={(input: TaskInput) => addTask(input)}
      />
      <TaskFormModal
        open={Boolean(editTask)}
        task={editTask}
        onClose={() => setEditTask(null)}
        onSubmit={(input: TaskInput) => updateTask(editTask!.id, input)}
      />
      <DeleteModal
        task={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={(task) => deleteTask(task.id)}
      />
    </div>
  )
}
