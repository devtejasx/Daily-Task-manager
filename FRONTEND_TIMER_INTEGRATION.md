# Frontend Timer Component - Integration Guide

## 📁 Files Created/Modified

### Created
1. **`frontend/src/components/Timer.tsx`** - Main timer component
2. **`frontend/src/components/index.ts`** - Component exports

### Modified
1. **`frontend/src/services/api.ts`** - Added 6 timer API methods

---

## 📋 Component Features

### Timer Component (`Timer.tsx`)

**Props:**
```typescript
interface TimerProps {
  taskId: string          // ID of the task being timed
  onStop: (minutes: number) => void  // Callback when timer stops
}
```

**Features:**
- ⏱️ Real-time display (HH:MM:SS format)
- ▶️ Play/Pause/Stop controls
- 🎯 Focus mode toggle
- 📊 Visual feedback for paused state
- 🚨 Error handling with user-friendly messages
- ⚡ Loading states for async operations
- 🎨 Gradient styling with Framer Motion animations

---

## 🚀 Usage Examples

### Basic Setup in a Task Detail Page

```tsx
import { Timer } from '@/components'
import { useState } from 'react'

export default function TaskDetail({ task }) {
  const handleTimerStop = (minutes: number) => {
    console.log(`Timer stopped. Duration: ${minutes} minutes`)
    // Update UI or refetch task
  }

  return (
    <div>
      <h1>{task.title}</h1>
      <Timer 
        taskId={task._id} 
        onStop={handleTimerStop}
      />
    </div>
  )
}
```

### In a Task Card

```tsx
import { Timer } from '@/components'
import { useState } from 'react'

export function TaskCardWithTimer({ task }) {
  const [showTimer, setShowTimer] = useState(false)

  if (showTimer) {
    return (
      <Timer 
        taskId={task._id}
        onStop={(minutes) => {
          console.log(`Task worked on for ${minutes} minutes`)
          setShowTimer(false)
        }}
      />
    )
  }

  return (
    <div className="p-4 rounded-lg border">
      <h3>{task.title}</h3>
      <button 
        onClick={() => setShowTimer(true)}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
      >
        Start Timer
      </button>
    </div>
  )
}
```

### With Dashboard Statistics

```tsx
import { Timer } from '@/components'
import { useEffect, useState } from 'react'
import { api } from '@/services/api'

export function TaskWithTimerStats({ task }) {
  const [stats, setStats] = useState(null)

  const handleTimerStop = async (minutes: number) => {
    // Refetch daily stats after timer stops
    const response = await api.getDailyTimerStats()
    setStats(response.data.data)
  }

  return (
    <div>
      <Timer taskId={task._id} onStop={handleTimerStop} />
      
      {stats && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold">Today's Stats</h3>
          <p>Total time: {stats.totalMinutesToday} minutes</p>
          <p>Sessions: {stats.sessionsCount}</p>
          <p>Focus sessions: {stats.focusSessionsCount}</p>
        </div>
      )}
    </div>
  )
}
```

### In a Modal

```tsx
import { Timer } from '@/components'
import { useState } from 'react'

export function TimerModal({ task, isOpen, onClose }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Task Timer</h2>
        <p className="text-gray-600 mb-6">{task.title}</p>
        
        <Timer
          taskId={task._id}
          onStop={(minutes) => {
            console.log(`${minutes} minutes tracked`)
            onClose()
          }}
        />
      </div>
    </div>
  )
}
```

---

## 🔧 API Integration

The Timer component uses these API methods from `@/services/api`:

```typescript
// Start a timer
await api.startTimer(taskId, focusMode)
// Returns: { success: true, data: { _id, taskId, userId, ... } }

// Stop the running timer
await api.stopTimer(sessionId)
// Returns: { success: true, data: {...}, durationMinutes: 45 }

// Pause or resume
await api.pauseTimer(sessionId, isPaused)
// Returns: { success: true, data: {...}, isPaused: true }

// Get timer history for a task
await api.getTimerHistory(taskId)
// Returns: { success: true, data: { sessions, totalMinutes, ... } }

// Get today's timer stats
await api.getDailyTimerStats()
// Returns: { success: true, data: { totalMinutesToday, sessionsCount, ... } }

// Get weekly timer stats
await api.getWeeklyTimerStats()
// Returns: { success: true, data: { byDay: [...], totalMinutesWeek, ... } }
```

---

## 📱 Responsive Design

The Timer component is fully responsive:

- **Mobile**: Full-width, touch-friendly buttons
- **Tablet**: Centered with max-width constraints
- **Desktop**: Optimal sizing with shadow effects

```tsx
// Works great on all screen sizes
<div className="max-w-2xl mx-auto">
  <Timer taskId={taskId} onStop={onStop} />
</div>
```

---

## 🎨 Styling & Customization

The component uses Tailwind CSS with:
- Gradient backgrounds (`from-blue-50 to-indigo-50`)
- Smooth transitions (`transition-colors duration-300`)
- Hover effects on buttons
- Framer Motion animations
- Shadow effects for depth

### Override colors (if needed):

Create a wrapper component:
```tsx
export function CustomTimer({ taskId, onStop }) {
  return (
    <div className="custom-timer-wrapper">
      <Timer taskId={taskId} onStop={onStop} />
    </div>
  )
}
```

Then add CSS:
```css
.custom-timer-wrapper :global(.bg-gradient-to-br) {
  /* Your custom styles */
}
```

---

## ⚙️ Component State

The Timer manages:
- `isRunning` - Whether timer is active
- `isPaused` - Whether timer is paused
- `seconds` - Elapsed seconds
- `sessionId` - Current session ID
- `focusMode` - Focus mode enabled
- `error` - Error message display
- `loading` - Loading state for buttons

---

## 🐛 Error Handling

The component gracefully handles:
- Network errors
- Authentication failures (401)
- Unauthorized access (403)
- Not found errors (404)
- Server errors (500)

Errors are displayed to users:
```tsx
{error && (
  <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-red-700">
    {error}
  </div>
)}
```

---

## 🔒 Security

- All API calls include JWT token automatically
- User isolation verified server-side
- Session ownership checked on pause/stop
- Task ownership verified before starting

---

## 📊 Integration with Other Features

### With Gamification

```tsx
const handleTimerStop = async (minutes: number) => {
  // Trigger XP calculation
  const response = await api.getDailyTimerStats()
  if (response.data.totalMinutesToday > 60) {
    // User earned badge for 1 hour of work
  }
}
```

### With Analytics

```tsx
const handleTimerStop = async (minutes: number) => {
  // Refetch productivity metrics
  const metrics = await api.getProductivityMetrics()
  updateDashboard(metrics)
}
```

### With Notifications

```tsx
const handleTimerStop = (minutes: number) => {
  // Show toast or in-app notification
  showNotification(`Great work! You spent ${minutes} minutes on this task.`)
}
```

---

## 🧪 Testing

Example test with React Testing Library:

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Timer from '@/components/Timer'
import * as api from '@/services/api'

jest.mock('@/services/api')

test('should start and stop timer', async () => {
  api.startTimer.mockResolvedValue({
    data: { success: true, data: { _id: 'session-1' } }
  })
  api.stopTimer.mockResolvedValue({
    data: { success: true, durationMinutes: 10 }
  })

  const onStop = jest.fn()
  render(<Timer taskId="task-1" onStop={onStop} />)

  // Click start
  fireEvent.click(screen.getByText('Start Timer'))
  
  await waitFor(() => {
    expect(api.startTimer).toHaveBeenCalledWith('task-1', false)
  })

  // Stop after some time
  fireEvent.click(screen.getByText('Stop'))

  await waitFor(() => {
    expect(onStop).toHaveBeenCalledWith(10)
  })
})
```

---

## 📦 Dependencies

The Timer component requires:
- `react` (18+)
- `framer-motion` (for animations)
- `lucide-react` (for icons)
- `tailwindcss` (for styling)

All already installed in your project! ✅

---

## 🚀 Performance

- Uses `useEffect` for interval cleanup
- Proper dependency arrays to prevent unnecessary re-renders
- API calls wrapped in try/catch
- Loading states prevent duplicate requests

---

## 🎓 Best Practices

1. **Always provide `taskId`** - Required for API calls
2. **Handle `onStop` callback** - Update UI after timer stops
3. **Show error messages** - Users should know if something fails
4. **Consider placement** - Timer needs focused attention
5. **Test with real data** - Use your own tasks for testing

---

## 📞 Troubleshooting

| Issue | Solution |
|-------|----------|
| Token not sent | Ensure `api.ts` is setting Authorization header |
| 401 Unauthorized | Check token is stored in localStorage |
| 403 Forbidden | Verify you own the task |
| 404 Not Found | Check taskId is valid and exists |
| Timer doesn't update | Check console for errors |
| Pause not working | Ensure sessionId was set from start response |

---

**Status: ✅ READY FOR USE**

The Timer component is production-ready and fully integrated with your existing API!
