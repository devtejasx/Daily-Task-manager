# System Architecture & Design

## 🏗️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER (Browser)                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  Next.js React App (SSR + SPA)                                   │  │
│  │  - Pages & Components                                            │  │
│  │  - Zustand State Management                                      │  │
│  │  - Framer Motion Animations                                      │  │
│  │  - Local Storage / IndexedDB (Offline)                           │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┬─
                                  ▼
                        ┌─────────────────────┐
                        │  WebSocket / HTTP   │
                        │   (Socket.io/Axios) │
                        └────────────┬────────┘
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        API GATEWAY LAYER                                │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  Express.js Server                                               │  │
│  │  - CORS Middleware                                               │  │
│  │  - Authentication (JWT)                                          │  │
│  │  - Request Validation                                            │  │
│  │  - Error Handling                                                │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┬─
                ┌─────────────────────┬─────────────────────┐
                ▼                     ▼                     ▼
    ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
    │   Auth Routes    │ │   Task Routes    │ │  Other Routes    │
    └────────┬─────────┘ └────────┬─────────┘ └────────┬─────────┘
             ▼                    ▼                    ▼
┌──────────────────────────────────────────────────────────────────┐
│                    SERVICE LAYER                                 │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────────┐ │
│  │ AuthService  │ │ TaskService  │ │ AchievementService, etc  │ │
│  └──────────────┘ └──────────────┘ └──────────────────────────┘ │
└────────────────────────────────────────────────────────────────┬─
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│                    DATA ACCESS LAYER                             │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────────┐ │
│  │ Mongoose ORM │ │ User Model   │ │ Task Model, etc          │ │
│  └──────────────┘ └──────────────┘ └──────────────────────────┘ │
└────────┬────────────────────────────────────────────────────────┘
         │
    ┌────┴─────────────────────────────┬────────┐
    ▼                                  ▼        ▼
┌─────────────────────┐     ┌─────────────────────┐  ┌──────────────┐
│   MongoDB Atlas     │     │  Redis Cloud        │  │  AWS S3      │
│   (Main Database)   │     │  (Cache & Realtime) │  │  (File Store)│
└─────────────────────┘     └─────────────────────┘  └──────────────┘
```

---

## 📦 Technology Stack

### Frontend
```
Next.js 14
├── React 18
├── TypeScript
├── Tailwind CSS
├── Framer Motion
├── Zustand (State)
├── React Query (Data Fetching)
├── React Hook Form (Forms)
├── Recharts (Charts)
├── Socket.io (Real-time)
└── Lucide Icons (Icons)
```

### Backend
```
Express.js
├── Node.js Runtime
├── TypeScript
├── Mongoose (MongoDB ORM)
├── JWT (Authentication)
├── bcryptjs (Password Hashing)
├── Socket.io (WebSockets)
├── Multer (File Upload)
├── Bull (Job Queue)
└── Redis (Caching)
```

### Database
```
MongoDB (Main)
├── Collections
│   ├── Users
│   ├── Tasks
│   ├── Achievements
│   ├── Notifications
│   └── Comments

Redis (Cache/Realtime)
├── Session Storage
├── Real-time Updates
├── Job Queue
└── Rate Limiting
```

### DevOps
```
Docker & Compose
├── MongoDB Container
├── Redis Container
├── Backend Container
└── Frontend Container

Cloud Platforms
├── Vercel (Frontend)
├── Heroku/Railway (Backend)
├── MongoDB Atlas (Database)
├── Redis Cloud (Cache)
└── AWS S3 (File Storage)
```

---

## 🗄️ Database Schema

### Users Collection
```typescript
{
  _id: ObjectId,
  email: string (unique, indexed),
  name: string,
  password: string (hashed),
  avatar: string?,
  level: number,
  totalXp: number,
  streak: number,
  longestStreak: number,
  completedTasks: number,
  theme: 'light' | 'dark',
  settings: {
    notifications: boolean,
    emailNotifications: boolean,
    quietHours: { start: string, end: string }?,
    soundEnabled: boolean
  },
  createdAt: Date (indexed),
  updatedAt: Date,
  lastLoginAt: Date?
}
```

### Tasks Collection
```typescript
{
  _id: ObjectId,
  userId: ObjectId (indexed),
  title: string (indexed),
  description: string?,
  
  // Scheduling
  dueDate: Date? (indexed),
  dueTime: string?,
  startDate: Date?,
  startTime: string?,
  estimatedDuration: number?,
  
  // Categorization
  category: string,
  tags: [string],
  priority: enum('Critical', 'High', 'Medium', 'Low'),
  status: enum('NotStarted', 'InProgress', 'Completed', 'Paused', 'Cancelled', 'Archived'),
  difficulty: enum('Easy', 'Medium', 'Hard'),
  
  // Recurrence
  isRecurring: boolean,
  recurrencePattern: {
    frequency: string,
    interval: number,
    daysOfWeek: [number]?,
    endDate: Date?,
    occurrences: number?
  }?,
  
  // Reminders
  reminders: [{
    time: number,
    unit: 'minutes' | 'hours' | 'days',
    type: 'InApp' | 'Email' | 'SMS' | 'Browser' | 'Push',
    sent: boolean,
    sentAt: Date?
  }],
  
  // Files & Notes
  attachments: [{
    name: string,
    url: string,
    type: string,
    size: number,
    uploadedAt: Date
  }],
  notes: string?,
  
  // Gamification
  xpReward: number,
  
  // Tracking
  createdAt: Date (indexed),
  updatedAt: Date,
  completedAt: Date?,
  startedAt: Date?,
  timeSpent: number,
  completionPercentage: number
}
```

### Achievements Collection
```typescript
{
  _id: ObjectId,
  userId: ObjectId (indexed),
  name: string,
  description: string,
  icon: string,
  type: 'Completion' | 'Consistency' | 'Mastery' | 'Special',
  requirement: number,
  progress: number,
  unlockedAt: Date? (indexed),
  createdAt: Date
}
```

### Notifications Collection
```typescript
{
  _id: ObjectId,
  userId: ObjectId (indexed),
  type: string,
  title: string,
  message: string,
  taskId: ObjectId?,
  read: boolean (indexed),
  readAt: Date?,
  createdAt: Date (indexed)
}
```

---

## 🔄 Data Flow

### Task Creation Flow
```
User Input (Form)
       ▼
Form Validation (React Hook Form)
       ▼
API Call (POST /tasks)
       ▼
Backend Validation
       ▼
Mongoose Query (Create Document)
       ▼
MongoDB Insert
       ▼
Response with Task Data
       ▼
Update Zustand Store
       ▼
Update UI
       ▼
WebSocket Broadcast (if shared)
```

### Task Completion Flow
```
User Clicks Complete
       ▼
API Call (POST /tasks/{id}/complete)
       ▼
Backend:
  - Update task status
  - Calculate XP
  - Update user level
  - Check achievements
  - Trigger notifications
       ▼
MongoDB Updates
       ▼
Response with XP & Achievements
       ▼
Update Zustand Store
       ▼
Show Notifications
       ▼
Animate UI Updates
```

### Real-time Sync Flow
```
Device A Makes Change
       ▼
Optimistic Update (Local)
       ▼
API Call
       ▼
WebSocket Event Emitted
       ▼
Device B Receives Event
       ▼
Update Local State
       ▼
UI Refreshes
```

---

## 🔐 Security Architecture

### Authentication Flow
```
1. User Credentials (Email + Password)
   ▼
2. Backend Validation & Password Hash Check
   ▼
3. Generate JWT Token (exp: 7 days)
   ▼
4. Return Token + User Data
   ▼
5. Store in localStorage
   ▼
6. Send in Authorization Header on Each Request
   ▼
7. Backend Middleware Verifies Token
   ▼
8. Allow Request if Valid
```

### Authorization Levels
```
Public Endpoints:
  - GET / (home)
  - POST /auth/register
  - POST /auth/login

Protected Endpoints (require valid JWT):
  - GET /auth/profile
  - All /tasks/* endpoints
  - PUT /auth/profile
```

### Data Encryption
```
In Transit:
  - HTTPS/TLS for all communications
  - Socket.io with SSL

At Rest:
  - Password: bcryptjs (10+ salt rounds)
  - Sensitive data: encrypted before storage
  - Files: encrypted in S3

Environment:
  - Secrets in .env (never in code)
  - CI/CD secrets management
  - API key rotation
```

---

## 🚀 Scaling Strategy

### Current (Weeks 1-4)
- Single backend server
- MongoDB Atlas (shared)
- Redis (single instance)
- Suitable for: 1-1000 users

### Medium Scale (Weeks 5-12)
- Load balancer (2-3 backend instances)
- Database replication
- Redis cluster
- CDN for static assets
- Suitable for: 1000-100K users

### Large Scale (Phases 3-4+)
- Kubernetes cluster
- Microservices architecture
- Database sharding
- Redis cluster + Sentinel
- Global CDN
- Message queue (Bull/RabbitMQ)
- Suitable for: 100K+ users

```
┌─────────────────────────────────────────────────────┐
│            Global Load Balancer (CloudFlare)        │
└──────────────────────────────────────────────────────┘
           ▼            ▼            ▼
┌──────────────────┬──────────────┬──────────────────┐
│ Backend Pod 1    │ Backend Pod 2 │ Backend Pod 3    │
│ (Node.js)        │ (Node.js)     │ (Node.js)        │
└──────────────────┴──────────────┴──────────────────┘
           ▼            ▼            ▼
┌─────────────────────────────────────────────────────┐
│        Kubernetes Service (Inter-pod comm)          │
└─────────────────────────────────────────────────────┘
           ▼            ▼
┌────────────────────────────────────────────────────┐
│  Primary DB (writes)  │  Replicas (reads)          │
│  (MongoDB Primary)    │  (MongoDB Secondaries)     │
└────────────────────────────────────────────────────┘
           ▼
┌────────────────────────────────────────────────────┐
│  Redis Cluster (sessions, cache, queues)           │
└────────────────────────────────────────────────────┘
```

---

## 📊 Performance Optimization

### Frontend
- Code splitting per route
- Image optimization
- CSS critical path
- Service Workers
- Static site generation where possible
- Client-side caching

### Backend
- Database indexing
- Connection pooling
- Query optimization
- Redis caching strategy
- Response compression
- Rate limiting
- Pagination

### Database
```javascript
// Indexes for common queries
db.tasks.createIndex({ userId: 1, createdAt: -1 })
db.tasks.createIndex({ dueDate: 1, status: 1 })
db.tasks.createIndex({ userId: 1, status: 1 })
db.users.createIndex({ email: 1 })  // unique index
```

---

## 🧪 Testing Architecture

### Unit Tests
```
Frontend:
  - Component rendering
  - Hook functionality
  - Utility functions
  - Store actions

Backend:
  - Service methods
  - Model validations
  - Middleware functions
  - Utility functions
```

### Integration Tests
```
Frontend:
  - Form submission
  - API integration
  - State management flow
  - User interactions

Backend:
  - API endpoints
  - Database operations
  - Authentication flow
  - Data transformations
```

### E2E Tests
```
- User registration flow
- Creating a task
- Completing a task
- Viewing dashboard
- Searching tasks
- Dark mode toggle
```

---

## 📈 Monitoring & Observability

### Application Metrics
```
- Request latency (p50, p95, p99)
- Error rates by endpoint
- Database query performance
- Cache hit/miss rates
- WebSocket connection count
- Active sessions
```

### Infrastructure Metrics
```
- CPU usage
- Memory usage
- Disk I/O
- Network bandwidth
- Container health
- Deployment success rate
```

### Tools
- **Error Tracking**: Sentry
- **Performance**: New Relic / DataDog
- **Logs**: CloudWatch / ELK Stack
- **Alerts**: PagerDuty
- **Analytics**: Google Analytics / Mixpanel

---

## 🔄 CI/CD Pipeline

```
┌─────────────────┐
│  Push to GitHub │
└────────┬────────┘
         ▼
┌─────────────────────────┐
│  Run Tests (Jest/Mocha) │
└────────┬────────────────┘
         ▼
┌──────────────────────┐
│  Lint Check (ESLint) │
└────────┬─────────────┘
         ▼
┌────────────────────────┐
│  Build Docker Images   │
└────────┬───────────────┘
         ▼
┌─────────────────────────┐
│  Push to Registry (ECR) │
└────────┬────────────────┘
         ▼
┌──────────────────────────────┐
│  Deploy to Staging (QA Test) │
└────────┬─────────────────────┘
         ▼
┌──────────────────────────────┐
│ Blue-Green Deploy to Prod    │
└───────────┬──────────────────┘
            ▼
    ┌─────────────────┐
    │ Monitor & Alert │
    └─────────────────┘
```

---

## 🎯 Architecture Principles

1. **Modularity** - Independent components/services
2. **Scalability** - Horizontal scaling capability
3. **Reliability** - Error handling & recovery
4. **Performance** - Fast response times
5. **Security** - Defense in depth
6. **Maintainability** - Clear code structure
7. **Testability** - Comprehensive test coverage
8. **Observability** - Monitoring & logging

---

For implementation details, see individual service documentation.
