# Timer API - Quick Testing Guide

## Setup
The timer feature is now fully integrated. All files are in place.

**Files Created:**
- `backend/src/models/TimerSession.ts` - MongoDB model
- `backend/src/routes/timer.ts` - 6 API endpoints
- `backend/src/index.ts` - Updated with timer routes

**Database Connection:** Uses existing MongoDB connection (no setup needed)

---

## API Endpoints Reference

### 1. Start Timer
```
POST http://localhost:5000/api/timer/start/{taskId}
Authorization: Bearer {your_jwt_token}
Content-Type: application/json

Body:
{
  "focusMode": true   // optional
}

Response:
{
  "success": true,
  "data": {
    "_id": "...",
    "taskId": "...",
    "userId": "...",
    "startedAt": "2026-04-17T10:00:00Z",
    "sessionType": "work",
    "focusMode": true
  }
}
```

### 2. Stop Timer  
```
POST http://localhost:5000/api/timer/stop/{sessionId}
Authorization: Bearer {your_jwt_token}

Response:
{
  "success": true,
  "data": {
    "_id": "...",
    "duration": 2700,  // in seconds (45 min)
    "endedAt": "2026-04-17T10:45:00Z"
  },
  "durationMinutes": 45
}
```

### 3. Pause/Resume
```
PATCH http://localhost:5000/api/timer/pause/{sessionId}
Authorization: Bearer {your_jwt_token}
Content-Type: application/json

Body:
{
  "isPaused": true   // or false to resume
}

Response:
{
  "success": true,
  "data": { /* session data */ },
  "isPaused": true,
  "message": "Timer paused"
}
```

### 4. Get Task History
```
GET http://localhost:5000/api/timer/history/{taskId}
Authorization: Bearer {your_jwt_token}

Response:
{
  "success": true,
  "data": {
    "sessions": [ /* array */ ],
    "totalMinutes": 180,
    "sessionCount": 4,
    "averageSessionMinutes": 45
  }
}
```

### 5. Daily Stats
```
GET http://localhost:5000/api/timer/stats/daily
Authorization: Bearer {your_jwt_token}

Response:
{
  "success": true,
  "data": {
    "totalMinutesToday": 180,
    "sessionsCount": 5,
    "workSessionsCount": 4,
    "breakSessionsCount": 1,
    "focusSessionsCount": 2,
    "averageSessionMinutes": 36
  }
}
```

### 6. Weekly Stats
```
GET http://localhost:5000/api/timer/stats/weekly
Authorization: Bearer {your_jwt_token}

Response:
{
  "success": true,
  "data": {
    "byDay": [
      {
        "date": "2026-04-10",
        "totalSeconds": 10800,
        "sessionCount": 5,
        "focusSessionCount": 2,
        "totalMinutes": 180
      }
    ],
    "totalMinutesWeek": 900,
    "totalSessionsWeek": 25,
    "averageMinutesPerDay": 128
  }
}
```

---

## Testing Workflow

### Manual Testing (Postman/REST Client)

1. **Get a JWT Token**
   - Make login request to `/api/auth/login`
   - Copy token from response

2. **Get a Task ID**
   - Make GET request to `/api/tasks`
   - Copy any task ID from response

3. **Start Timer**
   ```
   POST /api/timer/start/{taskId}
   Headers: Authorization: Bearer {token}
   Body: { "focusMode": true }
   ```
   Save the returned `_id` as `{sessionId}`

4. **Wait/Simulate Work**
   - Wait a few seconds, or send pause/resume commands

5. **Stop Timer**
   ```
   POST /api/timer/stop/{sessionId}
   Headers: Authorization: Bearer {token}
   ```
   Should show `durationMinutes`

6. **Check Stats**
   ```
   GET /api/timer/stats/daily
   Headers: Authorization: Bearer {token}
   ```
   Should show today's sessions

---

## Expected Behavior

✅ **Timer starts** → Task status changes to "in-progress"
✅ **Timer stops** → Duration calculated and added to task.timeSpent
✅ **Timer paused** → Pause time excluded from duration
✅ **Authorization** → Fails with 403 for non-owned tasks
✅ **Stats** → Accurate calculations excluding pause time
✅ **Indexes** → Fast queries for user's daily/weekly stats

---

## Error Handling

| Status | Error | Meaning |
|--------|-------|---------|
| 401 | "Access token required" | No JWT provided |
| 403 | "Invalid or expired token" | Bad JWT |
| 403 | "Not authorized" | Task/session not owned |
| 404 | "Task not found" | TaskId doesn't exist |
| 404 | "Session not found" | SessionId doesn't exist |
| 500 | Server error | Database/other issue |

---

## Database Changes

**New Collection:** `timersessions`

**Keys Stored:**
- taskId (references Task)
- userId (references User)
- startedAt, endedAt
- duration (seconds)
- sessionType ('work' or 'break')
- focusMode (boolean)

**Task Collection Updates:**
- timeSpent field now incremented on timer stop

---

## What's Ready to Use

✅ Full API implemented
✅ MongoDB integration
✅ JWT authentication
✅ Error handling
✅ Performance indexes
✅ User isolation
✅ All statistics endpoints

## What Needs Next (Optional)

📋 Frontend timer component UI
🔔 Notifications on timer complete  
📊 Dashboard statistics display
⏰ Pomodoro preset buttons (25min/5min)
📈 Charts and trend analysis
🎯 Goals tracking

---

## Connection String

Uses your existing MongoDB connection from `.env`:
```
MONGODB_URI=mongodb://...
```

No additional setup needed!

---

**Status: ✅ READY TO TEST**
