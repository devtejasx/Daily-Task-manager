# 🎯 PHASE 5 IMPLEMENTATION ROADMAP

**Duration:** 8 weeks (Weeks 17-24)  
**Goal:** Complete advanced features and prepare for production launch  
**Status:** Ready for Development Assignment

---

## Overview

Phase 5 builds on Phase 4's AI/Voice foundation to add enterprise-grade features. This roadmap provides specific technical guidance, file locations, and implementation sequences.

---

## WEEK 17-18: CALENDAR & PLANNING ENHANCEMENT

### Sprint Goals
- [ ] Full calendar views (month, week, day, agenda)
- [ ] Drag-drop rescheduling
- [ ] Productivity heat map
- [ ] Planning AI recommendations

### Frontend Tasks

#### Task 1: Extend Calendar Views (3 days)
```
File: frontend/src/components/CalendarView.tsx (NEW)
Dependencies: react-big-calendar, framer-motion

Tasks:
1. Create EnhancedCalendarView component
   - Support month/week/day/agenda toggles
   - Custom event rendering with priority colors
   - Hover tooltips showing full task details

2. Month View enhancements:
   - Show task count badges
   - Heat map coloring (opacity by completion %)
   - Click to create event on date

3. Week View:
   - Time grid layout (8am-8pm)
   - Multi-day event spanning
   - Time slot highlighting for available hours

4. Day View:
   - Hour-by-hour breakdown
   - Current time indicator
   - Time-based color progression

5. Agenda View:
   - Chronological task list
   - Grouped by due date
   - Time indicators

Implementation:
- Use react-big-calendar as base
- Custom eventStyleGetter for colors
- LocalStorage for view preference
- Responsive breakpoints for mobile
```

#### Task 2: Drag-Drop Rescheduling (2 days)
```
File: frontend/src/components/CalendarView.tsx (update)
Dependencies: react-big-calendar supporting onSelectSlot

Implementation:
1. Enable drag events on calendar
   - onEventDrop handler
   - Confirm rescheduling modal
   - Undo option

2. Drag to time slot to create task

3. Optimistic UI update
   - Show new time immediately
   - Revert on server error
   - Toast notification

API Calls:
- PUT /api/tasks/{id} with new dueDate
```

#### Task 3: Productivity Heat Map (2 days)
```
File: frontend/src/components/HeatMap.tsx (NEW)
Dependencies: recharts, d3-color

Features:
1. Calendar heat map (12-month view)
   - Green → Yellow → Red gradient
   - Opacity = completion %
   - Tooltip on hover showing:
     * Date
     * Tasks completed
     * XP earned
     * Time spent

2. Activity pattern analysis
   - Identify productive days
   - Show trends
   - Predict best completion times

3. Interactive filtering
   - By category
   - By priority
   - Date range selection

Implementation:
- Query: GET /api/analytics/daily
- Format data as grid (7 cols × 52 rows)
- Responsive sizing for mobile
```

### Backend Tasks

#### Task 1: Calendar Query Optimization (1 day)
```
File: backend/src/routes/tasks.ts (update)
File: backend/src/controllers/TaskController.ts (update)

Enhancements:
1. Add new query endpoint: GET /api/tasks/calendar
   - Accepts: startDate, endDate, filters
   - Returns: Tasks optimized for calendar display
   - Only essential fields: _id, title, dueDate, priority, category

2. Implement caching
   - Redis key: calendar:{userId}:{startDate}:{endDate}
   - TTL: 1 hour (user can clear)

3. Add helper: getTasksForDateRange
   - Efficient MongoDB query
   - Proper indexing: dueDate, userId
   - Use aggregation for performance

Index needed:
db.tasks.createIndex({ userId: 1, dueDate: 1 })
```

#### Task 2: Planning API Endpoints (1 day)
```
File: backend/src/routes/planning.ts (NEW)
File: backend/src/controllers/PlanningController.ts (NEW)

New Endpoints:
1. GET /api/planning/suggestions
   - Analyzes user's tasks
   - Returns scheduling suggestions
   - Flags overloaded days
   - Suggests task distribution

2. GET /api/planning/week-analysis
   - Current week tasks
   - Completion probability
   - Time recommendations

3. POST /api/planning/auto-schedule
   - AI suggests optimal dates/times
   - User approves/rejects
   - Bulk apply to selected tasks

Implementation:
- Use AISuggestionsService
- GPT-4 prompt: planning and distribution
- Include current calendar in context
```

### UI/UX Improvements
- [ ] Calendar page layout and styling
- [ ] Add calendar shortcuts to navigation
- [ ] Mobile calendar optimizations
- [ ] Empty state templates

---

## WEEK 19-20: HABIT SYSTEM

### Sprint Goals
- [ ] Habit CRUD functionality
- [ ] Habit calendar visualization
- [ ] Habit statistics dashboard
- [ ] Streak tracking integration

### Frontend Tasks

#### Task 1: Habit Component Suite (2 days)
```
File: frontend/src/components/HabitCard.tsx (update)
File: frontend/src/components/HabitForm.tsx (NEW)
File: frontend/src/components/HabitModal.tsx (NEW)

Components:
1. HabitCard
   - Display habit info
   - Current streak with flame icon
   - Last completion date
   - Quick complete button
   - Edit/delete actions

2. HabitForm
   - Create new habit
   - Fields: name, category, difficulty, icon, color
   - Frequency: daily/weekly/custom
   - Reminders settings
   - Success criteria

3. HabitModal
   - Full editing interface
   - Statistics section
   - Linked tasks section
   - Completion history

4. HabitList
   - Filter by status (active/paused/archived)
   - Sort by streak, creation date, category
   - Search
   - Batch actions

Implementation:
- Zustand for habit state
- React Hook Form for forms
- Sonner for notifications
```

#### Task 2: Habit Calendar Grid (2 days)
```
File: frontend/src/components/HabitCalendar.tsx (NEW)
Dependencies: react-calendar, framer-motion

Features:
1. 12-month habit calendar
   - Each day shows completion status (filled/empty)
   - Color = habit color
   - Click to view completion details
   - Hover shows date

2. Size: 7 cols × 52 rows grid
   - Responsive on mobile
   - Zoom in/out on desktop

3. Streak display
   - Flame icon for current streak
   - "Streak in danger" warning (< 4hrs to midnight)
   - Longest streak badge

4. Statistics overlay
   - Current streak: X days
   - Completion rate: X%
   - Missed days: X
   - Best month: [month name]

Implementation:
- API: GET /api/habits/{id}/calendar
- Returns: [{ date, completed, duration }]
- LocalStorage for display preferences
```

#### Task 3: Habit Statistics Dashboard (1 day)
```
File: frontend/src/components/HabitStats.tsx (NEW)
Dependencies: recharts

Display:
1. Stats cards
   - Total habits: X
   - Active habits: X
   - Habits due today: X
   - Average completion rate: X%

2. Habit performance chart
   - Horizontal bar chart
   - Each habit with completion %
   - Last 30 days

3. Trend analysis
   - Weekly completion rate graph
   - Category breakdown pie chart
   - Best performing habits

4. Achievements preview
   - Next habit badge to unlock
   - Streaks progress
```

### Backend Tasks

#### Task 1: Habit CRUD Endpoints (2 days)
```
File: backend/src/routes/habits.ts (NEW)
File: backend/src/controllers/HabitController.ts (NEW)

Endpoints:
1. POST /api/habits
   - Create new habit
   - Fields: name, frequency, category, color, icon
   - Default dailyStreak = 0
   - createdAt = now

2. GET /api/habits
   - List user's habits
   - Filter: active, paused, archived
   - Sort: streak, createdAt
   - Include stats for each

3. GET /api/habits/{id}
   - Full habit detail
   - Include completions (last 30 days)
   - Include linked tasks
   - Statistics

4. PUT /api/habits/{id}
   - Update habit properties
   - Can change frequency, name, color
   - Track changes in audit log

5. PATCH /api/habits/{id}/complete
   - Mark habit complete for today
   - Update streak
   - Create activity log entry
   - Award XP if task-linked

6. DELETE /api/habits/{id}
   - Soft delete (archive)
   - Keep completion history
   - Can restore within 30 days

Implementation:
- Validate frequency format
- Check duplicate habit names
- Enforce user isolation (auth middleware)
```

#### Task 2: Streak Calculation Engine (1 day)
```
File: backend/src/services/StreakService.ts (NEW)

Functions:
1. calculateStreak(habitId, userId)
   - Query habit completions
   - Count consecutive days from today backward
   - Handle midnight timezone boundary

2. checkStreakInDanger(habitId)
   - If >4 hours since last completion
   - Trigger "streak in danger" notification

3. awardStreakXP(habitId, streak)
   - +5 XP per day
   - Milestone bonuses
   - Send notification

4. resetStreak(habitId)
   - Trigger on missed day
   - Save previous streak to longestStreak
   - Notify user

Cron Job:
- Daily at 1 AM
- Check all habits for missed completions
- Reset streaks as needed
- Send notifications
```

#### Task 3: Habit Calendar Data (1 day)
```
File: backend/src/routes/habits.ts (update)

Endpoint:
GET /api/habits/{id}/calendar?months=12

Returns:
{
  habitId,
  calendarData: [
    { date: "2026-04-11", completed: true, duration: 15 },
    { date: "2026-04-10", completed: false, duration: 0 },
    ...
  ],
  currentStreak: 12,
  longestStreak: 28,
  completionRate: 0.85
}

Performance:
- Cache with TTL 1 hour
- Use aggregation pipeline
- Index: habitId, completionDate
```

### Database Updates
```
New Schema: HabitCompletion
{
  _id: ObjectId,
  habitId: ref(Habit),
  userId: ref(User),
  completionDate: Date,
  duration: Number,
  xpEarned: Number,
  createdAt: Date
}

Update Habit Model:
- Add: completions: [HabitCompletion]
- Add: longestStreak: Number
- Add: currentStreak: Number
- Add: lastCompletedDate: Date
- Add: frequencyPattern: Object
```

### UI Pages
- [ ] Habits page layout
- [ ] Create habit page
- [ ] Individual habit detail page
- [ ] Habit calendar share feature

---

## WEEK 21-22: TEAM COLLABORATION ENHANCEMENT

### Sprint Goals
- [ ] Task sharing UI
- [ ] Permission management
- [ ] Comments thread system
- [ ] Activity feed
- [ ] Team invitation workflow

### Frontend Tasks

#### Task 1: Task Sharing Modal (1 day)
```
File: frontend/src/components/ShareTaskModal.tsx (NEW)
Dependencies: sonner, react-hook-form

Features:
1. Share form
   - Email input (autocomplete from team)
   - Permission level select:
     * View (read-only)
     * Edit (can edit task)
     * Comment (can comment)
     * Manage (can reassign)
   - Expiration date optional

2. Current shares section
   - List of people it's shared with
   - Their permissions
   - Remove button
   - Revoke all option

3. Share link generation
   - Time-limited link (2 weeks default)
   - One-time use toggle
   - Copy to clipboard

Implementation:
- API: POST /api/tasks/{id}/share
- Track who has access
- Update UI on removal
```

#### Task 2: Permissions UI Component (1 day)
```
File: frontend/src/components/PermissionSelector.tsx (NEW)

Displays:
1. Role/Permission matrix
   - Team Viewer | Team Member | Manager | Admin

2. Inline permission editor
   - For shared tasks
   - Change permission level
   - Quick revoke

3. Share settings
   - Can others invite more people?
   - Can others see who has access?
   - Expiration warnings
```

#### Task 3: Comments Thread Component (2 days)
```
File: frontend/src/components/CommentThread.tsx (NEW)
File: frontend/src/components/CommentForm.tsx (NEW)
Dependencies: react-hook-form, react-markdown

Features:
1. Comment display
   - Author name + avatar
   - Timestamp (relative)
   - Comment text (markdown support)
   - Edit/delete for author
   - Thread replies

2. Comment form
   - Rich text editor (basic)
   - @mention support (autocomplete)
   - File attachment preview
   - Submit/Cancel buttons

3. Interactions
   - Inline reply button
   - Show reply count
   - Nested comments (1 level)
   - Mark helpful

Implementation:
- API: POST /api/tasks/{id}/comments
- GET /api/tasks/{id}/comments
- PUT /api/comments/{id}
- DELETE /api/comments/{id}
- Pagination support (50 latest)
- @mention notifications
```

#### Task 4: Team Activity Feed (1 day)
```
File: frontend/src/components/ActivityFeed.tsx (NEW)

Display:
1. Recent team activities
   - "User completed 'Task Name'" ✓
   - "User created 'New Task'" +
   - "User commented on 'Task'" 💬
   - "User joined team" 👥
   - "User left task" ❌

2. Filter options
   - By team member
   - By activity type
   - By task/project
   - Date range

3. Timeline view
   - Chronological
   - Group by day
   - Show user avatars
   - Timestamps

Implementation:
- API: GET /api/teams/{teamId}/activity
- Real-time updates via WebSocket
- Pagination (30 items per page)
- Search by user/task name
```

#### Task 5: Team Member Manager (1 day)
```
File: frontend/src/components/TeamMemberManager.tsx (NEW)

Features:
1. Member list
   - Name, email, role
   - Join date
   - Last activity date
   - Remove button (admin only)

2. Role selector
   - Change member role
   - Confirmation dialog
   - Activity log entry

3. Pending invitations
   - Show sent invites
   - Resend option
   - Cancel invite

4. Remove member
   - Confirm dialog
   - Option to reassign their tasks
   - Keep their completed tasks
   - Notification to removed member
```

### Backend Tasks

#### Task 1: Task Sharing Endpoints (1.5 days)
```
File: backend/src/routes/sharing.ts (NEW)
File: backend/src/controllers/SharingController.ts (NEW)

Endpoints:
1. POST /api/tasks/{id}/share
   - Body: { email, permission, expiresAt }
   - Create TaskShare document
   - Send email notification
   - Add to ActivityLog

2. GET /api/tasks/{id}/shares
   - List who has access
   - Include permission levels
   - Show expiration status

3. DELETE /api/tasks/{id}/shares/{shareId}
   - Revoke access
   - Log removal
   - Notify removed user

4. PUT /api/tasks/{id}/shares/{shareId}
   - Update permission level
   - Change expiration date

Schema: TaskShare
{
  _id: ObjectId,
  taskId: ref(Task),
  sharedBy: ref(User),
  sharedWith: ref(User) or email: String,
  permission: 'view'|'edit'|'comment'|'manage',
  expiresAt: Date,
  shareLink: String (unique),
  oneTimeUse: Boolean,
  usedAt: Date,
  createdAt: Date
}

Middleware:
- checkTaskPermission(permission level)
- validateShareExpiration()
```

#### Task 2: Comments API (1.5 days)
```
File: backend/src/routes/comments.ts (NEW)
File: backend/src/controllers/CommentController.ts (NEW)

Endpoints:
1. POST /api/tasks/{id}/comments
   - Body: { text, mentions: [userIds] }
   - Create comment
   - Trigger @mentions
   - Notify task watchers

2. GET /api/tasks/{id}/comments
   - Paginated (50 per page)
   - Sort by createdAt desc
   - Include author details
   - Include reply count

3. PUT /api/comments/{id}
   - Update comment text
   - Only by author
   - Track edit timestamp

4. DELETE /api/comments/{id}
   - Soft delete
   - Mark as [deleted]
   - Keep for history

Schema: Comment
{
  _id: ObjectId,
  taskId: ref(Task),
  author: ref(User),
  text: String,
  mentions: [ref(User)],
  isEdited: Boolean,
  editedAt: Date,
  parentComment: ref(Comment) or null,
  createdAt: Date,
  deletedAt: Date or null
}

Notification:
- Trigger on @mention
- Trigger on comment reply
- Include comment snippet in notification
```

#### Task 3: Activity Logging (1 day)
```
File: backend/src/models/ActivityLog.ts (update)
File: backend/src/middleware/activityLogger.ts (NEW)

Log Events:
1. Task created
2. Task completed
3. Task commented
4. Task shared
5. Task assigned
6. User joined team
7. Team settings changed

Schema updates:
{
  _id: ObjectId,
  teamId: ref(Team),
  userId: ref(User),
  action: String,
  targetId: ObjectId,
  targetType: 'task'|'team'|'member',
  description: String,
  metadata: Object,
  createdAt: Date
}

Endpoint:
GET /api/teams/{teamId}/activity
- Query params: filter, page, limit
- Real-time WebSocket events
```

#### Task 4: Permission Enforcement (1 day)
```
File: backend/src/middleware/permissions.ts (NEW)

Functions:
1. canViewTask(userId, taskId)
   - Check task owner
   - Check team member access
   - Check share permissions
   - Return boolean

2. canEditTask(userId, taskId)
   - Owner only
   - Team editor or manager
   - Share with 'edit' permission

3. canCommentTask(userId, taskId)
   - Same as canViewTask
   - OR explicit comment permission

4. canManageTask(userId, taskId)
   - Owner
   - Team manager/admin
   - Share with 'manage'

Usage in routes:
```typescript
router.put('/tasks/:id', 
  authenticate,
  (req, res, next) => {
    checkPermission(req.user._id, req.params.id, 'edit')
    next()
  },
  updateTask
)
```

### UI Pages
- [ ] Team management page
- [ ] Shared with me tasks view
- [ ] Team tasks board
- [ ] Team calendar view
- [ ] Team analytics page

---

## WEEK 23-24: NOTIFICATIONS & REMINDERS ENHANCEMENT

### Sprint Goals
- [ ] Reminder scheduling system
- [ ] Snooze functionality
- [ ] Quiet hours/DND mode
- [ ] Email reminder service
- [ ] Browser notifications

### Frontend Tasks

#### Task 1: Reminder Settings Modal (1 day)
```
File: frontend/src/components/ReminderSettingsModal.tsx (NEW)

Features:
1. Create/edit reminder
   - Time before deadline: [dropdown] minutes/hours/days
   - Type: [radio] in-app | email | browser | SMS
   - Multiple reminders per task
   - Recurring tasks: apply to each

2. Reminder list
   - Show all reminders for task
   - Remove button
   - Reorder (drag-drop)

3. Smart suggestions
   - "Suggest optimal time" button
   - AI recommends timing based on:
     * Task priority
     * User's past behavior
     * Category defaults

4. Templates
   - Last used reminders
   - Suggested templates (urgent = 1hr + 30min)
   - Save custom template

Implementation:
- React Hook Form with Zod validation
- Framer motion for animations
- API: PUT /api/tasks/{id}/reminders
```

#### Task 2: Snooze UI Component (1 day)
```
File: frontend/src/components/SnoozeOptions.tsx (NEW)

Quick snooze options:
- 5 min | 15 min | 30 min | 1h | 2h | Tomorrow | Custom

Custom snooze:
- Time picker
- Or natural language: "snooze until Friday"
- Repeat snooze: repeat every {time}

Interaction:
- Toast with undo option
- Shows new reminder time
- Tracks snooze count
- Warns if over-snoozing (>2 times)

Implementation:
- API: PATCH /api/notifications/{id}/snooze
- LocalStorage for quick access
```

#### Task 3: Quiet Hours / DND Settings (1 day)
```
File: frontend/src/components/NotificationSettings.tsx (NEW)

Settings sections:
1. Global notification toggle

2. Quiet Hours
   - Start time (time picker)
   - End time
   - Days: [checkbox grid] M T W R F S S
   - Still deliver for: Critical priority only (toggle)

3. Do Not Disturb
   - Until specific time
   - For next X minutes
   - Until manual disable
   - Persistent across sessions

4. Per-category settings
   - Category list
   - Toggle notifications on/off
   - Override quiet hours

5. Sound settings
   - Default sound
   - Sound per priority
   - Silent mode option

6. Notification display
   - Show task preview
   - Show priority/category
   - Quick action buttons

Implementation:
- Zustand for settings state
- API: PUT /api/users/{id}/notification-settings
- LocalStorage backup
- WebWorker for quiet hours checking
```

#### Task 4: Notification History View (1 day)
```
File: frontend/src/components/NotificationHistory.tsx (NEW)

Display:
1. List of recent notifications
   - Type icon (bell, envelope, etc)
   - Title/description
   - Time received
   - Status: read/unread/archived

2. Filter options
   - By type (all, reminders, updates, team)
   - By date range
   - Unread only toggle

3. Actions
   - Mark as read
   - Archive
   - Clear all
   - Re-trigger notification

4. Search
   - Full-text search in notifications
   - Quick filters (this week, today)

Implementation:
- API: GET /api/notifications?page=1&limit=50
- Pagination support
- Real-time updates via WebSocket
```

### Backend Tasks

#### Task 1: Reminder Scheduling Service (2 days)
```
File: backend/src/services/ReminderService.ts (NEW)

Functions:
1. scheduleReminders(taskId)
   - Get task and reminders
   - Calculate trigger times
   - Queue reminder jobs
   - Store in Bull queue

2. processReminder(reminderId)
   - Get task and user details
   - Determine notification types
   - Check quiet hours
   - Send appropriately
   - Log sent reminder

3. cancelReminders(taskId)
   - Remove queued reminders
   - Update task

Queue Setup:
- Use Bull + Redis
- Job retry on failure
- Dead letter queue for failed
- Notification rate limiting

Reminder Schema Update:
{
  taskId: ref(Task),
  timeBefore: Number, // minutes
  unit: 'minute'|'hour'|'day',
  type: 'in-app'|'email'|'browser'|'sms',
  createdAt: Date,
  scheduledFor: Date,
  sentAt: Date,
  status: 'pending'|'sent'|'failed'|'cancelled'
}

Middleware:
// Attach reminder logic to task creation/update
router.post('/tasks', createTaskMiddleware(scheduleReminders))
```

#### Task 2: Email Reminders Service (1.5 days)
```
File: backend/src/services/EmailReminderService.ts (NEW)

Integration with SendGrid:
1. Create email template in SendGrid
   - Task title
   - Due date/time
   - Priority badge
   - Category
   - Action button (open in app)

2. sendEmailReminder(taskId, userId)
   - Get user email
   - Get task details
   - Send via SendGrid API
   - Log sent email
   - Handle bounces

3. Error handling
   - Invalid email
   - SendGrid rate limit
   - Retry logic
   - Fallback to in-app notification

Environment:
- SENDGRID_API_KEY in .env
- Email templates configured
```

#### Task 3: Browser/Push Notifications (1.5 days)
```
File: backend/src/services/BrowserNotificationService.ts (NEW)

Features:
1. Register subscription
   - POST /api/notifications/subscribe
   - Save PushSubscription
   - Return subscription status

2. Send notification
   - sendBrowserNotification(userId, data)
   - Query user's subscriptions
   - Send via Web Push API
   - Handle failures
   - Check quiet hours

3. Types
   - Reminder notification
   - Achievement unlock
   - Team activity
   - System alert

Configuration:
- VAPID_PUBLIC_KEY
- VAPID_PRIVATE_KEY
- Notification icon/badge

Implementation:
- Use web-push library
- Handle subscription expiration
- Retry with exponential backoff
```

#### Task 4: Notification Deduplication (1 day)
```
File: backend/src/middleware/notificationDeduplicator.ts (NEW)

Logic:
1. Check if same notification sent recently
   - Key: userId:taskId:type:trigger
   - TTL: 5 minutes
   - Skip if duplicate

2. Merge multiple reminders
   - Multiple reminders for same task
   - Send once with all details
   - Show "X more reminders coming"

3. Rate limiting
   - Max 10 notifications per user per hour
   - Max 3 per task
   - Queue excess for later

Endpoint Update:
- Add deduplication middleware to reminder processing
- Use Redis for duplicate tracking
```

#### Task 5: Notification API Endpoints (1 day)
```
File: backend/src/routes/notifications.ts (update)

New Endpoints:
1. GET /api/notifications
   - Query: page, limit, filter
   - Returns: paginated notifications
   - Include: type, title, body, timestamp, read status

2. PATCH /api/notifications/{id}
   - Mark as read
   - Archive notification

3. DELETE /api/notifications/{id}
   - Delete notification
   - Or soft delete for history

4. PATCH /api/notifications/{id}/snooze
   - Body: { snoozeUntil }
   - Reschedule reminder
   - Update UI

5. POST /api/notifications/subscribe
   - Browser push subscription
   - Save PushSubscription object

6. PUT /api/users/{id}/notification-settings
   - Update user notification preferences
   - Quiet hours, DND, per-category settings

Notification Model:
{
  _id: ObjectId,
  userId: ref(User),
  type: 'reminder'|'achievement'|'team'|'system',
  title: String,
  body: String,
  taskId: ref(Task) or null,
  actionLink: String,
  read: Boolean,
  archived: Boolean,
  snoozedUntil: Date or null,
  snoozeCount: Number,
  createdAt: Date,
  readAt: Date,
  archivedAt: Date
}
```

### UI Pages
- [ ] Notification preferences page
- [ ] Notification history page
- [ ] Weekly digest email template
- [ ] Mobile notification settings

---

## Additional Tasks for Phase 5

### Performance & Infrastructure (1 week)
1. **Database Optimization**
   - [ ] Create missing indexes
   - [ ] Query performance audit
   - [ ] Archive old data strategy
   - [ ] Backup automation

2. **Caching Strategy**
   - [ ] Expand Redis usage
   - [ ] Cache invalidation pattern
   - [ ] Client-side caching headers
   - [ ] Service Worker offline support

3. **API Rate Limiting**
   - [ ] Implement express-rate-limit
   - [ ] Per-user rate limits
   - [ ] Per-endpoint rate limits
   - [ ] Graceful degradation

### Testing & QA (1 week)
1. **Backend Tests**
   - [ ] Complete REST API tests (Jest)
   - [ ] Service layer unit tests
   - [ ] Integration test suite
   - [ ] Target: 85%+ coverage

2. **Frontend Tests**
   - [ ] Component unit tests
   - [ ] Integration tests
   - [ ] E2E tests (Cypress)
   - [ ] Target: 80%+ coverage

3. **Performance Tests**
   - [ ] Load testing (Artillery)
   - [ ] Lighthouse audit
   - [ ] Mobile performance
   - [ ] Network throttling tests

---

## Success Criteria for Phase 5

### Feature Completion
- ✅ 15+ new features shipped
- ✅ 95%+ specification coverage
- ✅ Zero critical bugs
- ✅ All gamification features working

### Code Quality
- ✅ 85% test coverage
- ✅ 0 TypeScript errors
- ✅ ESLint passing
- ✅ No performance regressions

### Performance
- ✅ Lighthouse score >90
- ✅ API response time <150ms
- ✅ Page load time <2s
- ✅ Bundle size <500KB (gzipped)

### User Experience
- ✅ Mobile responsive
- ✅ Dark mode fully working
- ✅ Accessibility WCAG AA
- ✅ Smooth animations (60fps)

### Security
- ✅ No critical vulnerabilities
- ✅ HTTPS everywhere
- ✅ CORS properly configured
- ✅ Input validation on all endpoints

---

## Resource Requirements

### Frontend Developer(s)
- Calendar & planning features (2 days)
- Habit system UI (3 days)
- Team features UI (2 days)
- Notifications UI (2 days)
- Testing & polish (2 days)

### Backend Developer(s)
- Calendar & planning API (2 days)
- Habit system API (2 days)
- Team collaboration API (2 days)
- Notifications service (2 days)
- Testing & optimization (2 days)

### DevOps/Infrastructure
- Database optimization
- Monitoring setup
- CI/CD pipeline
- Performance monitoring

---

## Next Steps

1. **Approve Phase 5 roadmap** ✓
2. **Assign developers** to specific features
3. **Set up sprint tracking** (Jira/GitHub project)
4. **Configure git workflows** (feature branches)
5. **Begin Week 17** implementation
6. **Weekly sync meetings** on progress
7. **Daily standup** for blockers
8. **Sprint reviews** every 2 weeks

---

**Phase 5 is designed to be achievable in 8 weeks with dedicated team.**  
**Document will be updated weekly with actual progress.**

---

Last Updated: April 11, 2026  
Ready for Implementation: YES ✅
