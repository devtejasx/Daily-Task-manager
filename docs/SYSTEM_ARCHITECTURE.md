# Task Manager - System Architecture Documentation

## Overview

This document outlines the complete system architecture for the production-grade Task Manager application, a SaaS platform with gamification, AI integration, real-time collaboration, and enterprise-grade reliability.

---

## 1. Architecture Layers

### 1.1 Client Layer (Frontend)

**Technology Stack:**
- Next.js 14.2.35 (React 18 + TypeScript)
- Tailwind CSS 3.3 + Framer Motion
- Zustand (State Management)
- React Query (Data Fetching/Caching)
- Socket.io (Real-time)
- PWA with Service Workers + IndexedDB

**Key Components:**
- Dashboard: Task overview, analytics, gamification status
- Task Management: CRUD operations, bulk actions
- Analytics: Charts, progress tracking, XP/level display
- Collaboration: Team management, shared tasks, presence
- Voice & AI: Voice input, AI suggestions, task parsing
- Settings: User preferences, notifications, integrations

**Features:**
- Responsive Design (Mobile, Tablet, Desktop)
- Offline Support (Service Worker + IndexedDB)
- Real-time Updates (WebSocket)
- Accessibility (WCAG 2.1 AA)

### 1.2 API Gateway & Load Balancer

**Components:**
- AWS API Gateway / Nginx Reverse Proxy
- SSL/TLS Termination
- Rate Limiting & CORS
- Request Validation
- Load Balancing (Round-robin / Least connections)

**Features:**
- Request throttling per IP/User
- DDoS protection
- Automatic health checks
- Auto-scaling based on load

### 1.3 Application Layer (Backend)

**Technology Stack:**
- Node.js 18+ (LTS)
- Express.js with TypeScript
- MongoDB + Mongoose
- Redis (Caching & Sessions)
- Bull/BullMQ (Job Queue)
- Socket.io (WebSocket Server)
- OpenAI API (GPT-4, Whisper, TTS)

**Main Components:**

```
backend/
├── src/
│   ├── index.ts              # Application entry point
│   ├── app.ts                # Express app setup
│   ├── config/               # Configuration files
│   ├── middleware/           # Express middleware
│   ├── controllers/          # Request handlers
│   ├── services/             # Business logic
│   ├── models/               # Mongoose schemas
│   ├── routes/               # API routes
│   ├── types/                # TypeScript types
│   ├── utils/                # Helper functions
│   ├── queues/               # Bull job queues
│   └── monitoring/           # Logging, metrics, errors
```

**Route Structure:**
- `/api/v1/auth` - Authentication (5 endpoints)
- `/api/v1/tasks` - Task Management (8 endpoints)
- `/api/v1/teams` - Team Collaboration (6 endpoints)
- `/api/v1/habits` - Habit Tracking (4 endpoints)
- `/api/v1/analytics` - Analytics & Reports (5 endpoints)
- `/api/v1/voice` - Voice Input (3 endpoints)
- `/api/v1/ai` - AI Integration (4 endpoints)
- `/api/v1/notifications` - Notifications (3 endpoints)
- `/api/v1/user` - User Management (5 endpoints)
- `/api/v1/admin` - Admin Operations (varies)

### 1.4 Data Layer

**Primary Database: MongoDB**
- Collections:
  - `users` - User profiles and authentication
  - `tasks` - User tasks with metadata
  - `teams` - Team information and settings
  - `team_invitations` - Team member invitations
  - `habits` - Habit tracking data
  - `achievements` - User achievements
  - `notifications` - User notifications
  - `audit_logs` - System audit trail
  - `ai_usage` - AI API usage tracking
  - `payments` - Payment records

**Cache Layer: Redis**
- Session storage
- User profile cache (5 min TTL)
- Task list cache (1 min TTL)
- Analytics cache (30 min TTL)
- Rate limiting counters
- WebSocket session data

**Backup Storage: AWS S3**
- Database backups (daily)
- User uploads/attachments
- File storage for sharing

**Search: MongoDB Full-Text Index**
- Text search on tasks, descriptions
- Category and tag filtering

### 1.5 Services Layer

**Core Services:**
- **AuthService** - JWT, OAuth2, token refresh, password hashing
- **TaskService** - CRUD, filtering, sorting, bulk operations
- **UserService** - Profile management, settings, statistics
- **TeamService** - Team CRUD, invitations, permissions
- **GamificationService** - XP calculation, levels, achievements, streaks
- **AnalyticsService** - Statistics, reports, insights
- **NotificationService** - Email, push, in-app notifications
- **VoiceService** - Audio transcription, NLP parsing
- **AIService** - GPT-4 integration, suggestions, cost tracking
- **PaymentService** - Stripe integration, subscriptions, billing
- **CacheService** - Redis operations, invalidation strategy
- **LoggerService** - Winston logging, log aggregation

### 1.6 Real-Time Layer

**WebSocket Server (Socket.io)**

**Events Handled:**
- `task:created` - New task created in team
- `task:updated` - Task modified
- `task:deleted` - Task removed
- `task:completed` - Task marked complete
- `presence:online` - User online status
- `presence:offline` - User offline status
- `notification:received` - New notification
- `message:new` - Team chat message (future)
- `comment:added` - Task comment added (future)

**Features:**
- Namespace isolation: `/tasks`, `/teams`, `/users`
- Room-based broadcasting
- Automatic reconnection
- Event acknowledgment

### 1.7 Background Job Processing

**Bull/BullMQ Queues:**

1. **Email Queue** (High priority)
   - Task reminders
   - Achievement notifications
   - Weekly summaries
   - Urgent notifications

2. **Notification Queue** (High priority)
   - Push notifications
   - In-app notifications
   - SMS (optional)

3. **Analytics Queue** (Low priority)
   - Statistics aggregation
   - Report generation
   - Leaderboard updates

4. **AI Queue** (Medium priority)
   - Batch AI processing
   - Suggestion generation
   - Task analysis

5. **Cleanup Queue** (Low priority)
   - Expired token deletion
   - Old log cleanup
   - Session cleanup

**Job Concurrency:**
- Email: 10 workers
- Notifications: 5 workers
- Analytics: 2 workers
- AI: 3 workers
- Cleanup: 1 worker

---

## 2. Data Flow Diagrams

### 2.1 User Registration Flow

```
User Registration Form
        ↓
[Email Validation]
        ↓
[Password Strength Check]
        ↓
[Check Email Uniqueness]
        ↓
[Create User in MongoDB]
        ↓
[Hash Password (bcrypt)]
        ↓
[Generate JWT Token]
        ↓
[Send Welcome Email (Queue)]
        ↓
[Create Initial Dashboard Data]
        ↓
[Return Token + User Data]
        ↓
Client: Set Token in localStorage
        ↓
Redirect to Dashboard
```

### 2.2 Task Creation & Completion Flow

```
User Creates Task
        ↓
[Frontend Validation]
        ↓
POST /api/v1/tasks
        ↓
[JWT Verification]
        ↓
[Authorization Check]
        ↓
[Request Validation]
        ↓
[Rate Limit Check]
        ↓
TaskService.createTask()
    ├─ Validate input
    ├─ Calculate XP reward
    ├─ Generate AI suggestions (async)
    ├─ Save to MongoDB
    ├─ Update cache
    ├─ Emit WebSocket event
    └─ Queue notification job
        ↓
Response to Client
        ↓
Frontend Updates
    ├─ Add to Zustand store
    ├─ Show success toast
    ├─ Add animation
    ├─ Sync to IndexedDB
    └─ Update leaderboard cache
        ↓
WebSocket Event Broadcast
    └─ Notify team members (real-time)
        ↓
Background Job Processing
    ├─ Send notifications
    ├─ Update analytics
    └─ Process AI suggestions
```

### 2.3 Real-Time Collaboration Flow

```
User A Updates Task
        ↓
[Frontend Optimistic Update]
        ↓
POST /api/v1/tasks/:id
        ↓
Backend TaskService
    ├─ Update database
    ├─ Emit 'task:updated' event
    └─ Return response
        ↓
WebSocket Broadcasting
    ├─ Send to User B
    ├─ Send to other team members
    └─ Update presence data
        ↓
User B Frontend
    ├─ Receive WebSocket event
    ├─ Update React Query cache
    ├─ Show notification: "User A updated this"
    ├─ Trigger animation
    └─ Merge with local changes
```

### 2.4 Notification Flow

```
Event Triggered
    (Task due, achievement earned, team invite, etc.)
        ↓
NotificationService.create()
        ↓
Store in MongoDB notifications collection
        ↓
Emit WebSocket to user (if online)
        ↓
Queue Email/Push Job
        ↓
Background Worker Processes Job
    ├─ Send Email via SendGrid
    ├─ Send Push via Firebase Cloud Messaging
    └─ Update delivery status
        ↓
User Receives Notification
    ├─ Email inbox
    ├─ Browser/Mobile push
    └─ In-app notification (if online)
```

---

## 3. API Design & Versioning

### 3.1 API Structure

```
Base URL: https://api.taskmanager.com/api/v1

Endpoints:
GET /tasks                  - List user tasks
POST /tasks                 - Create task
GET /tasks/:id              - Get task details
PUT /tasks/:id              - Update task
DELETE /tasks/:id           - Delete task
PATCH /tasks/:id/complete   - Mark complete

Request/Response Format:
{
  "success": boolean,
  "data": object | array,
  "error": string (if error),
  "message": string,
  "pagination": {
    "page": number,
    "limit": number,
    "total": number,
    "pages": number
  },
  "timestamp": ISO8601
}
```

### 3.2 Authentication Flow

```
1. User registers or logs in
   ├─ Sends email + password
   └─ Receives accessToken + refreshToken

2. accessToken (15 min TTL)
   ├─ Sent in Authorization: Bearer header
   └─ Used for API requests

3. refreshToken (7 day TTL)
   ├─ Stored in HttpOnly cookie
   ├─ Used to get new accessToken
   └─ Rotated on each refresh

4. Token Refresh
   ├─ POST /auth/refresh
   ├─ Body: { refreshToken }
   └─ Receive new accessToken + refreshToken
```

### 3.3 Error Handling

```
Error Response Format:
{
  "success": false,
  "error": "VALIDATION_ERROR",
  "errorCode": 400,
  "message": "Invalid input parameters",
  "details": [
    {
      "field": "email",
      "message": "Email must be valid"
    }
  ],
  "timestamp": ISO8601,
  "requestId": "req_123456"
}

HTTP Status Codes:
- 200: Success
- 201: Created
- 204: No content
- 400: Bad request (validation error)
- 401: Unauthorized (invalid token)
- 403: Forbidden (insufficient permissions)
- 404: Not found
- 409: Conflict (duplicate resource)
- 429: Too many requests (rate limited)
- 500: Internal server error
- 502: Bad gateway
- 503: Service unavailable
```

---

## 4. Database Schema

### 4.1 User Collection

```typescript
{
  _id: ObjectId,
  email: string (unique, indexed),
  password: string (bcrypt hashed),
  fullName: string,
  avatar: string (S3 URL),
  bio: string,
  role: enum ['user', 'admin'],
  tier: enum ['free', 'pro', 'enterprise'],
  
  // Gamification
  level: number (default: 1),
  xp: number (default: 0),
  streak: number (default: 0),
  lastTaskCompletedDate: Date,
  
  // Account
  emailVerified: boolean,
  phoneNumberVerified: boolean,
  twoFactorEnabled: boolean,
  twoFactorSecret: string (encrypted),
  
  // Preferences
  preferences: {
    emailNotifications: boolean,
    pushNotifications: boolean,
    theme: enum ['light', 'dark'],
    timezone: string,
    language: string
  },
  
  // Auth
  stripeCustomerId: string,
  subscriptionStatus: string,
  subscriptionPlan: string,
  subscriptionEndDate: Date,
  
  // Session
  lastLogin: Date,
  loginCount: number,
  
  // Timestamps
  createdAt: Date (indexed),
  updatedAt: Date,
  deletedAt: Date (sparse, indexed for soft delete)
}

Indexes:
- email (unique)
- createdAt
- deletedAt (sparse)
- stripeCustomerId
```

### 4.2 Task Collection

```typescript
{
  _id: ObjectId,
  userId: ObjectId (indexed, required),
  teamId: ObjectId (optional, indexed),
  title: string (required),
  description: string,
  priority: enum ['low', 'medium', 'high', 'critical'] (indexed),
  status: enum ['pending', 'in_progress', 'completed'] (indexed),
  category: string (indexed),
  tags: [string] (indexed),
  
  // Timing
  dueDate: Date (indexed),
  createdAt: Date (indexed),
  completedAt: Date (sparse, indexed),
  
  // Gamification
  xpReward: number,
  xpAwarded: number,
  difficulty: enum ['easy', 'medium', 'hard'],
  
  // Recurring
  isRecurring: boolean,
  recurringPattern: string (cron format),
  nextOccurrence: Date,
  
  // Collaboration
  assignedTo: [ObjectId],
  collaborators: [ObjectId] (indexed),
  comments: number,
  
  // Metadata
  attachments: [string] (S3 URLs),
  subtasks: [{
    _id: ObjectId,
    title: string,
    completed: boolean
  }],
  
  // Tracking
  estimatedTime: number (minutes),
  actualTime: number (minutes),
  timeSpent: number (minutes),
  
  // Soft delete
  deletedAt: Date (sparse, indexed)
}

Compound Indexes:
- (userId, status)
- (userId, dueDate)
- (userId, category)
- (teamId, status)
- (createdAt, -1)

Text Index:
- title, description, tags
```

### 4.3 Team Collection

```typescript
{
  _id: ObjectId,
  name: string,
  description: string,
  ownerId: ObjectId (indexed),
  members: [{
    userId: ObjectId,
    role: enum ['owner', 'manager', 'member'],
    joinedAt: Date
  }],
  
  // Settings
  settings: {
    allowPublicTasks: boolean,
    requireTaskApproval: boolean,
    defaultNotificationLevel: string
  },
  
  // Metadata
  avatar: string (S3 URL),
  visibility: enum ['private', 'internal', 'public'],
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date
}

Indexes:
- ownerId
- createdAt
```

### 4.4 Achievement Collection

```typescript
{
  _id: ObjectId,
  userId: ObjectId (indexed),
  type: enum ['first_task', 'streak_7', 'streak_30', 'level_5', 'task_100', etc.],
  title: string,
  description: string,
  badge: string (emoji/icon),
  awardedAt: Date (indexed),
  xpBonus: number
}

Indexes:
- userId
- awardedAt
```

### 4.5 AuditLog Collection

```typescript
{
  _id: ObjectId,
  userId: ObjectId (indexed),
  action: string,
  resource: string,
  method: enum ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  path: string,
  statusCode: number,
  ip: string,
  userAgent: string,
  requestBody: object (sanitized),
  responseSize: number,
  duration: number (ms),
  timestamp: Date (indexed)
}

TTL Index:
- deletedAt: auto-delete after 90 days
- timestamp: keep for 90 days
```

---

## 5. Security Architecture

### 5.1 Authentication

**JWT Structure:**
```
Header: { alg: "HS256", typ: "JWT" }
Payload: {
  userId: string,
  email: string,
  role: string,
  type: "access" | "refresh",
  iat: number,
  exp: number
}
Signature: HMAC-SHA256(secret)
```

**Token Lifecycle:**
- Access Token: 15 minutes (short-lived)
- Refresh Token: 7 days (long-lived)
- Rotation: New refresh token on each refresh

### 5.2 Authorization

**Role-Based Access Control:**
```
Admin:
- Read/Write all resources
- Manage users
- Access admin endpoints
- View audit logs

Manager:
- Create/manage team tasks
- Invite team members
- View team analytics
- Manage team settings

Member:
- Create own tasks
- Read shared tasks
- Update own tasks
- Access own analytics

Viewer:
- Read-only access
- No create/update/delete
```

### 5.3 Security Headers

```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Content-Security-Policy: default-src 'self'
Referrer-Policy: strict-origin-when-cross-origin
```

### 5.4 Data Protection

- **Passwords**: bcrypt with 12 rounds
- **Sensitive Data**: Encrypted at rest and in transit
- **PII**: Redacted in logs
- **Backups**: Encrypted, stored in secure S3 bucket
- **Compliance**: GDPR, CCPA ready

---

## 6. Monitoring & Observability

### 6.1 Logging Strategy

**Log Levels:**
- ERROR: Critical issues (database down, auth failure)
- WARN: Warnings (slow queries, high memory)
- INFO: Important events (user login, task creation)
- DEBUG: Detailed debugging info (query params)

**Log Destinations:**
- Console (development)
- File system (rotating)
- ELK Stack (production)
- Sentry (errors)

### 6.2 Monitoring Metrics

**System Metrics:**
- CPU usage
- Memory usage
- Disk I/O
- Network I/O
- Process count

**Application Metrics:**
- Requests per second (RPS)
- Response time (p50, p95, p99)
- Error rate
- Cache hit rate
- Database query time

**Business Metrics:**
- Active users
- Tasks created
- AI API calls
- Payment processing time
- Conversion rate

### 6.3 Alerting

**Critical Alerts:**
- Error rate > 1%
- Response time p95 > 500ms
- Database connection pool exhausted
- Redis unavailable
- Payment processing failures

**Warning Alerts:**
- Error rate > 0.5%
- Response time p95 > 200ms
- High memory usage (>80%)
- Slow query detected (>1s)

---

## 7. Deployment Architecture

### 7.1 Environment Setup

```
Development:
- Local machine / Docker
- Local MongoDB
- Redis server
- Node.js dev server

Staging:
- AWS EC2
- MongoDB Atlas (staging)
- ElastiCache Redis
- Application server

Production:
- AWS ECS (Fargate)
- MongoDB Atlas (production)
- ElastiCache Redis cluster
- Load balancer (ALB)
- CDN (CloudFront)
```

### 7.2 Infrastructure as Code

**Terraform:**
- VPC and networking
- RDS/MongoDB setup
- ElastiCache Redis
- EC2/ECS instances
- Load balancers
- S3 buckets
- IAM roles and policies

### 7.3 Containerization

**Docker:**
- Multi-stage builds
- Minimal image size
- Health checks
- Container logging

**Docker Compose** (development):
- Backend service
- Frontend service

**Kubernetes** (production):
- Pod autoscaling
- Service mesh (optional)
- Ingress controller
- Resource limits
- Health probes

---

## 8. Performance Optimization

### 8.1 Caching Strategy

**Redis Caching:**
- User profile: 5 min TTL
- Task list: 1 min TTL
- Analytics: 30 min TTL
- Leaderboard: 1 hour TTL
- Search results: 10 min TTL

**Browser Caching:**
- Static assets: 30 days
- API responses: 5 min (with ETag)

**CDN Caching:**
- Images: 30 days
- CSS/JS: 30 days
- HTML: 1 hour

### 8.2 Database Optimization

**Indexes:**
- Compound indexes for common queries
- Text indexes for search
- Sparse indexes for optional fields
- TTL indexes for auto-deletion

**Query Optimization:**
- Projection (select specific fields)
- Pagination (limit/skip)
- Lean queries (no Mongoose middleware)
- Connection pooling

### 8.3 API Optimization

**Response Compression:**
- Gzip compression (all responses)
- Brotli compression (for modern browsers)

**Pagination:**
- Default limit: 20
- Max limit: 100
- Offset-based pagination

**Rate Limiting:**
- Per-user: 1000 requests/hour
- Per-IP: 5000 requests/hour
- Per-endpoint: 100 requests/minute

---

## 9. Disaster Recovery

### 9.1 Backup Strategy

**Database Backups:**
- Frequency: Daily at 2 AM UTC
- Retention: 30 days
- Backup location: AWS S3
- Encryption: AES-256

**Backup Verification:**
- Weekly restore test
- Monthly full recovery drill

### 9.2 Failure Scenarios

**Database Down:**
- Failover to secondary replica
- Alert operations team
- ETA: 2 minutes

**Redis Down:**
- Graceful degradation (use database)
- Alert operations team
- ETA: 5 minutes

**Region outage:**
- Failover to secondary region
- DNS update
- ETA: 15 minutes

---

## 10. Scalability Plan

### Phase 1: Up to 1,000 users
- Single backend instance
- Single MongoDB instance
- Single Redis instance
- Simple monitoring

### Phase 2: Up to 10,000 users
- 2-3 backend instances (load balanced)
- MongoDB replica set
- Redis cluster
- Advanced monitoring & alerting

### Phase 3: Up to 100,000 users
- Auto-scaling backend (3-20 instances)
- MongoDB sharded cluster
- Redis sentinel for HA
- CDN for static assets
- Search service (Elasticsearch)

### Phase 4: Enterprise scale
- Multi-region deployment
- Database read replicas
- Message queue (RabbitMQ/Kafka)
- Microservices architecture
- Advanced caching layers

---

## 11. Development Workflow

### 11.1 Git Workflow

**Branches:**
- `main` - Production ready
- `develop` - Development branch
- `feature/*` - Feature branches
- `bugfix/*` - Bug fix branches
- `hotfix/*` - Production hotfixes

### 11.2 Code Review Process

1. Developer creates feature branch
2. Commits with descriptive messages
3. Creates pull request
4. Automated tests run
5. Code review by 2+ developers
6. Approval and merge to develop
7. Deploy to staging
8. Final testing
9. Merge to main for production

### 11.3 Testing Strategy

- Unit tests: 80%+ coverage
- Integration tests: All APIs
- E2E tests: Critical user flows
- Load testing: 1000 concurrent users
- Security testing: OWASP Top 10

---

## 12. Conclusion

This architecture provides:

✅ **Scalability** - Handles growth from 100 to 100,000+ users
✅ **Reliability** - 99.9% uptime SLA with redundancy
✅ **Security** - Enterprise-grade authentication, authorization, encryption
✅ **Performance** - Sub-200ms response times, intelligent caching
✅ **Observability** - Comprehensive logging, monitoring, alerting
✅ **Maintainability** - Clean architecture, well-documented, testable code

Next steps: Implement each component systematically following this architecture.
