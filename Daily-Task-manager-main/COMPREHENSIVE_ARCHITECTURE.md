# TaskMaster - Complete System Architecture & Implementation Guide

## Executive Overview

TaskMaster is a **full-stack task management application** with advanced features like subtasks, time tracking, AI coaching, and smart scheduling. This document details the complete architecture, design decisions, and implementation specifics.

**Tech Stack:**
- **Frontend:** Next.js 14, React 18, TypeScript, Tailwind CSS, Framer Motion
- **Backend:** Node.js, Express.js, TypeScript, MongoDB, Redis, Socket.io
- **Deployment:** Vercel (frontend), Railway/Heroku (backend), MongoDB Atlas, Redis Cloud

---

## Part 1: System Architecture

### 1.1 High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Next.js Frontend (React 18 + TypeScript)           │   │
│  │  ├─ Pages: Dashboard, Tasks, Analytics, Settings   │   │
│  │  ├─ Components: TaskCard, Timer, AICoach, etc.     │   │
│  │  └─ Hooks: useTask, useTimer, useGamification      │   │
│  └─────────────────────────────────────────────────────┘   │
│           ↓              ↓              ↓                   │
│    HTTP (REST)    WebSocket (Real-time)  Files            │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                    API GATEWAY                              │
│  ├─ CORS Configuration                                     │
│  ├─ Request Validation                                    │
│  └─ Error Handling Middleware                             │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                    SERVER LAYER                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Express.js Application (TypeScript)                  │  │
│  │                                                      │  │
│  │ Routes:                                             │  │
│  │  • /api/tasks           (CRUD operations)           │  │
│  │  • /api/subtasks        (Hierarchical tasks)        │  │
│  │  • /api/timer           (Time tracking)             │  │
│  │  • /api/scheduler       (Smart scheduling)          │  │
│  │  • /api/ai-coach        (AI insights)              │  │
│  │  • /api/gamification    (XP & achievements)         │  │
│  │  • /api/analytics       (User statistics)           │  │
│  │  • /api/auth            (Authentication)            │  │
│  │  • /api/teams           (Collaboration)             │  │
│  └──────────────────────────────────────────────────────┘  │
│           ↓                              ↓                  │
│    ┌────────────────────┐         ┌────────────────────┐   │
│    │   Service Layer    │         │  Middleware Layer  │   │
│    │                    │         │                    │   │
│    │ • TaskService      │         │ • authenticate     │   │
│    │ • TimerService     │         │ • validate         │   │
│    │ • AICoachService   │         │ • authorize        │   │
│    │ • SchedulerService │         │ • rateLimiters     │   │
│    │ • GamificationSvc  │         │ • errorHandler     │   │
│    └────────────────────┘         └────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│              CACHING & REAL-TIME LAYER                      │
│  ┌─────────────────────┐      ┌──────────────────────┐    │
│  │   Redis Cache       │      │  Socket.io Server    │    │
│  │                     │      │                      │    │
│  │ • Session store     │      │ • Real-time updates  │    │
│  │ • User cache        │      │ • Notifications      │    │
│  │ • Task rankings     │      │ • Collaboration      │    │
│  │ • Analytics cache   │      │ • Live team updates  │    │
│  └─────────────────────┘      └──────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│              DATA PERSISTENCE LAYER                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │         MongoDB Atlas (Cloud Database)              │   │
│  │                                                     │   │
│  │ Collections:                                       │   │
│  │  • users          (authentication, profiles)       │   │
│  │  • tasks          (with embedded subtasks)         │   │
│  │  • timersessions  (time tracking data)             │   │
│  │  • achievements   (gamification badges)            │   │
│  │  • activities     (audit logs)                     │   │
│  │  • teams          (collaboration groups)           │   │
│  │  • notifications  (user alerts)                    │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Data Flow

#### Task Creation Flow
```
User Input → Frontend Form → Validation → POST /api/tasks
  ↓
Backend Route Handler
  ↓
AuthMiddleware (verify JWT)
  ↓
TaskService.createTask()
  ↓
MongoDB save Task document
  ↓
Redis cache update
  ↓
WebSocket broadcast to team
  ↓
Response to Frontend
  ↓
Update UI with new task
```

#### Timer Session Flow
```
User clicks "Start Timer" → POST /api/timer/start/{taskId}
  ↓
Create TimerSession document
  ↓
Update Task status to "in-progress"
  ↓
Store in Redis for real-time tracking
  ↓
WebSocket emit to frontend (timer ticking)
  ↓
User clicks "Stop" → POST /api/timer/stop/{sessionId}
  ↓
Calculate duration (exclude pause time)
  ↓
Update Task.timeSpent
  ↓
Store final TimerSession
  ↓
Calculate XP and update gamification
```

### 1.3 Database Schema

#### Task Collection
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  userId: ObjectId (ref: User),
  
  // Status & Priority
  status: "pending" | "in-progress" | "completed" | "paused",
  priority: "Low" | "Medium" | "High" | "Critical",
  difficulty: "Easy" | "Medium" | "Hard",
  
  // Dates
  dueDate: Date,
  dueTime: String,
  startDate: Date,
  createdAt: Date,
  completedAt: Date,
  
  // Subtasks (Embedded Array)
  subtasks: [
    {
      _id: ObjectId,
      title: String,
      description: String,
      completed: Boolean,
      completedAt: Date,
      estimatedTime: Number (minutes),
      actualTime: Number (minutes),
      order: Number
    }
  ],
  
  // Time Tracking
  estimatedDuration: Number (minutes),
  timeSpent: Number (seconds),
  
  // Gamification
  xpReward: Number,
  completionPercentage: Number (0-100),
  
  // Metadata
  category: String,
  tags: [String],
  attachments: [],
  notes: String,
  
  // Recurrence
  isRecurring: Boolean,
  recurrencePattern: Object,
  
  // Collaboration
  sharedWith: [ObjectId],
  assignedTo: ObjectId,
  
  // Timestamps
  createdAt: Date (default: now),
  updatedAt: Date
}
```

#### TimerSession Collection
```javascript
{
  _id: ObjectId,
  taskId: ObjectId (ref: Task),
  userId: ObjectId (ref: User),
  
  startedAt: Date,
  endedAt: Date,
  duration: Number (seconds),
  
  isPaused: Boolean,
  pausedAt: Date,
  totalPausedTime: Number (seconds),
  
  sessionType: "work" | "break",
  focusMode: Boolean,
  
  createdAt: Date,
  updatedAt: Date
}
```

#### User Collection
```javascript
{
  _id: ObjectId,
  email: String (unique),
  name: String,
  password: String (hashed with bcrypt),
  
  // Gamification
  gamification: {
    level: Number,
    totalXP: Number,
    streak: Number,
    maxStreak: Number,
    lastTaskCompletedDate: Date,
    achievements: [ObjectId] (ref: Achievement)
  },
  
  // Preferences
  preferences: {
    theme: "light" | "dark",
    notifications: Boolean,
    emailNotifications: Boolean,
    skipWeekends: Boolean,
    peakHours: [Number],
    pomodoroSettings: {
      workDuration: 25,
      breakDuration: 5,
      sessionsUntilLongBreak: 4
    }
  },
  
  // Profile
  avatar: String (URL),
  bio: String,
  
  // Social
  teamIds: [ObjectId] (ref: Team),
  friends: [ObjectId] (ref: User),
  
  createdAt: Date,
  updatedAt: Date
}
```

---

## Part 2: Feature Architecture

### 2.1 Subtask System

**Purpose:** Break down complex tasks into manageable subtasks with progress tracking.

**Key Components:**
- Embedded MongoDB array within Task document
- Progress bar calculated from completion percentage
- Automatic parent task completion when all subtasks done

**API Endpoints:**
```
POST   /api/tasks/:taskId/subtasks           # Create subtask
PUT    /api/tasks/:taskId/subtasks/:subtaskId # Update subtask
DELETE /api/tasks/:taskId/subtasks/:subtaskId # Delete subtask
PATCH  /api/tasks/:taskId/subtasks/reorder    # Reorder subtasks
```

**Frontend Components:**
- `SubtaskList.tsx` - Display and manage subtasks
- `SubtaskForm.tsx` - Add/edit subtask dialog
- Completion progress visualization

**XP Calculation:**
```
Base XP = 100
Subtask Bonus = (number of subtasks) × 50
Priority Multiplier = 1.0 (Low) → 2.0 (Critical)

Total XP = (Base + Subtask Bonus) × Priority Multiplier
```

### 2.2 Time Tracking System

**Purpose:** Track focus time, analyze productivity patterns, and enable Pomodoro technique.

**Key Components:**
- `TimerSession` model for tracking individual sessions
- Real-time WebSocket updates for live timer display
- Pause/resume functionality with accurate duration calculation
- Focus Mode support

**API Endpoints:**
```
POST   /api/timer/start/:taskId              # Start timer
POST   /api/timer/stop/:sessionId            # Stop timer
PATCH  /api/timer/pause/:sessionId           # Pause/resume
GET    /api/timer/history/:taskId            # Task timer history
GET    /api/timer/stats/daily                # Daily statistics
GET    /api/timer/stats/weekly               # Weekly statistics
```

**Timer Logic:**
```javascript
// Accurate duration calculation
totalTime = (endTime - startTime) - totalPausedTime

// Session breakdown
- Work sessions (tracked for productivity)
- Break sessions (tracked for wellness)
- Focus mode sessions (uninterrupted work)
```

**Data Visualization:**
- Daily/weekly time charts
- Focus sessions counter
- Most productive hours
- Session duration distribution

### 2.3 AI Productivity Coach

**Purpose:** Provide personalized insights and recommendations using OpenAI API.

**Key Components:**
- `AICoachService` - Generates insights from user data
- OpenAI GPT-4 integration for natural language insights
- Fallback system for when API fails

**API Endpoints:**
```
GET  /api/ai-coach/insights          # Get daily insights
POST /api/ai-coach/recommendation    # Get specific recommendation
```

**Metrics Analyzed:**
- Task completion rate
- Time tracking patterns (peak hours, session lengths)
- Priority distribution
- Category performance
- Streak information
- Difficulty assessment

**Insight Types:**
1. **Strength** (positive traits) - Encouragement
2. **Opportunity** (improvement areas) - Actionable
3. **Warning** (concerning patterns) - Alert
4. **Suggestion** (specific recommendations) - Action item

**Sample Insights:**
```
{
  type: "opportunity",
  title: "Optimize Peak Hours",
  description: "Your most productive hours are 9-11 AM. Schedule important tasks then.",
  recommendation: "Move high-priority tasks to mornings for better completion"
}
```

### 2.4 Focus Mode

**Purpose:** Eliminate distractions during deep work sessions.

**Key Features:**
- Full-screen overlay blocking other content
- Muted notifications
- Timer countdown with progress
- Completion sound notification
- Browser notification (with user permission)

**API Integration:**
```
POST /api/timer/start/{taskId}  { focusMode: true }
```

**Frontend Component:**
- `FocusMode.tsx` - Full-screen focus interface
- Prevents accidental navigation
- Completion triggers celebration UI

**Time Tracking:**
- Stores `focusMode: true` in TimerSession
- Separated from regular work sessions in analytics
- Bonus XP for focus sessions (1.25x multiplier)

### 2.5 Smart Scheduler

**Purpose:** AI-powered task distribution and scheduling optimization.

**Algorithm:**
```
1. Sort tasks by priority (Critical > High > Medium > Low)
2. Assess difficulty based on:
   - Priority level
   - Number of subtasks
   - Estimated duration
   - Explicit difficulty field
3. Calculate user's peak productivity hours
4. Distribute tasks across days considering:
   - Max 5 tasks per day (configurable)
   - Skip weekends (user preference)
   - Peak hours for difficult tasks
   - Work hours (9 AM - 6 PM)
5. Generate reasoning for each suggestion
```

**API Endpoints:**
```
GET  /api/scheduler/suggestions              # Get scheduling suggestions
POST /api/scheduler/apply                    # Apply selected suggestions
POST /api/scheduler/auto-schedule            # Auto-schedule all
GET  /api/scheduler/optimizations            # Get optimization tips
GET  /api/scheduler/distribution             # Task distribution analysis
GET  /api/scheduler/day-order?date=YYYY-MM-DD # Order for specific day
```

**Optimization Recommendations:**
- Task breakdown suggestions (if completion rate < 50%)
- Session length analysis (too short/long warnings)
- Priority re-evaluation (if > 50% high priority)
- Focus mode encouragement (if no focus sessions)
- Time tracking activation

**Distribution Analysis:**
- By Priority (Critical, High, Medium, Low counts)
- By Category (custom categories)
- By Date (upcoming workload)

---

## Part 3: Design Patterns & Best Practices

### 3.1 Backend Architecture Patterns

#### Service Layer Pattern
```
Request → Controller → Service → Repository → Database
```

**Benefits:**
- Separation of concerns
- Testable business logic
- Reusable services
- Clear error handling

#### Middleware Chain
```
Request → Auth → Validation → RateLimit → Handler → Response
```

#### Error Handling
```javascript
// Centralized error handler
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || 'Server Error';
  res.status(status).json({ error: message, code: err.code });
});
```

### 3.2 Frontend Architecture Patterns

#### Component Structure
```
Pages (Next.js routes)
  ↓
Layouts (Common wrappers)
  ↓
Components (Reusable UI)
  ↓
Hooks (State & effects)
  ↓
Utils (Helper functions)
```

#### State Management
- Zustand for global state (lightweight)
- React Query for server state (caching, sync)
- Local state for UI-only state (forms, modals)

#### Real-time Updates
```
WebSocket Connection → Listen for events → Update local state
                          ↓
                     React Query invalidation
                          ↓
                     UI automatically updates
```

---

## Part 4: API Reference

### Authentication

```
POST /api/auth/register
{
  email: string,
  password: string,
  name: string
}
Response: { token, user }

POST /api/auth/login
{
  email: string,
  password: string
}
Response: { token, user }

GET /api/auth/me (authenticated)
Response: { user }
```

### Tasks

```
GET    /api/tasks?status=pending&priority=High
POST   /api/tasks
PUT    /api/tasks/:id
DELETE /api/tasks/:id
PATCH  /api/tasks/:id/complete
```

### Timer

```
POST /api/timer/start/:taskId
POST /api/timer/stop/:sessionId
PATCH /api/timer/pause/:sessionId { isPaused: boolean }
GET /api/timer/history/:taskId
GET /api/timer/stats/daily
GET /api/timer/stats/weekly
```

### Scheduler

```
GET  /api/scheduler/suggestions
POST /api/scheduler/apply { suggestions }
POST /api/scheduler/auto-schedule
GET  /api/scheduler/optimizations
GET  /api/scheduler/distribution
GET  /api/scheduler/day-order?date=2024-01-15
```

### AI Coach

```
GET  /api/ai-coach/insights
POST /api/ai-coach/recommendation { topic: string }
```

---

## Part 5: Deployment

### Environment Variables

```bash
# Backend
MONGODB_URI=mongodb+srv://...
REDIS_URL=redis://...
JWT_SECRET=your-secret-key
OPENAI_API_KEY=sk-...
FRONTEND_URL=https://taskmaster.vercel.app
NODE_ENV=production
PORT=5000

# Frontend
NEXT_PUBLIC_API_URL=https://api.taskmaster.com
NEXT_PUBLIC_WS_URL=wss://api.taskmaster.com
```

### Deployment Steps

**Backend (Railway):**
```bash
1. Push to GitHub
2. Connect Railway to GitHub repo
3. Set environment variables
4. Deploy automatically
```

**Frontend (Vercel):**
```bash
1. Connect GitHub repo to Vercel
2. Set environment variables
3. Deploy on every push to main
```

**Database:**
```bash
1. MongoDB Atlas - Cloud hosting
2. Redis Cloud - Cache/session store
```

---

## Part 6: Performance & Scalability

### Caching Strategy

```
Level 1: Browser Cache
  ↓
Level 2: React Query Cache
  ↓
Level 3: Redis Cache (shared)
  ↓
Level 4: MongoDB (source of truth)
```

**TTL (Time-to-Live):**
- User profile: 5 minutes
- Task list: 1 minute
- Analytics: 30 minutes
- Leaderboard: 1 hour

### Database Indexes

```javascript
// Optimize common queries
taskSchema.index({ userId: 1, status: 1 });
taskSchema.index({ userId: 1, dueDate: 1 });
taskSchema.index({ userId: 1, priority: 1 });
timerSessionSchema.index({ userId: 1, createdAt: -1 });
```

### Query Optimization

```javascript
// Use lean() for read-only queries
Task.find({...}).lean()

// Select only needed fields
Task.find({...}, 'title status priority')

// Limit and pagination
Task.find({...}).limit(10).skip(offset)
```

### WebSocket Optimization

```javascript
// Room-based broadcasts (don't send to everyone)
io.to(`user:${userId}`).emit('task:updated', task);

// Event batching for high-frequency updates
// Send updates in 100ms intervals instead of every change
```

---

## Part 7: Security

### Authentication
- JWT tokens with strong secret
- bcrypt password hashing (10 rounds)
- Secure HTTP-only cookies
- Token expiration (15 minutes)

### Authorization
- Verify user ID on every request
- Check team membership for shared tasks
- Role-based access control (admin, manager, member)

### Input Validation
- TypeScript type checking
- Zod schemas on backend
- HTML escaping on frontend
- Rate limiting (100 requests/15 min)

### Data Protection
- HTTPS only (in production)
- CORS restrictions
- MongoDB encryption at rest
- Redis SSL connections

---

## Part 8: Testing

### Unit Tests
```javascript
// Test services
describe('TaskService', () => {
  it('should calculate XP correctly', () => {
    const xp = calculateXP(100, 'High');
    expect(xp).toBe(200);
  });
});
```

### Integration Tests
```javascript
// Test API endpoints
describe('POST /api/tasks', () => {
  it('should create a task', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Test' });
    expect(res.status).toBe(201);
  });
});
```

### E2E Tests
```javascript
// Test full user flow
describe('User creates and completes task', () => {
  it('should award XP', async () => {
    // Create task
    // Start timer
    // Complete task
    // Verify XP awarded
  });
});
```

---

## Part 9: Monitoring & Analytics

### Key Metrics
- Task completion rate
- Average session duration
- User retention
- API response times
- Error rates

### Tools
- Sentry (error tracking)
- DataDog (performance monitoring)
- LogRocket (user session replay)
- Vercel Analytics (frontend performance)

---

## Part 10: Future Enhancements

- [ ] GraphQL API
- [ ] Mobile app (React Native)
- [ ] Machine learning predictions
- [ ] Advanced analytics dashboard
- [ ] Calendar integration (Google, Outlook)
- [ ] Slack/Teams integration
- [ ] Offline-first sync
- [ ] Custom themes
- [ ] Voice commands
- [ ] AI-powered task breakdown

---

## Conclusion

TaskMaster demonstrates a **complete full-stack application** with:
- ✅ Scalable architecture
- ✅ Type-safe code (TypeScript)
- ✅ Real-time features (WebSocket)
- ✅ Advanced features (AI, scheduling)
- ✅ Performance optimization
- ✅ Security best practices
- ✅ Comprehensive testing

This project is **interview-ready** and showcases:
- **Technical depth** - Complex features well-implemented
- **Best practices** - Professional code patterns
- **Scalability** - Can handle growth
- **User focus** - Engaging features and UI/UX
- **Documentation** - Clear and comprehensive
