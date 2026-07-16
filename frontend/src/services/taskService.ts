import { Task, TaskInput } from '@/types/task-manager'
import { mockTasks } from '@/data/mockTasks'

/**
 * Task data service — the single place the UI talks to for task data.
 *
 * Currently backed by localStorage (seeded with mock data) with a small
 * artificial delay so loading states are visible.
 *
 * FIREBASE INTEGRATION: to switch to Firestore, replace the bodies of these
 * functions with Firestore calls (collection "tasks") and keep the same
 * signatures — nothing in the UI layer needs to change:
 *
 *   getTasks()        -> getDocs(collection(db, 'tasks'))
 *   addTask(input)    -> addDoc(collection(db, 'tasks'), {...})
 *   updateTask(id, p) -> updateDoc(doc(db, 'tasks', id), p)
 *   deleteTask(id)    -> deleteDoc(doc(db, 'tasks', id))
 */

const STORAGE_KEY = 'taskmaster.tasks'
const LATENCY_MS = 400 // simulated network latency for realistic loading UX

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

function readStore(): Task[] {
  if (typeof window === 'undefined') return mockTasks
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as Task[]
  } catch {
    // corrupt storage — fall through to seed
  }
  writeStore(mockTasks)
  return mockTasks
}

function writeStore(tasks: Task[]) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
}

export async function getTasks(): Promise<Task[]> {
  await delay(LATENCY_MS)
  return readStore()
}

export async function addTask(input: TaskInput): Promise<Task> {
  await delay(LATENCY_MS)
  const task: Task = {
    ...input,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  }
  writeStore([task, ...readStore()])
  return task
}

export async function updateTask(id: string, patch: Partial<Task>): Promise<Task> {
  await delay(LATENCY_MS)
  const tasks = readStore()
  const index = tasks.findIndex((t) => t.id === id)
  if (index === -1) throw new Error(`Task ${id} not found`)
  const updated = { ...tasks[index], ...patch, id }
  tasks[index] = updated
  writeStore(tasks)
  return updated
}

export async function deleteTask(id: string): Promise<void> {
  await delay(LATENCY_MS)
  writeStore(readStore().filter((t) => t.id !== id))
}

/** Toggle between Pending and Completed, stamping/clearing completedAt. */
export async function toggleComplete(task: Task): Promise<Task> {
  const completing = task.status !== 'Completed'
  return updateTask(task.id, {
    status: completing ? 'Completed' : 'Pending',
    completedAt: completing ? new Date().toISOString() : undefined,
  })
}
