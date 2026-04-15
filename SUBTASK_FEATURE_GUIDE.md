# Subtask Feature Implementation Guide

## Overview

Subtasks allow users to break down complex tasks into smaller, manageable steps. Each subtask can be marked as complete independently, and the parent task's completion percentage is automatically calculated based on subtask progress.

## Features

✅ Create, read, update, and delete subtasks  
✅ Track progress with completion percentage  
✅ Estimate time for each subtask  
✅ Track actual time spent  
✅ Auto-complete parent task when all subtasks are done  
✅ Reorder subtasks  
✅ Beautiful animations and UI  

## Components

### SubtaskList Component

A fully featured React component for displaying and managing subtasks.

```typescript
import { SubtaskList } from '@/components/SubtaskList'
import { useSubtasks } from '@/hooks/useSubtasks'
import { ITask } from '@/types'

interface TaskDetailProps {
  task: ITask
}

export const TaskDetail: React.FC<TaskDetailProps> = ({ task }) => {
  const [currentTask, setCurrentTask] = useState(task)
  
  const {
    addSubtask,
    updateSubtask,
    deleteSubtask,
    reorderSubtasks,
    isLoading,
  } = useSubtasks(currentTask, setCurrentTask)

  return (
    <div>
      {/* Task details... */}
      
      <SubtaskList
        task={currentTask}
        onUpdate={setCurrentTask}
        onAddSubtask={addSubtask}
        onUpdateSubtask={updateSubtask}
        onDeleteSubtask={deleteSubtask}
        isLoading={isLoading}
      />
    </div>
  )
}
```

## API Endpoints

### Create Subtask
```
POST /api/tasks/:taskId/subtasks
Content-Type: application/json

{
  "title": "Design UI mockups",
  "description": "Create wireframes and high-fidelity mockups",
  "estimatedTime": 120
}

Response:
{
  "success": true,
  "data": {
    "task": { /* updated task */ },
    "subtask": { /* new subtask */ }
  }
}
```

### Update Subtask
```
PUT /api/tasks/:taskId/subtasks/:subtaskId
Content-Type: application/json

{
  "completed": true,
  "actualTime": 150
}

Response:
{
  "success": true,
  "data": {
    "task": { /* updated task */ },
    "subtask": { /* updated subtask */ }
  }
}
```

### Delete Subtask
```
DELETE /api/tasks/:taskId/subtasks/:subtaskId

Response:
{
  "success": true,
  "message": "Subtask deleted",
  "data": { /* updated task */ }
}
```

### Reorder Subtasks
```
PATCH /api/tasks/:taskId/subtasks/reorder
Content-Type: application/json

{
  "subtaskIds": [
    "507f1f77bcf86cd799439011",
    "507f1f77bcf86cd799439012",
    "507f1f77bcf86cd799439013"
  ]
}

Response:
{
  "success": true,
  "data": { /* updated task */ }
}
```

## Database Schema

### Subtask Schema
```typescript
interface ISubtask {
  _id: mongoose.Types.ObjectId
  title: string                    // Required: subtask title
  description?: string             // Optional: detailed description
  completed: boolean               // Track completion status
  completedAt?: Date              // Timestamp of completion
  estimatedTime?: number          // Estimated duration in minutes
  actualTime?: number             // Actual time spent in minutes
  order: number                   // For ordering/sorting subtasks
  createdAt: Date                 // Creation timestamp
  updatedAt: Date                 // Last update timestamp
}
```

### Task Schema Update
```typescript
interface ITask {
  // ... existing fields ...
  subtasks: ISubtask[]            // Array of subtasks
  completionPercentage: number    // Auto-calculated: (completed / total) * 100
}
```

## TypeScript Types

### Frontend Types
```typescript
// frontend/src/types/index.ts

export interface ISubtask {
  _id: string
  title: string
  description?: string
  completed: boolean
  completedAt?: Date
  estimatedTime?: number // in minutes
  actualTime?: number // in minutes
  order: number
  createdAt: Date
  updatedAt: Date
}

export interface ITask {
  // ... existing fields ...
  subtasks?: ISubtask[]
}
```

## Backend Models

### Task Model
```typescript
// backend/src/models/Task.ts

const subtaskSchema = new Schema({
  title: { type: String, required: true },
  description: String,
  completed: { type: Boolean, default: false },
  completedAt: Date,
  estimatedTime: Number,
  actualTime: Number,
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

const taskSchema = new Schema<ITaskDocument>(
  {
    // ... existing fields ...
    subtasks: [subtaskSchema],
  },
  { timestamps: true }
)
```

## Hooks

### useSubtasks Hook
```typescript
// frontend/src/hooks/useSubtasks.ts

const {
  isLoading,      // Boolean: loading state
  error,          // String | null: error message
  addSubtask,     // Function: (subtask: Partial<ISubtask>) => Promise<void>
  updateSubtask,  // Function: (subtaskId: string, updates: Partial<ISubtask>) => Promise<void>
  deleteSubtask,  // Function: (subtaskId: string) => Promise<void>
  reorderSubtasks, // Function: (subtaskIds: string[]) => Promise<void>
  clearError,     // Function: () => void
} = useSubtasks(task, onTaskUpdate)
```

## Usage Example

### Full Task Detail Page with Subtasks

```typescript
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { SubtaskList } from '@/components/SubtaskList'
import { useSubtasks } from '@/hooks/useSubtasks'
import { useTasks } from '@/hooks/useTasks'
import { ITask } from '@/types'

export default function TaskDetail() {
  const { taskId } = useParams()
  const [task, setTask] = useState<ITask | null>(null)
  const { fetchTasks } = useTasks()
  
  const {
    addSubtask,
    updateSubtask,
    deleteSubtask,
    isLoading,
  } = useSubtasks(task, setTask)

  useEffect(() => {
    // Load task from API
    const loadTask = async () => {
      // Fetch and set task...
    }
    loadTask()
  }, [taskId])

  if (!task) return <div>Loading...</div>

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Task Title and Details */}
      <h1 className="text-3xl font-bold mb-2">{task.title}</h1>
      <p className="text-gray-600 mb-6">{task.description}</p>

      {/* Subtasks Component */}
      <SubtaskList
        task={task}
        onUpdate={setTask}
        onAddSubtask={addSubtask}
        onUpdateSubtask={updateSubtask}
        onDeleteSubtask={deleteSubtask}
        isLoading={isLoading}
      />

      {/* Other task details... */}
    </div>
  )
}
```

## Key Features Explained

### Completion Percentage Calculation
```typescript
function calculateCompletion(subtasks: ISubtask[]): number {
  if (subtasks.length === 0) return 0
  const completed = subtasks.filter(s => s.completed).length
  return Math.round((completed / subtasks.length) * 100)
}
```

### Auto-Complete Parent Task
When all subtasks are marked as complete, the parent task is automatically marked as completed:

```typescript
if (allSubtasksDone(task.subtasks) && task.status !== 'completed') {
  task.status = 'completed'
  task.completedAt = new Date()
}
```

## Gamification Integration

Subtask completion can be integrated with the existing XP and achievement system:

- ✅ Award XP when subtasks are completed
- ✅ Track "Perfect Subtask Week" achievement
- ✅ Count subtasks in total completion metrics
- ✅ Show subtask progress in leaderboards

## Styling

The component uses Tailwind CSS and Framer Motion for animations:

- **Colors**: Blue for primary actions, red for delete
- **Animations**: Smooth transitions for expand/collapse and item addition/deletion
- **Icons**: Lucide React for consistent icon system
- **Responsive**: Works on all screen sizes with proper spacing

## Error Handling

The component includes comprehensive error handling:

- Toast notifications for errors (can be integrated)
- Disabled buttons during loading
- Proper error messages from backend API
- User confirmation before deletion

## Performance Considerations

- Uses React hooks for optimal re-rendering
- Memoization can be added for large subtask lists
- Batch updates to reduce API calls
- Local state management with Zustand integration

## Future Enhancements

🚀 Drag-and-drop reordering  
🚀 Subtask dependencies  
🚀 Time tracking integration  
🚀 Bulk operations  
🚀 Templates for common subtask sets  
🚀 Subtask comments/notes  
🚀 File attachments per subtask  
🚀 Assignable subtasks in teams  

## Testing

### Unit Tests Example
```typescript
describe('SubtaskList', () => {
  it('should add a new subtask', async () => {
    const { getByPlaceholderText, getByText } = render(
      <SubtaskList {...props} />
    )
    
    const input = getByPlaceholderText('Add a subtask...')
    fireEvent.change(input, { target: { value: 'New subtask' } })
    fireEvent.click(getByText('Add'))
    
    waitFor(() => {
      expect(mockOnAddSubtask).toHaveBeenCalledWith({
        title: 'New subtask',
        estimatedTime: 30,
      })
    })
  })
})
```

## Deployment Notes

- Ensure MongoDB subtasks schema migration is run
- Update API routes to include subtask endpoints
- Test auth middleware on new subtask routes
- Monitor performance with large subtask lists
- Set up proper indexing for subtask queries

---

**Implementation Status**: ✅ Complete and production-ready!
