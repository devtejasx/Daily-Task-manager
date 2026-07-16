import {
  addDoc,
  collection,
  deleteDoc,
  deleteField,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import { Task, TaskInput } from '@/types/task-manager'

/**
 * Task data service backed by Firebase Firestore.
 *
 * Collection: "tasks" — one document per task, shaped exactly like the
 * `Task` type (plain serializable values) plus a `userId` field so each
 * user only ever sees their own tasks.
 *
 * Sorting/filtering is done client-side (see TaskList), so the only query
 * here is a simple equality filter — no composite indexes required.
 */

const tasksCollection = collection(db, 'tasks')

/** Current user's uid; all reads/writes are scoped to it. */
function requireUid(): string {
  const user = auth.currentUser
  if (!user) throw new Error('You must be signed in')
  return user.uid
}

export async function getTasks(): Promise<Task[]> {
  const snapshot = await getDocs(query(tasksCollection, where('userId', '==', requireUid())))
  return snapshot.docs.map((d) => ({ ...(d.data() as Omit<Task, 'id'>), id: d.id }))
}

export async function addTask(input: TaskInput): Promise<Task> {
  const data = {
    ...input,
    userId: requireUid(),
    createdAt: new Date().toISOString(),
  }
  const ref = await addDoc(tasksCollection, data)
  return { ...data, id: ref.id }
}

export async function updateTask(id: string, patch: Partial<Task>): Promise<void> {
  // Firestore rejects `undefined` values — translate them to field deletes
  const { id: _ignored, ...rest } = patch
  const data = Object.fromEntries(
    Object.entries(rest).map(([key, value]) => [key, value === undefined ? deleteField() : value])
  )
  await updateDoc(doc(db, 'tasks', id), data)
}

export async function deleteTask(id: string): Promise<void> {
  await deleteDoc(doc(db, 'tasks', id))
}
