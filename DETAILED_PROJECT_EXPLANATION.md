# TaskMaster - Complete Project Explanation
## Detailed Technical & Business Overview

**Document Date:** April 13, 2026  
**Project Status:** Phase 5 - Production Ready  
**Version:** 2.0

---

# Table of Contents

1. [System Architecture](#system-architecture)
2. [Technology Stack](#technology-stack)
3. [Database Models](#database-models)
4. [API Endpoints](#api-endpoints)
5. [Frontend Components](#frontend-components)
6. [Features in Detail](#features-in-detail)
7. [How It Works](#how-it-works)
8. [Development Phases](#development-phases)
9. [Deployment](#deployment)
10. [Security Features](#security-features)

---

# System Architecture

## 3-Layer Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│           PRESENTATION LAYER (Frontend)                      │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ • React Components    • State Management (Zustand)       ││
│  │ • Service Workers     • IndexedDB (Local Storage)        ││
│  │ • Real-time Updates   • Offline Sync Queue              ││
│  └─────────────────────────────────────────────────────────┘│
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTPS / WebSocket
                       ▼
┌─────────────────────────────────────────────────────────────┐
│        API & COMMUNICATION LAYER (APIs)                      │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ • REST APIs (Express) • WebSocket (Real-time)           ││
│  │ • Request Validation  • Load Balancing                  ││
│  │ • Rate Limiting       • CORS Headers                    ││
│  └─────────────────────────────────────────────────────────┘│
└──────────────────────┬──────────────────────────────────────┘
                       │
┌─────────────────────────────────────────────────────────────┐
│      BUSINESS LOGIC LAYER (Backend)                          │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ • Controllers (Route Handling)                          ││
│  │ • Services (Core Logic)    • Middleware (Auth, Logging) ││
│  │ • Error Handling           • Data Transformation        ││
│  └─────────────────────────────────────────────────────────┘│
└──────────────────────┬──────────────────────────────────────┘
                       │
┌─────────────────────────────────────────────────────────────┐
│         DATA LAYER (Databases)                               │
│  ┌──────────────────┬──────────────────┬──────────────────┐ │
│  │ MongoDB          │ Redis            │ File Storage     │ │
│  │ Main Database    │ Cache & Sessions │ AWS S3 (Future)  │ │
│  └──────────────────┴──────────────────┴──────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow Example: Creating a Task

```
1. User enters task in UI
   ↓
2. Validation (TypeScript + Zod schemas)
   ↓
3. API Call: POST /api/tasks
   ↓
4. Backend receives request with JWT token
   ↓
5. Middleware authenticates user
   ↓
6. TaskController processes request
   ↓
7. TaskService implements business logic
   ↓
8. Database saves to MongoDB
   ↓
9. Redis cache updated
   ↓
10. Response sent back to frontend
   ↓
11. Zustand state updated
   ↓
12. UI re-renders instantly
   ↓
13. WebSocket broadcasts to other sessions
    (Real-time sync for team members)
```

---

# Technology Stack

## Frontend (What Users See)

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Framework** | Next.js 14 | Server-Side Rendering (SSR) + Static Generation (SSG) |
| **Language** | TypeScript | Type-safe code, catch errors before runtime |
| **Styling** | Tailwind CSS | Utility-first CSS framework, responsive design |
| **Animations** | Framer Motion | Smooth, professional UI animations |
| **Icons** | Lucide Icons | 400+ beautiful, consistent icons |
| **State Management** | Zustand | Lightweight global state (auth, user, tasks) |
| **Forms** | React Hook Form | Efficient form handling with minimal re-renders |
| **Validation** | Zod | Type-safe schema validation |
| **Data Fetching** | React Query | Caching, background sync, optimistic updates |
| **Charts** | Recharts | Analytics & statistics visualizations |
| **Testing** | Vitest + RTL | Unit tests for components and logic |
| **E2E Testing** | Cypress | Full app end-to-end testing |
| **Build** | Webpack | Module bundling and optimization |

## Backend (Server & Business Logic)

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Runtime** | Node.js | JavaScript server-side runtime |
| **Framework** | Express.js | HTTP server, routing, middleware |
| **Language** | TypeScript | Type-safe backend code |
| **Database** | MongoDB | NoSQL document-oriented database |
| **Cache** | Redis | In-memory data store, session management |
| **Authentication** | JWT | Secure token-based authentication |
| **Password Hashing** | bcrypt | One-way encryption for passwords |
| **Email** | Nodemailer + SendGrid | Send emails programmatically |
| **Testing** | Jest | Unit and integration tests |
| **Logging** | Winston + Morgan | Request logging and debugging |
| **Rate Limiting** | Express Rate Limit | Prevent API abuse |
| **Security** | Helmet | HTTP headers security |
| **Validation** | Express Validator | Input sanitization |

## DevOps & Infrastructure

| Tool | Usage | Purpose |
|------|-------|---------|
| **Docker** | Containerization | Consistent development & production environments |
| **Docker Compose** | Orchestration | Local multi-container setup |
| **GitHub Actions** | CI/CD Pipeline | Automated testing and deployment |
| **Vercel** | Frontend Hosting | Next.js optimization, CDN, Edge Functions |
| **Heroku/Railway** | Backend Hosting | Node.js application server |
| **MongoDB Atlas** | Managed Database | Cloud MongoDB with automatic backups |
| **Redis Cloud** | Managed Cache | Cloud Redis instance |
| **GitHub** | Version Control | Code repository and collaboration |

---

# Database Models

## User Model

```json
{
  "_id": "ObjectId",
  "email": "user@example.com",
  "password": "$2b$10$...", (hashed with bcrypt)
  "name": "John Doe",
  "avatar": "https://...",
  
  "gamification": {
    "level": 25,
    "totalXP": 24500,
    "streak": 15,
    "maxStreak": 42,
    "lastTaskCompletedDate": "2026-04-13"
  },
  
  "settings": {
    "theme": "dark",
    "timezone": "America/New_York",
    "language": "en",
    "notifications": {
      "email": true,
      "push": true,
      "sound": true
    },
    "quietHours": {
      "enabled": true,
      "start": "22:00",
      "end": "08:00"
    }
  },
  
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2026-04-13T14:20:00Z"
}
```

## Task Model

```json
{
  "_id": "ObjectId",
  "userId": "ObjectId (User reference)",
  
  "title": "Complete project proposal",
  "description": "Finish and submit...",
  "category": "work",
  "tags": ["urgent", "client"],
  
  "priority": "Critical",
  "status": "in-progress",
  
  "dueDate": "2026-04-15",
  "dueTime": "17:00",
  "startDate": "2026-04-13",
  "completedAt": null,
  
  "xp": 1000,
  "completed": false,
  
  "recurrence": {
    "pattern": "weekly",
    "interval": 1,
    "endDate": null
  },
  
  "attachments": [
    {
      "url": "https://...",
      "filename": "proposal.pdf",
      "size": 2048000
    }
  ],
  
  "comments": [
    {
      "userId": "ObjectId",
      "text": "Looks good!",
      "createdAt": "2026-04-13T12:00:00Z"
    }
  ],
  
  "teamId": null,
  "assignedTo": null,
  
  "createdAt": "2026-04-01T09:00:00Z",
  "updatedAt": "2026-04-13T14:15:00Z"
}
```

## Team Model

```json
{
  "_id": "ObjectId",
  "name": "Project XYZ Team",
  "description": "Building the new feature",
  "ownerId": "ObjectId (User reference)",
  
  "members": [
    {
      "userId": "ObjectId",
      "role": "owner",
      "joinedAt": "2026-03-01T10:00:00Z"
    },
    {
      "userId": "ObjectId",
      "role": "admin",
      "joinedAt": "2026-03-05T14:30:00Z"
    },
    {
      "userId": "ObjectId",
      "role": "member",
      "joinedAt": "2026-03-15T08:00:00Z"
    }
  ],
  
  "tasks": ["ObjectId", "ObjectId"],
  
  "invitations": [
    {
      "email": "newmember@example.com",
      "role": "member",
      "status": "pending"
    }
  ],
  
  "createdAt": "2026-03-01T10:00:00Z",
  "updatedAt": "2026-04-13T10:00:00Z"
}
```

## Achievement Model

```json
{
  "_id": "ObjectId",
  "userId": "ObjectId (User reference)",
  
  "type": "level_25",
  "title": "Level 25 Achieved!",
  "description": "Reached level 25 in task completion",
  "icon": "⭐",
  "rarity": "epic",
  
  "progress": 100,
  "unlocked": true,
  "unlockedAt": "2026-04-13T12:30:00Z",
  
  "createdAt": "2026-04-01T00:00:00Z"
}
```

## Notification Model

```json
{
  "_id": "ObjectId",
  "userId": "ObjectId (User reference)",
  
  "type": "reminder",
  "title": "Task Due Today",
  "message": "Complete project proposal due at 5 PM",
  "icon": "🔔",
  
  "read": false,
  "actionUrl": "/tasks/abc123",
  "scheduledFor": "2026-04-15T16:30:00Z",
  
  "createdAt": "2026-04-13T14:00:00Z"
}
```

---

# API Endpoints Reference

## Authentication Endpoints

```
POST   /api/auth/register
       Body: { email, password, name }
       Returns: { token, user }

POST   /api/auth/login
       Body: { email, password }
       Returns: { token, user }

POST   /api/auth/logout
       Headers: { Authorization: "Bearer <token>" }
       Returns: { message: "Logged out successfully" }

POST   /api/auth/refresh
       Headers: { Authorization: "Bearer <token>" }
       Returns: { token }

GET    /api/auth/profile
       Headers: { Authorization: "Bearer <token>" }
       Returns: { user }

POST   /api/auth/reset-password
       Body: { email }
       Returns: { message: "Reset email sent" }
```

## Task Endpoints

```
POST   /api/tasks
       Create new task
       Body: { title, description, category, priority, dueDate, tags }
       Returns: { task }

GET    /api/tasks?status=todo&priority=High&category=work
       List tasks with filters
       Headers: { Authorization: "Bearer <token>" }
       Returns: { tasks: [], total }

GET    /api/tasks/:id
       Get specific task
       Returns: { task }

PUT    /api/tasks/:id
       Update task
       Body: { title, status, priority, ... }
       Returns: { task }

DELETE /api/tasks/:id
       Delete/archive task
       Returns: { message: "Task deleted" }

PATCH  /api/tasks/:id/complete
       Mark task as done
       Returns: { task, xpEarned, newLevel, streak }

PATCH  /api/tasks/:id/archive
       Archive task
       Returns: { task }

POST   /api/tasks/bulk/update
       Update multiple tasks
       Body: { taskIds: [], updates: {} }
       Returns: { tasks }
```

## Analytics Endpoints

```
GET    /api/analytics/summary?period=week
       Daily/weekly/monthly stats
       Returns: { 
         tasksCompleted: 45,
         completionRate: 89%,
         xpEarned: 2500,
         weeklyAverage: 6.4
       }

GET    /api/analytics/completion?period=30days
       Completion rate over time
       Returns: { data: [{ date, completed, total, rate }] }

GET    /api/analytics/categories
       Performance by category
       Returns: { 
         data: [{ category, count, completionRate, xp }]
       }

GET    /api/analytics/productivity
       AI-powered insights
       Returns: {
         insights: [
           "Most productive on Tuesday mornings",
           "Average task takes 45 mins"
         ],
         recommendations: [...]
       }
```

## Team Endpoints

```
POST   /api/teams
       Create team
       Body: { name, description }
       Returns: { team }

GET    /api/teams
       List user's teams
       Returns: { teams: [] }

GET    /api/teams/:id
       Get team details
       Returns: { team, members, tasks }

POST   /api/teams/:id/invite
       Invite member
       Body: { email, role }
       Returns: { invitation }

PATCH  /api/teams/:id/members/:uid
       Update member role
       Body: { role: "admin" | "member" }
       Returns: { member }

DELETE /api/teams/:id/members/:uid
       Remove member
       Returns: { message: "Member removed" }

GET    /api/teams/:id/invitations
       List pending invitations
       Returns: { invitations: [] }

POST   /api/teams/:id/invitations/:iid/accept
       Accept invitation
       Returns: { message: "Joined team" }
```

## Gamification Endpoints

```
GET    /api/leaderboard?limit=10
       Global XP leaderboard
       Returns: {
         users: [
           { rank: 1, name, totalXP, level, avatar }
         ]
       }

GET    /api/achievements
       User's achievements
       Returns: { achievements: [] }

GET    /api/badges
       Get all badge types
       Returns: { badges: [] }

GET    /api/stats/streaks
       Leaderboard by streak
       Returns: { users: [] }
```

## AI & Voice Endpoints

```
POST   /api/ai/suggestions
       Get AI task suggestions
       Returns: {
         suggestions: [
           { title, description, priority, category }
         ]
       }

POST   /api/ai/parse
       Parse natural language to task
       Body: { text: "Add meeting tomorrow at 2pm" }
       Returns: {
         task: {
           title: "Meeting",
           dueDate: "2026-04-14",
           dueTime: "14:00"
         }
       }

POST   /api/voice/transcribe
       Convert voice to text
       Body: { audio: <Blob> }
       Returns: { text: "Add shopping to my list" }
```

---

# Frontend Components

## Page Structure

```
frontend/app/
│
├── (auth)/                      # Authentication pages
│   ├── login/
│   │   └── page.tsx            # Login form
│   ├── register/
│   │   └── page.tsx            # Signup form
│   └── reset-password/
│       └── page.tsx            # Password reset
│
├── (app)/                       # Protected routes (require login)
│   ├── layout.tsx              # App layout with sidebar
│   ├── dashboard/
│   │   └── page.tsx            # Main dashboard/home
│   │
│   ├── tasks/
│   │   ├── page.tsx            # All tasks view
│   │   ├── today/
│   │   │   └── page.tsx        # Today's tasks
│   │   ├── [id]/
│   │   │   └── page.tsx        # Task detail page
│   │   └── layout.tsx          # Tasks layout
│   │
│   ├── calendar/
│   │   └── page.tsx            # Calendar view
│   │
│   ├── analytics/
│   │   └── page.tsx            # Stats & charts
│   │
│   ├── teams/
│   │   ├── page.tsx            # Teams list
│   │   ├── [id]/
│   │   │   └── page.tsx        # Team detail
│   │   └── invitations/
│   │       └── page.tsx        # Pending invites
│   │
│   ├── habits/
│   │   └── page.tsx            # Habit tracking
│   │
│   └── settings/
│       └── page.tsx            # User settings
│
└── api/                         # Optional API routes
    └── auth/
        └── [...nextauth]/
            └── route.ts        # OAuth callbacks
```

## Key Components

### Task Components
- **TaskCard.tsx** - Individual task display (title, priority, due date, status badge)
- **TaskForm.tsx** - Modal form for creating/editing tasks with validation
- **TaskList.tsx** - Filterable, sortable list of tasks
- **TaskDetail.tsx** - Full task view with comments, attachments, history
- **TaskFilter.tsx** - Advanced filters (priority, category, status, date range)

### Dashboard Components
- **ProgressCard.tsx** - Shows "X/Y tasks done today (60%)" with visual progress bar
- **StreakCard.tsx** - Displays flame emoji + current streak counter
- **StatsPanels.tsx** - Weekly/monthly statistics with trends
- **RecommendedTasks.tsx** - AI-suggested tasks to prioritize
- **RecentActivity.tsx** - Activity log of completed tasks

### Calendar Components
- **Calendar.tsx** - React Big Calendar with month/week/day views
- **DatePicker.tsx** - Date selection with quick options (Today, Tomorrow, Next Week)
- **WeekView.tsx** - Week overview with task distribution

### Analytics Components
- **CompletionChart.tsx** - Line chart showing completion rate over time
- **CategoryChart.tsx** - Pie chart of task distribution by category
- **PriorityChart.tsx** - Bar chart of tasks by priority level
- **HeatMap.tsx** - GitHub-style activity heat map
- **InsightPanel.tsx** - AI-generated insights and recommendations

### Team Components
- **TeamCard.tsx** - Team preview with member count
- **TeamMemberList.tsx** - Members with roles and edit options
- **InviteForm.tsx** - Modal to invite new team members
- **InvitationCard.tsx** - Accept/decline pending team invites

### Gamification Components
- **LevelBadge.tsx** - Current level display with progress
- **AchievementBadge.tsx** - Individual achievement/badge display
- **Leaderboard.tsx** - Top 10 users ranked by total XP
- **XPBar.tsx** - Progress bar to next level
- **StreakBanner.tsx** - Animated streak milestone display

---

# Features in Detail

## 1. Task Management System

### Creating a Task (3 Methods)

**Method 1: Quick Add**
```
Enter text: "Buy groceries"
Press Enter → Task created instantly
Default: Today, Low priority, Personal category
```

**Method 2: Full Form**
```
Modal opens with all fields:
- Title & Description
- Category (Work, Personal, Health, etc.)
- Priority (Critical, High, Medium, Low)
- Tags (unlimited custom tags)
- Due date & time
- Recurrence pattern
- Attachments
```

**Method 3: Voice Input**
```
Click microphone icon
Speak: "Add meeting with client tomorrow at 2pm"
System parses with AI → Creates task
Title: "Meeting with client"
Due: Tomorrow at 14:00
```

### Task Attributes

| Attribute | Options | Purpose |
|-----------|---------|---------|
| **Priority** | Critical, High, Medium, Low | Affects XP earned (4x, 3x, 2x, 1x) |
| **Category** | 8 predefined + custom | Organization & analytics |
| **Status** | Todo, In-Progress, Done, Archived | Task lifecycle tracking |
| **Tags** | Unlimited custom | Additional categorization |
| **Due Date** | Any date + time | Time management |
| **Recurrence** | Daily, Weekly, Monthly, Custom | Habit integration |

### Task Lifecycle

```
┌──────────┐     ┌──────────────┐     ┌──────┐     ┌──────────┐
│   Todo   │────▶│  In-Progress │────▶│ Done │────▶│ Archived │
└──────────┘     └──────────────┘     └──────┘     └──────────┘
      ↑                                    │
      └────────────────────────────────────┘
                    (Can undo)
```

## 2. Gamification System

### XP & Leveling Mechanics

```
XP Calculation Formula:
XP_earned = Base_XP × Priority_Multiplier × Bonuses

Base_XP based on complexity:
- Simple task = 100 XP
- Medium task = 500 XP  
- Complex task = 1000 XP

Priority Multiplier:
- Critical = 4x multiplier
- High = 3x multiplier
- Medium = 2x multiplier
- Low = 1x multiplier

Bonuses:
- First task of day = +10%
- On streak = +50% (30+ day streaks)
- Team collaboration = +25%
- Speed bonus (complete in 1 hour) = +50%

Example:
Task = Complex (1000 XP base)
Priority = Critical (4x)
Streak bonus = +50%
Total = 1000 × 4 × 1.5 = 6000 XP 🎉
```

### Leveling System

```
Level = floor(Total_XP / 1000) + 1

Level 1:  0 - 999 XP         (0-999 XP needed)
Level 2:  1000 - 1999 XP     (1000 more XP)
Level 5:  4000 - 4999 XP
Level 10: 9000 - 9999 XP
Level 25: 24000 - 24999 XP
Level 50: 49000+ XP

Progress to next level visible in:
- Dashboard XP bar
- Profile card
- Level badge on tasks
```

### Streak Tracking

```
Streak Definition:
Consecutive days with at least 1 completed task

Milestones:
 7 days  → Bronze Streak Badge 🥉
14 days  → Silver Streak Badge 🥈
30 days  → Gold Streak Badge 🥇 (+50% XP bonus!)
100 days → Legendary Streak Badge 👑

Streak Resets:
- Misses a day (no tasks completed)
- Can reclaim within 24 hours if offline
- Max streak tracked separately

Display:
Dashboard: "23 day streak 🔥"
Leaderboard: Sorted by current streak
Achievements: Streak milestones
```

### Achievements (9 Badge Types)

| Achievement | Requirement | Reward |
|-------------|-------------|--------|
| **First Task** | Complete 1 task | 50 XP bonus |
| **Week Warrior** | 7-day streak | 200 XP bonus |
| **Level 10** | Reach level 10 | 500 XP bonus |
| **Level 25** | Reach level 25 | 1000 XP bonus |
| **Level 50** | Reach level 50 | 2000 XP bonus |
| **Perfect Week** | All tasks done for 7 days | 300 XP + badge |
| **Task Master** | 100 tasks completed | 1000 XP + badge |
| **Category Expert** | 30 tasks in one category | 200 XP + badge |
| **Speed Runner** | 5 tasks in 1 hour | 150 XP + badge |

### Leaderboard

```
Global Rankings (Sorted by Total XP):

Rank  Name           Level  XP       Streak
──────────────────────────────────────────
  1   Alice          50    49,500   45 days 🔥
  2   Bob            42    41,800   28 days
  3   Charlie        38    37,200   12 days
  4   Diana          35    34,500    0 days
  5   Edward         32    31,900    7 days

User sees their ranking and can compete
```

## 3. Analytics & Insights

### Dashboard Metrics

```
Today's Progress:
"12 tasks completed out of 20 (60%)"
Progress bar with animated update

Weekly Stats:
"45 tasks done this week, +15% vs last week"
"2,500 XP earned"
"Current streak: 23 days 🔥"

Next Milestone:
"7,200 XP to level 28"
Progress bar with percentage
```

### Analytics Page Charts

**Line Chart - Completion Rate**
```
Y-axis: % Completion (0-100%)
X-axis: Days (last 30 days)
Shows: Daily completion trend
```

**Pie Chart - Category Distribution**
```
Slices: Work (35%), Personal (30%), Health (25%), Other (10%)
Click to filter tasks by category
```

**Bar Chart - Priority Breakdown**
```
Bars: Completed vs Pending per priority
Shows: Which priorities have the most tasks
```

**Heat Map - Activity Calendar**
```
GitHub-style visualization:
- Light green: 1-5 tasks
- Medium green: 6-10 tasks
- Dark green: 11+ tasks
- Gray: No tasks
Hover for details
```

### AI Insights Examples

```
"You're most productive on Tuesday mornings 
 (08:00-11:00) with 92% completion rate."

"Your average task takes 45 minutes to complete.
 Projects take 3x longer."

"You complete 92% of High-priority tasks 
 but only 65% of Low-priority ones."

"Consider breaking down 'Project X' into 
 smaller subtasks for better completion."

"You've been consistent! Keep the streak going 🔥"

"Tuesday is your best day. Schedule important 
 tasks then for highest chance of completion."
```

## 4. Team Collaboration

### Team Features

**Create Team**
```
Owner specifies:
- Team name: "Project XYZ"
- Description: "Building new feature"
- Privacy: Public/Private

Owner automatically gets Owner role
```

**Invite Members**
```
Send email invite to: colleague@company.com
Specify role: Member, Admin, or Owner
Invite link expires in 7 days
Notification sent to invitee
```

**Roles & Permissions**

| Role | Permissions |
|------|-------------|
| **Owner** | Full control, invite/remove members, delete team |
| **Admin** | Invite members, update team info, assign tasks |
| **Member** | View team tasks, update task status, comment, track time |

**Shared Tasks**
```
Task created by Alice in team
Alice assigns to Bob
Bob gets notification: "Task assigned: Design mockups"
Both see real-time updates as task progresses
Task XP shared between team members (split)
```

### Team Workflow Example

```
Timeline: Team Collaboration

Monday 9:00 AM
└─ Alice creates "Project X" team

Monday 9:30 AM
└─ Alice invites: bob@work.com, carol@work.com
   Both receive email with invitation link

Monday 10:00 AM
└─ Bob clicks link → Joins team
   Notification: "Bob joined Project X"

Monday 10:15 AM
└─ Carol clicks link → Joins team
   Notification: "Carol joined Project X"

Monday 10:30 AM
└─ Alice creates task: "Design mockups"
   Assigns to: Carol
   Carol gets notification with task details

Tuesday 2:00 PM
└─ Carol completes task
   Task marked done
   XP split: Carol +300, Alice +300 (owner bonus)
   Activity log: "Carol completed Design mockups"

Thursday 11:00 AM
└─ Team has completed 10 tasks this week
   Team achievements unlocked
   Email: "Great work team! 100 tasks completed!"
```

## 5. Real-time Features

### WebSocket Events

```
Events sent instantly when:
- Task created → All team members notified
- Task updated → Real-time status change
- Task completed → Streak check, XP calculation
- Team member joined → Notification
- Comment added → Instant display
- Achievement unlocked → Celebration animation
- Streak milestone → Announcement
```

### Offline Support (Service Workers)

```
When offline:
1. Request intercepted by Service Worker
2. Data stored in IndexedDB (local database)
3. Request queued in memory

When back online:
1. Service Worker detects connection
2. Replays queued requests to server
3. Server confirms each action
4. Deletes from queue when confirmed
5. User sees: "Synced! 3 changes uploaded"

Example: Create task while on flight
1. User creates task (appears locally)
2. Service Worker stores in IndexedDB
3. Plane lands, WiFi connects
4. Task automatically synced to server
5. Other devices see task instantly
```

## 6. Notifications

### Notification Types

| Type | Trigger | Channel |
|------|---------|---------|
| **Reminder** | Task due in 30 min | In-app, Browser, Email |
| **Achievement** | Earn badge | In-app, Toast, Email |
| **Team Invite** | Team owner invites | Email, In-app |
| **Task Assigned** | Assigned by team member | In-app, Browser |
| **Comment** | Comment on your task | In-app, Email |
| **Streak Milestone** | 7/14/30 day streak | In-app, Toast |
| **Deadline** | Task due tomorrow | Email, Browser |

### User Notification Preferences

```
Settings → Notifications

Email Notifications:   ☑ Enabled
  └─ Reminders         ☑
  └─ Achievements      ☑
  └─ Team Invites      ☑

Browser Notifications: ☑ Enabled
  └─ Sound             ☑
  └─ Desktop Toast     ☑

Quiet Hours:          ☑ Enabled
  └─ Start: 22:00
  └─ End: 08:00
     (No notifications during these hours)

Do Not Disturb:       ☐ Disabled
```

---

# How It Works - Complete User Journey

## Sarah's Typical Day

### 8:00 AM - Morning Check-In

```
Sarah opens the app on her phone.

System does:
1. Checks JWT token (valid until 11 PM)
2. Fetches today's tasks from MongoDB
3. Checks Redis cache (instant load)
4. Syncs any offline changes (Service Worker)
5. Loads Zustand state
6. Renders Dashboard

Sarah sees:
├─ Welcome: "Good morning, Sarah! 🌅"
├─ Progress: "12 out of 20 tasks done (60%)"
├─ Streak: "23 days 🔥"
├─ Today's XP: "2,100 XP earned"
├─ Level progress: "7,200 XP to level 28"
├─ Recommended: "AI suggests 'Review proposal' (High priority)"
└─ Recent: "Yesterday completed 18 tasks"
```

### 8:15 AM - Voice Input

```
Sarah clicks microphone icon in TaskCard.

She speaks: "Add call with client at 10am"

Behind the scenes:
1. VoiceRecorder.tsx captures audio
2. Audio sent to POST /api/voice/transcribe
3. Server converts to text: "Add call with client at 10am"
4. Text sent to POST /api/ai/parse
5. AI extracts:
   - title: "Call with client"
   - dueTime: "10:00"
   - category: "work"
   - priority: "High"
6. Returns to frontend
7. TaskForm pre-fills fields
8. Sarah confirms → Task created
9. Zustand state updated
10. UI re-renders
11. WebSocket broadcasts (team sees it)

Sarah sees: Task appears in list instantly ✨
```

### 9:30 AM - Complete a Task

```
Sarah clicks "Done" on "Review proposal"

Frontend:
1. Validation checks (TypeScript)
2. API call: PATCH /api/tasks/abc123/complete

Backend:
1. Authenticates with JWT
2. Fetches task from MongoDB
3. Calculates XP:
   - Base: 500 (medium complexity)
   - Priority: High (3x) = 1500
   - Bonus: Streak (50%) = 2250
4. Updates user level/XP/streak
5. Checks achievements (any unlocked?)
6. Sends response
7. WebSocket event broadcast

Frontend:
1. Receives: { xp: 2250, newLevel: 26, streak: 24 }
2. Updates Zustand state
3. Shows toast: "Task complete! +2250 XP 🎉"
4. Confetti animation plays
5. UI updates:
   - Level changes: 25 → 26
   - Progress bar resets
   - Streak increments: 23 → 24
6. If achievement: "Level 26 Achieved!" banner

Sarah sees: Beautiful celebration animation with XP pop ✨
```

### 10:15 AM - Team Collaboration

```
Sarah checks "Teams" tab.

She sees 1 pending invitation from "ProjectXYZ Team"

She clicks "Accept"

Frontend:
1. API call: POST /api/teams/:id/invitations/:iid/accept

Backend:
1. Validates invitation (not expired, correct email)
2. Adds Sarah to team members list
3. Sends email: "Sarah joined ProjectXYZ Team"
4. Creates activity log entry
5. Broadcasts WebSocket event

Sarah:
1. Now sees team shared tasks
2. Assigned task: "Code review" by Alice
3. Notification toast: "New task: Code review"
4. Clicks to view
5. Sees Alice's comments: "Please check for bugs"
6. Completes task, comments: "Found 2 issues, documented"

Team sees: Activity "Sarah completed Code review + comment"
```

### 2:00 PM - Reminder Notification

```
Time: 14:30 (30 mins before meeting at 15:00)

System triggers:
1. Cron job checks reminders
2. Finds tasks due in 30 mins
3. Sends to notification queue

Sarah sees pop-up:
┌────────────────────────┐
│ 🔔 Meeting in 30 mins  │
│ Call with client       │
│ [Snooze 15min] [Done]  │
└────────────────────────┘

Sarah clicks [Snooze 15min]

System:
1. Calculates new reminder time: 14:45
2. Updates task in MongoDB
3. Reschedules notification
4. Toast: "We'll remind you at 2:45 PM"
```

### 4:30 PM - Analytics Check

```
Sarah taps "Analytics" tab

Dashboard loads with charts:

1. Completion Chart (last 30 days)
   - Line shows: 85% → 92% → 89% → 95%
   - Trend: Improving

2. Category Pie Chart
   - Work (40%), Personal (35%), Health (25%)

3. Priority Bar Chart
   - Completed: Critical (95%), High (90%), Medium (85%), Low (60%)

4. Activity Heat Map
   - Last 7 days highlighted
   - Tuesday darkest (most tasks)
   - Sunday lightest (no tasks)

5. AI Insights Panel
   "📊 Your Insights:
   • Most productive: Tuesday 10-11am (94% completion)
   • Avg task time: 45 minutes
   • 92% of High-priority tasks completed
   • Best streak ever: 45 days (keep going! 🔥)
   • Recommendation: Schedule important tasks on Tuesdays"

Sarah can export as JSON or PDF
```

### 6:00 PM - Complete Last Task

```
Sarah finishes final task of the day: "Plan tomorrow"

She marks complete:
✓ Task done
✓ +1,500 XP
✓ Streak: 24 → 25
✓ Check: All 20 tasks completed today? YES!

System unlocks achievement:
🎉 ACHIEVEMENT UNLOCKED: Perfect Day
   Completed all tasks (20/20)
   +500 XP bonus
   +100 streak points

Sarah sees:
- Celebration animation
- Confetti falling
- Achievement badge displayed
- XP notification: "+2,000 total today"
- Email to team: "Sarah had a perfect day! 🎯"
- Leaderboard rank updates

Sarah feels accomplished! 🏆
```

### 9:00 PM - Sync & Sleep

```
Sarah exits the app to sleep.

Frontend:
1. All Zustand state saved
2. Service Worker active
3. IndexedDB ready for offline
4. Local cache of all data

Backend:
1. All changes persisted to MongoDB
2. Redis cache updated
3. Analytics calculated
4. Activity log created
5. Notifications queued for tomorrow

Morning: App will resume with latest data! ✨
```

---

# Development Phases

## Phase 1: MVP Core Functionality ✅ COMPLETE

**Timeline:** Weeks 1-4  
**Goals:** Get a working to-do app

### Week 1: Foundation
- Project setup (Next.js, Express, MongoDB)
- Authentication (register, login, JWT)
- User model and schema
- Basic styling with Tailwind

### Week 2: Core Tasks
- Task CRUD endpoints (Create, Read, Update, Delete)
- Task model with all properties
- Task list view on frontend
- Due date picker

### Week 3: Organization
- Task categories (8 predefined)
- Priority system (4 levels)
- Tagging system
- Today's view

### Week 4: UX Polish
- Dashboard with stats
- Calendar view (basic)
- Search functionality
- Responsive mobile design

**Deliverable:** Basic working to-do app ✅

---

## Phase 2: Gamification ✅ COMPLETE

**Timeline:** Weeks 5-8  
**Goals:** Make it fun and engaging

### Week 5: XP & Leveling
- XP calculation system
- Level progression (1-50+)
- User model updates
- XP display on tasks

### Week 6: Achievements
- Design 9 achievement types
- Achievement model
- Badge unlocking logic
- Achievement display components

### Week 7: Streaks
- Streak tracking algorithm
- Streak milestones (7/14/30 days)
- Streak reset logic
- Friendly fire (can recover streak)

### Week 8: Analytics
- Analytics model
- Dashboard metrics calculation
- Recharts integration
- Export reports

**Deliverable:** Gamified task tracker 🎮

---

## Phase 3: Advanced Features ✅ COMPLETE

**Timeline:** Weeks 9-12  
**Goals:** Collaboration and intelligence

### Week 9: Teams
- Team model & schema
- Team creation flow
- Member invitations
- Email notifications

### Week 10: AI & Voice
- Voice recording component
- Speech-to-text integration
- NLP parsing (GPT-4)
- Task suggestions

### Week 11: Real-time
- WebSocket setup (Socket.io)
- Real-time task updates
- Presence (who's online)
- Activity broadcasting

### Week 12: Habits
- Habit model
- Habit-task linking
- Calendar visualization
- Habit streaks

**Deliverable:** Full collaboration platform ✨

---

## Phase 4: Launch & Polish ✅ COMPLETE

**Timeline:** Weeks 13-16  
**Goals:** Production ready

### Week 13: Testing
- Unit tests (Jest)
- Component tests (React Testing Library)
- Integration tests
- Coverage > 80%

### Week 14: Security
- Security audit
- Rate limiting
- CORS configuration
- Input validation

### Week 15: Performance
- Lighthouse optimization
- Bundle size reduction
- Database query optimization
- CDN setup

### Week 16: Deployment
- Docker containers
- GitHub Actions CI/CD
- Production deployment
- Monitoring setup

**Deliverable:** Production application 🚀

---

## Phase 5: Enhancement (Ongoing)

**Goals:** Continuous improvement

### Coming Soon:
- Bulk task editing
- Habit UI integration
- Advanced notifications
- Email reminders
- Timezone support
- Mobile app (React Native)
- SMS notifications
- Advanced collaboration
- Custom workflows

---

# Deployment

## Local Development Setup

### Quick Start (Recommended: Docker)

```bash
# Clone repository
git clone https://github.com/yourname/task-manager.git
cd task-manager

# Setup environment
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
# Edit .env files with your settings

# Start with Docker
docker-compose up -d

# Access:
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
# MongoDB: mongodb://localhost:27017
# Redis: localhost:6379
```

### Manual Local Setup

```bash
# Terminal 1: Backend
cd backend
npm install
npm run dev
# Runs on: http://localhost:5000

# Terminal 2: Frontend
cd frontend
npm install
npm run dev
# Runs on: http://localhost:3000

# Terminal 3: Database (if local)
mongod --dbpath ./data

# Terminal 4: Cache (if local)
redis-server
```

## Production Deployment

### Architecture Overview

```
GitHub Repository
         │
         ▼
   GitHub Actions (CI/CD)
         │
     ┌───┴───┐
     ▼       ▼
  Frontend  Backend
  Vercel    Railway/Heroku
     │       │
     ├───────┤
     ▼       ▼
   CDN    Load Balancer
     │       │
Users ◄──────┤
             ▼
         Databases
      ├─ MongoDB Atlas
      └─ Redis Cloud
```

### Frontend Deployment (Vercel)

```
1. Push to GitHub
2. Vercel auto-detects Next.js
3. Build: npm run build
4. Deploy to edge servers
5. CDN caches static files
6. Auto HTTPS, custom domain
```

**Environment Variables:**
```
NEXT_PUBLIC_API_URL=https://api.taskmaster.com
NEXT_PUBLIC_APP_NAME=TaskMaster
```

### Backend Deployment (Railway/Heroku)

```
1. Connect GitHub repository
2. Auto-detect Node.js
3. Build: npm install
4. Start: npm start
5. Deploy to container
6. Auto-scaling enabled
7. Health checks configured
```

**Environment Variables:**
```
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/taskmanager
JWT_SECRET=<strong-random-key>
REDIS_URL=redis://user:pass@redis.provider.com:6379
SENDGRID_API_KEY=SG.xxxxx
SENDGRID_FROM_EMAIL=noreply@taskmaster.com
```

### Database Deployment

**MongoDB Atlas (Cloud)**
```
1. Create cluster
2. Add user credentials
3. Whitelist IP addresses
4. Get connection string
5. Configure automatic backups
6. Enable monitoring
```

**Redis Cloud (Managed)**
```
1. Create database (2GB)
2. Get connection string
3. Configure connection pooling
4. Enable SSL/TLS
5. Set up alerts
```

---

# Security Features

## Authentication & Authorization

```
✅ JWT Tokens
   - Issued on login
   - Expires after 15 minutes
   - Refresh token for renewal
   - Stored in httpOnly cookie (secure)

✅ Password Hashing
   - bcrypt with 10 salt rounds
   - Salted hash: impossible to reverse
   - Compare on login

✅ Authorization Checks
   - User can only see own tasks
   - Team member roles enforced
   - Admin actions verified
   - API token validation on every request

✅ Rate Limiting
   - 100 requests per IP per 15 minutes
   - Prevents brute-force attacks
   - Protects against DDoS
```

## Data Protection

```
✅ HTTPS/TLS 1.3
   - All data encrypted in transit
   - Certificates auto-renewed

✅ Input Validation
   - TypeScript types on frontend
   - Zod schemas on backend
   - SQL injection impossible (no SQL!)
   - XSS protection (React escaping)

✅ CORS
   - Whitelist allowed origins
   - Only trusted domains can access API
   - Prevents cross-site requests

✅ Database Security
   - MongoDB authentication required
   - Credentials in environment variables
   - Connection pooling
   - Automated backups every 6 hours
```

## Monitoring & Logging

```
✅ Request Logging
   - All API requests logged
   - Response times tracked
   - Error causes recorded

✅ Error Handling
   - Never expose internal errors to client
   - Log detailed errors server-side
   - User-friendly error messages

✅ Activity Logging
   - All task changes tracked
   - Team actions logged
   - User authentication events recorded
   - Audit trail available

✅ Alerts
   - Failed login attempts
   - Unusual activity detected
   - Database errors
   - High response times
```

---

## Summary

**TaskMaster** is a production-ready, full-stack task management application built with modern technologies for optimal performance and user experience. 

With features spanning core task management, gamification, real-time collaboration, AI insights, and comprehensive analytics, it provides users with a powerful yet intuitive platform to manage their productivity.

The architecture is scalable, secure, and designed to support thousands of concurrent users, making it suitable for both personal use and enterprise deployment.

---

**Document Prepared:** April 13, 2026  
**Project Status:** Phase 5 - Production Ready  
**Next Review:** May 13, 2026
