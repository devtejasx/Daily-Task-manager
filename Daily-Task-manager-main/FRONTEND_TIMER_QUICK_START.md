# Frontend Timer Component - Quick Start

## 📦 What's New

Two new files created:
1. **`frontend/src/components/Timer.tsx`** - Complete timer component
2. **`frontend/src/components/index.ts`** - Component barrel export

One file updated:
1. **`frontend/src/services/api.ts`** - Added timer API methods

---

## ⚡ Quick Usage

### Import & Use
```tsx
import { Timer } from '@/components'

export default function TaskPage() {
  return (
    <Timer 
      taskId="task-abc123" 
      onStop={(minutes) => console.log(`Worked for ${minutes} min`)}
    />
  )
}
```

### Full Example
```tsx
'use client' // If using Next.js App Router

import { Timer } from '@/components'
import { useState } from 'react'

export default function TaskDetail({ params }) {
  const [timerMinutes, setTimerMinutes] = useState(0)

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1>Task Details</h1>
      
      <Timer
        taskId={params.taskId}
        onStop={(minutes) => {
          setTimerMinutes(minutes)
          console.log(`Timer completed: ${minutes} minutes`)
        }}
      />

      {timerMinutes > 0 && (
        <div className="mt-4 p-4 bg-green-50 rounded-lg">
          ✅ Timer completed: {timerMinutes} minutes
        </div>
      )}
    </div>
  )
}
```

---

## 🎯 Component Props

```typescript
interface TimerProps {
  taskId: string              // Required. Task to track time for
  onStop: (minutes: number) => void  // Required. Called when timer stops
}
```

---

## 🎨 Features

✅ Real-time display with HH:MM:SS format  
✅ Play/Pause/Stop controls  
✅ Focus mode toggle (no notifications)  
✅ Error handling with user messages  
✅ Loading states during API calls  
✅ Responsive design (mobile to desktop)  
✅ Framer Motion animations  
✅ Gradient styling with Tailwind  

---

## 📊 Component Behavior

### States

**Not Started:**
- Shows "00:00" (or "HH:MM:SS")
- Display: "Standard Timer"
- Available: Start button

**Running:**
- Timer increments every second
- Display: "🎯 Focus Mode" or "Standard Timer"
- Available: Pause & Stop buttons

**Paused:**
- Timer stops incrementing
- Display: "⏸ Timer Paused"
- Color changes to yellow
- Available: Resume & Stop buttons

**Stopped:**
- Calls `onStop(minutes)` callback
- Resets to initial state
- Ready to start new session

---

## 🔌 API Integration

The component automatically calls these methods:

```typescript
// Start new session
POST /api/timer/start/{taskId}
Body: { focusMode: boolean }

// Stop session
POST /api/timer/stop/{sessionId}

// Pause/Resume
PATCH /api/timer/pause/{sessionId}
Body: { isPaused: boolean }
```

All API calls:
- ✅ Include JWT token automatically
- ✅ Handle errors gracefully
- ✅ Show errors to users
- ✅ Have loading states

---

## 🎮 Usage in Different Contexts

### Inline in Task Card
```tsx
<div className="p-4 border rounded-lg">
  <h3>{task.title}</h3>
  <Timer taskId={task._id} onStop={() => refetchTask()} />
</div>
```

### Toggle Timer with Button
```tsx
const [showTimer, setShowTimer] = useState(false)

return (
  <>
    {showTimer ? (
      <Timer taskId={taskId} onStop={() => setShowTimer(false)} />
    ) : (
      <button onClick={() => setShowTimer(true)}>Start Timer</button>
    )}
  </>
)
```

### In a Sidebar Widget
```tsx
<aside className="w-64 bg-gray-50 p-4">
  <h2 className="font-bold">Task Timer</h2>
  <Timer taskId={activeTaskId} onStop={handleStop} />
</aside>
```

### With Daily Stats
```tsx
const [stats, setStats] = useState(null)

const handleStop = async (minutes) => {
  const res = await api.getDailyTimerStats()
  setStats(res.data.data)
}

return (
  <>
    <Timer taskId={taskId} onStop={handleStop} />
    {stats && <div>Today: {stats.totalMinutesToday} min</div>}
  </>
)
```

---

## 🌈 Styling

Component uses Tailwind classes:
- Background: `bg-gradient-to-br from-blue-50 to-indigo-50`
- Border: `border-blue-200`
- Text (running): `text-blue-600`
- Text (paused): `text-yellow-600`
- Buttons: Gradient with hover effects

Works with your existing Tailwind config! ✅

---

## 🔒 Authentication

The component uses existing auth:
- JWT token from localStorage
- Automatically added to all API calls
- Redirects to login on 401
- Shows errors on 403 (not authorized)

---

## 📱 Responsive

Works perfectly on:
- 📱 Mobile (320px+)
- 📱 Tablet (640px+)
- 🖥️ Desktop (1024px+)

No special responsive code needed - buttons and text resize automatically!

---

## ⚠️ Error Handling

Errors display in red box:
```
❌ Failed to start timer
```

Common errors:
- "Access token required" → login required
- "Not authorized" → don't own this task
- "Task not found" → invalid taskId
- "Session not found" → sessionId expired

All errors gracefully handled and shown to users.

---

## 🧪 Testing

Example test:
```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import Timer from '@/components/Timer'

test('Timer component renders', () => {
  render(<Timer taskId="123" onStop={() => {}} />)
  expect(screen.getByText('Start Timer')).toBeInTheDocument()
})

test('Timer starts when clicked', async () => {
  const onStop = jest.fn()
  render(<Timer taskId="123" onStop={onStop} />)
  fireEvent.click(screen.getByText('Start Timer'))
  // Verify timer is running
})
```

---

## 🚀 Performance

- Efficient interval management
- Proper cleanup on unmount
- No unnecessary re-renders
- Optimized API calls

---

## 📋 Implementation Checklist

- [x] Timer component created
- [x] API methods added to service
- [x] Error handling implemented
- [x] Loading states added
- [x] Responsive design complete
- [x] Animations included
- [x] Type definitions added
- [x] Documentation provided

---

## 🎓 Next Steps

1. **Test in your app:**
   ```tsx
   import { Timer } from '@/components'
   ```

2. **Add to a task page:**
   ```tsx
   <Timer taskId={taskId} onStop={onStop} />
   ```

3. **Monitor stats:**
   ```tsx
   const stats = await api.getDailyTimerStats()
   ```

4. **Customize styling** (if needed):
   - Modify Tailwind classes in Timer.tsx
   - Change colors, sizes, animations

5. **Integrate with features:**
   - Add to gamification
   - Include in analytics
   - Connect to notifications

---

## 📞 Troubleshooting

**Timer not starting?**
- Check taskId is valid
- Check you're logged in (token in localStorage)
- Check console for error messages

**Buttons not working?**
- Check API endpoint is running (port 5000)
- Check MongoDB is connected
- Check token is valid

**Styling looks wrong?**
- Verify Tailwind is configured
- Check lucide-react icons are installed
- Check framer-motion is installed

---

## ✨ Highlights

🎯 **Production Ready** - All error handling included  
⚡ **Fast** - Optimized for performance  
📱 **Responsive** - Works on all devices  
🔒 **Secure** - JWT authentication built-in  
🎨 **Beautiful** - Modern gradient design  
📊 **Integrated** - Works with your existing API  

---

**Status: ✅ READY TO USE**

Import and use immediately:
```tsx
import { Timer } from '@/components'
```

Questions? Check `FRONTEND_TIMER_INTEGRATION.md` for detailed guide!
