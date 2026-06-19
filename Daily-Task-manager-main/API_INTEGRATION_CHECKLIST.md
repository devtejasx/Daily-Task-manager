# TaskMaster API Integration Checklist

## Complete API Endpoint Reference

### Authentication Endpoints

```
POST   /api/auth/register
       Request:  { email, password, name }
       Response: { token, user }
       Status:   201 Created

POST   /api/auth/login
       Request:  { email, password }
       Response: { token, user }
       Status:   200 OK

GET    /api/auth/me
       Headers:  Authorization: Bearer {token}
       Response: { user }
       Status:   200 OK
```

---

### Task Management Endpoints

#### Basic CRUD
```
GET    /api/tasks
       Query:    ?status=pending&priority=High&category=Work
       Response: { tasks: [...] }

POST   /api/tasks
       Request:  { title, description, priority, category, dueDate, estimatedDuration }
       Response: { _id, ...task }
       Status:   201 Created

PUT    /api/tasks/:id
       Request:  { title, description, priority, ... }
       Response: { _id, ...task }
       Status:   200 OK

DELETE /api/tasks/:id
       Response: { message: "Task deleted" }
       Status:   200 OK

PATCH  /api/tasks/:id/complete
       Response: { _id, status: "completed", xpEarned }
       Status:   200 OK
```

#### Subtask Endpoints
```
POST   /api/tasks/:taskId/subtasks
       Request:  { title, description, estimatedTime }
       Response: { task, subtask }
       Status:   201 Created

PUT    /api/tasks/:taskId/subtasks/:subtaskId
       Request:  { title, description, completed, estimatedTime, actualTime }
       Response: { task, subtask }
       Status:   200 OK

DELETE /api/tasks/:taskId/subtasks/:subtaskId
       Response: { message: "Subtask deleted", data: task }
       Status:   200 OK

PATCH  /api/tasks/:taskId/subtasks/reorder
       Request:  { subtaskIds: ["id1", "id2", "id3"] }
       Response: { task }
       Status:   200 OK
```

---

### Timer Endpoints

```
POST   /api/timer/start/:taskId
       Request:  { focusMode: boolean }
       Response: { _id, taskId, userId, startedAt }
       Status:   201 Created

POST   /api/timer/stop/:sessionId
       Response: { _id, duration, durationMinutes, endedAt }
       Status:   200 OK

PATCH  /api/timer/pause/:sessionId
       Request:  { isPaused: boolean }
       Response: { _id, isPaused }
       Status:   200 OK

GET    /api/timer/history/:taskId
       Response: { sessions, totalMinutes, sessionCount, averageSessionMinutes }
       Status:   200 OK

GET    /api/timer/stats/daily
       Response: { totalMinutesToday, sessionsCount, focusSessionsCount, averageSessionMinutes }
       Status:   200 OK

GET    /api/timer/stats/weekly
       Response: { byDay: [...], totalMinutesWeek, totalSessionsWeek, averageMinutesPerDay }
       Status:   200 OK
```

---

### Smart Scheduler Endpoints [NEW] ✨

```
GET    /api/scheduler/suggestions
       Response: { suggestions: [...], count, message }
       Status:   200 OK
       
       Suggestion object:
       {
         taskId: string,
         suggestedDate: Date,
         reasoning: string,
         difficulty: "easy" | "medium" | "hard",
         estimatedDuration: number,
         priority: string
       }

POST   /api/scheduler/apply
       Request:  { suggestions: [...] }
       Response: { applied: number, message }
       Status:   200 OK

POST   /api/scheduler/auto-schedule
       Response: { count: number, message }
       Status:   200 OK

GET    /api/scheduler/optimizations
       Response: { recommendations: [...], count }
       Status:   200 OK
       
       Example recommendations:
       - "Consider breaking down larger tasks into subtasks"
       - "Your sessions are quite short. Try Pomodoro (25 min)"
       - "Enable Focus Mode for better concentration"

GET    /api/scheduler/distribution
       Response: {
         byCategory: { "Work": 5, "Personal": 3 },
         byPriority: { "Critical": 2, "High": 5 },
         byDate: { "2024-01-16": 3, "2024-01-17": 4 }
       }
       Status:   200 OK

GET    /api/scheduler/day-order?date=YYYY-MM-DD
       Response: { date, suggestions: [...], count }
       Status:   200 OK
```

---

### AI Coach Endpoints

```
GET    /api/ai-coach/insights
       Response: {
         insights: [
           {
             type: "strength" | "opportunity" | "warning" | "suggestion",
             title: string,
             description: string,
             actionable: boolean,
             recommendation?: string
           }
         ],
         generatedAt: Date,
         nextRefresh: Date
       }
       Status:   200 OK

POST   /api/ai-coach/recommendation
       Request:  { topic: "productivity" | "streaks" | "time-management" }
       Response: { recommendation: string, actionable: boolean }
       Status:   200 OK
```

---

### Gamification Endpoints

```
GET    /api/gamification/stats
       Response: { level, totalXP, streak, maxStreak, achievements }
       Status:   200 OK

GET    /api/gamification/leaderboard
       Query:    ?limit=10&timeframe=week
       Response: { leaderboard: [...], userRank, userScore }
       Status:   200 OK

GET    /api/gamification/achievements
       Response: { achievements: [...], earned: [...], total }
       Status:   200 OK
```

---

### Analytics Endpoints

```
GET    /api/analytics/summary
       Response: {
         tasksCompleted: number,
         totalTimeTracked: number,
         averageSessionLength: number,
         currentStreak: number,
         totalXP: number
       }
       Status:   200 OK

GET    /api/analytics/productivity-chart
       Query:    ?period=week|month|year
       Response: { labels: [...], data: [...] }
       Status:   200 OK

GET    /api/analytics/category-breakdown
       Response: { categories: { "Work": 45, "Personal": 30 } }
       Status:   200 OK
```

---

## Implementation Checklist

### Frontend Integration

- [ ] Authentication Flow
  - [ ] Login component integrated
  - [ ] Token stored in secure cookie
  - [ ] Auto-redirect on auth required pages
  - [ ] Logout clears credentials

- [ ] Task Management
  - [ ] Task list displays from API
  - [ ] Create task form submits to API
  - [ ] Edit task updates via PUT
  - [ ] Delete task calls DELETE endpoint
  - [ ] Filter/sort UI working

- [ ] Subtasks
  - [ ] SubtaskList component renders
  - [ ] Add subtask form works
  - [ ] Toggle subtask completion
  - [ ] Delete subtask option
  - [ ] Progress bar updates

- [ ] Timer System
  - [ ] Timer widget displays
  - [ ] Start timer button works
  - [ ] Stop timer button works
  - [ ] Pause/resume buttons work
  - [ ] Timer counts down in real-time
  - [ ] Stats display correctly

- [ ] AI Coach
  - [ ] Insights load and display
  - [ ] Refresh insights button works
  - [ ] Icons/colors correct for insight types
  - [ ] Recommendations are readable

- [ ] Smart Scheduler
  - [ ] Suggestions tab shows unscheduled tasks
  - [ ] Can select/deselect suggestions
  - [ ] Apply Selected button works
  - [ ] Auto-Schedule All button works
  - [ ] Optimizations tab displays tips
  - [ ] Distribution charts render

- [ ] Real-time Updates
  - [ ] WebSocket connects on page load
  - [ ] Task updates reflect immediately
  - [ ] Timer updates in real-time
  - [ ] Notifications appear for events

### Backend Integration

- [ ] Server Initialization
  - [ ] Routes registered in main index.ts
  - [ ] Middleware chain set up
  - [ ] Error handlers working
  - [ ] CORS configured

- [ ] Task Endpoints
  - [ ] GET /tasks works
  - [ ] POST /tasks creates task
  - [ ] PUT /tasks/:id updates task
  - [ ] DELETE /tasks/:id removes task
  - [ ] PATCH /tasks/:id/complete completes

- [ ] Subtask Endpoints
  - [ ] POST creates subtask
  - [ ] PUT updates subtask
  - [ ] DELETE removes subtask
  - [ ] PATCH reorders subtasks
  - [ ] Completion percentage calculated

- [ ] Timer Endpoints
  - [ ] POST start creates session
  - [ ] POST stop calculates duration
  - [ ] PATCH pause works correctly
  - [ ] GET history returns sessions
  - [ ] Stats endpoints return data

- [ ] Scheduler Endpoints
  - [ ] GET suggestions returns unscheduled
  - [ ] POST apply saves schedule
  - [ ] POST auto-schedule distributes
  - [ ] GET optimizations returns tips
  - [ ] GET distribution works
  - [ ] GET day-order orders tasks

- [ ] AI Coach Endpoints
  - [ ] GET insights calls OpenAI
  - [ ] Fallback works if API fails
  - [ ] POST recommendation works
  - [ ] Cache prevents repeated calls

- [ ] Authentication
  - [ ] JWT issued on login
  - [ ] Token verified on requests
  - [ ] User ID extracted correctly
  - [ ] Unauthorized returns 401

- [ ] Authorization
  - [ ] User can only see own tasks
  - [ ] User can't delete others' tasks
  - [ ] Shared tasks respect permissions
  - [ ] Team members can see shared

- [ ] Data Validation
  - [ ] Invalid inputs rejected
  - [ ] Error messages helpful
  - [ ] Required fields enforced
  - [ ] Data types validated

### Database

- [ ] Collections Created
  - [ ] users collection
  - [ ] tasks collection
  - [ ] timersessions collection
  - [ ] achievements collection

- [ ] Indexes Created
  - [ ] userId indexes for queries
  - [ ] dueDate indexes
  - [ ] priority indexes
  - [ ] composite indexes

- [ ] Data Models
  - [ ] Task schema matches spec
  - [ ] TimerSession schema correct
  - [ ] Subtasks embedded properly
  - [ ] Gamification fields present

### Cache (Redis)

- [ ] Session Storage
  - [ ] JWT stored in session
  - [ ] Auto-expires after timeout
  - [ ] Can retrieve user session

- [ ] Data Caching
  - [ ] User profiles cached
  - [ ] Task lists cached
  - [ ] Cache invalidates on updates
  - [ ] TTL values appropriate

- [ ] Real-time
  - [ ] Focus mode data stored
  - [ ] Timer data accessible
  - [ ] Pub/Sub working for events

### Testing

- [ ] Unit Tests
  - [ ] Service functions tested
  - [ ] Helper functions tested
  - [ ] Error handling tested

- [ ] Integration Tests
  - [ ] Full API flows tested
  - [ ] Authentication tested
  - [ ] Database operations tested

- [ ] E2E Tests
  - [ ] User can log in
  - [ ] User can create task
  - [ ] User can complete task
  - [ ] User earns XP

### Performance

- [ ] Response Times
  - [ ] GET endpoints < 100ms
  - [ ] POST endpoints < 200ms
  - [ ] Database queries optimized

- [ ] Load Testing
  - [ ] Can handle 100 concurrent users
  - [ ] API doesn't crash under load
  - [ ] Response times acceptable

### Security

- [ ] Authentication
  - [ ] Passwords hashed with bcrypt
  - [ ] JWT secrets strong
  - [ ] Tokens expire

- [ ] Authorization
  - [ ] User IDs verified on all requests
  - [ ] Shared resources protected
  - [ ] Admin endpoints restricted

- [ ] Input Validation
  - [ ] All inputs validated
  - [ ] SQL injection prevented
  - [ ] XSS prevention in place

- [ ] HTTPS
  - [ ] All API calls use HTTPS
  - [ ] Cookies secure flag set
  - [ ] CORS properly configured

### Monitoring

- [ ] Error Tracking
  - [ ] Sentry integrated
  - [ ] Errors logged
  - [ ] Alerts configured

- [ ] Performance Monitoring
  - [ ] Response times tracked
  - [ ] Database query times tracked
  - [ ] Memory usage monitored

- [ ] User Analytics
  - [ ] Feature usage tracked
  - [ ] User engagement measured
  - [ ] Conversion metrics calculated

---

## Quick Integration Test

### 1. Backend Test
```bash
# Start backend
cd backend && npm run dev

# Test health endpoint
curl http://localhost:5000/api/health
# Expected: {"status":"ok",...}

# Test scheduler endpoint
curl http://localhost:5000/api/scheduler/suggestions \
  -H "Authorization: Bearer TEST_TOKEN"
# Expected: 401 (no valid token) or 200 (with valid token)
```

### 2. Frontend Test
```bash
# Start frontend
cd frontend && npm run dev

# Open http://localhost:3000 in browser

# Check console for errors
# Verify API calls go to http://localhost:5000
```

### 3. Integration Test
```bash
# Create task
# Add subtasks
# Start timer
# Check Smart Scheduler suggestions
# Verify XP calculation
# Complete task
```

---

## Common Integration Issues & Solutions

| Issue | Solution |
|-------|----------|
| `Cannot find module 'scheduler'` | Make sure route is imported in index.ts |
| 401 Unauthorized | Check JWT token is valid and not expired |
| CORS error | Verify FRONTEND_URL in backend .env matches actual URL |
| Timer not updating | Check WebSocket connection in browser console |
| AI Coach returns errors | Verify OPENAI_API_KEY is set and has credits |
| Scheduler returns empty | Check tasks have no dueDate |
| Real-time not working | Ensure Redis is running and connected |

---

## Final Integration Verification

Run this checklist before deployment:

- [ ] All 5 features implemented
- [ ] All endpoints responding
- [ ] Frontend components rendering
- [ ] Database queries working
- [ ] Real-time updates functioning
- [ ] Error handling working
- [ ] Authentication secured
- [ ] Performance acceptable
- [ ] No console errors
- [ ] Mobile responsive

**When all checked ✅ - Ready for Production! 🚀**

---

## Next: Deployment

See [Deployment Guide](./DEPLOY_QUICK_START.md) for production setup
