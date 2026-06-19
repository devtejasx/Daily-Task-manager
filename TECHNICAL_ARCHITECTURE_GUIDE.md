# Technical Architecture Guide
**Task Manager Application - Complete Technical Specifications**

---

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER (Browser)                       │
│  ┌──────────────────────┬──────────────────────┐                │
│  │   Next.js Frontend   │   React Components   │                │
│  │  - SSR/SSG           │  - Animations        │                │
│  │  - Image Optimization│  - State Management  │                │
│  └──────────────────────┴──────────────────────┘                │
│         │                    │                                    │
│         ├─────────────────────┤                                  │
│         ▼                     ▼                                  │
│  ┌──────────────────────┬──────────────────────┐                │
│  │   IndexedDB Storage  │  Service Workers     │                │
│  │  - Offline Data      │  - Sync Queue        │                │
│  │  - Cache             │  - Notifications     │                │
│  └──────────────────────┴──────────────────────┘                │
└──────────────────────┬────────────────────────────────────────────┘
                       │ HTTPS / WebSocket
                       ▼
┌──────────────────────────────────────────────────────────────────┐
│                    API GATEWAY LAYER                              │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │  Load Balancer / CORS / Rate Limiting / Request Validation  │   │
│  └────────────────────────────────────────────────────────────┘   │
└──────────────────────┬────────────────────────────────────────────┘
                       │
         ┌─────────────┼─────────────┐
         ▼             ▼             ▼
    ┌────────────┐ ┌────────────┐ ┌──────────────┐
    │ REST APIs  │ │WebSocket   │ │  gRPC        │
    │ Express    │ │ Socket.io  │ │ (optional)   │
    │ Node.js    │ │ Real-time  │ │              │
    └────────────┘ └────────────┘ └──────────────┘
         │             │
         └─────────────┼─────────────┐
                       ▼             ▼
    ┌──────────────────────────────────────┐
    │     BUSINESS LOGIC LAYER              │
    │  Controllers → Services → Models      │
    └──────────────────────────────────────┘
         │      │       │         │
         ├──────┼───────┼─────────┤
         ▼      ▼       ▼         ▼
    ┌────────────────────────────────────┐
    │     DATA ACCESS LAYER               │
    │  ┌──────────────────────────────┐   │
    │  │   ORMs / Query Builders      │   │
    │  │   - Prisma / Sequelize       │   │
    │  │   - Query Optimization       │   │
    │  └──────────────────────────────┘   │
    └────────────────────────────────────┘
         │           │          │
         ▼           ▼          ▼
    ┌─────────┬──────────┬──────────┐
    │PostgreSQL│Redis    │AWS S3    │
    │Database  │ Cache   │Storage   │
    └─────────┴──────────┴──────────┘
```

---

## Frontend Architecture

### Technology Stack

**Core Framework**
- **Next.js 14+** with TypeScript
  - App Router (v13+)
  - Server-side rendering (SSR)
  - Static site generation (SSG)
  - API routes for backend
  - Image optimization
  - Built-in font optimization

**Styling & UI**
- **Tailwind CSS 3+** - Utility-first CSS
- **Framer Motion** - Advanced animations
- **Radix UI** - Accessible component primitives
- **Lucide Icons** - Beautiful icon library

**State Management**
- **Zustand** (recommended) OR **Redux Toolkit**
  - Global state for auth, user, tasks
  - Lightweight and performant
  - Excellent DevTools support

**Data Fetching & Caching**
- **React Query v5+** (TanStack Query)
  - Automatic caching
  - Background syncing
  - Optimistic updates
  - Built-in error handling

**Forms**
- **React Hook Form** - Lightweight form validation
- **Zod** - TypeScript-first schema validation
- **React DatePicker** - Date/time selection

**Developer Tools**
- **TypeScript 5+** - Type safety
- **ESLint** - Code quality
- **Prettier** - Code formatting
- **Vitest** + **React Testing Library** - Testing
- **Cypress** - E2E testing

### Project Structure

```
frontend/
├── app/                      # Next.js app router
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Home page
│   ├── (auth)/              # Auth group
│   │   ├── login/
│   │   ├── register/
│   │   └── reset-password/
│   ├── (app)/               # App group (protected)
│   │   ├── dashboard/
│   │   ├── tasks/
│   │   ├── calendar/
│   │   ├── analytics/
│   │   ├── teams/
│   │   ├── habits/
│   │   └── settings/
│   └── api/                 # API routes (if needed)
│
├── components/              # Reusable components
│   ├── layouts/
│   │   ├── AppLayout.tsx
│   │   └── AuthLayout.tsx
│   ├── common/
│   │   ├── Navbar.tsx
│   │   ├── Sidebar.tsx
│   │   ├── LoadingSpinner.tsx
│   │   └── ErrorBoundary.tsx
│   ├── tasks/
│   │   ├── TaskCard.tsx
│   │   ├── TaskForm.tsx
│   │   ├── TaskList.tsx
│   │   └── TaskDetail.tsx
│   ├── calendar/
│   │   └── Calendar.tsx
│   ├── gamification/
│   │   ├── XPCounter.tsx
│   │   ├── LevelProgress.tsx
│   │   └── AchievementBadge.tsx
│   └── modals/
│       ├── CreateTaskModal.tsx
│       └── ConfirmDialog.tsx
│
├── hooks/                   # Custom React hooks
│   ├── useAuth.ts
│   ├── useTasks.ts
│   ├── useNotifications.ts
│   ├── useLocalStorage.ts
│   └── useOfflineMode.ts
│
├── lib/                     # Utilities & helpers
│   ├── api.ts              # API client setup
│   ├── date-utils.ts
│   ├── validation.ts
│   ├── animation.ts
│   └── storage.ts
│
├── store/                   # Global state
│   ├── authStore.ts
│   ├── taskStore.ts
│   └── uiStore.ts
│
├── types/                   # TypeScript types
│   ├── index.ts
│   ├── task.ts
│   ├── user.ts
│   ├── team.ts
│   └── api.ts
│
├── services/               # API services
│   ├── taskService.ts
│   ├── authService.ts
│   ├── userService.ts
│   └── analyticsService.ts
│
├── middleware/(auth)/       # Route middleware
│   └── withAuth.ts
│
├── styles/                  # Global styles
│   └── globals.css
│
├── public/                  # Static assets
│
└── config/
    ├── site.config.ts
    ├── db.config.ts
    └── api.config.ts
```

### State Management with Zustand

```typescript
// store/taskStore.ts
import { create } from 'zustand';

interface TaskStore {
  tasks: Task[];
  selectedTaskId: string | null;
  filter: TaskFilter;
  
  // Actions
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, task: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  selectTask: (id: string) => void;
  setFilter: (filter: TaskFilter) => void;
}

export const useTaskStore = create<TaskStore>((set) => ({
  tasks: [],
  selectedTaskId: null,
  filter: defaultFilter,
  
  setTasks: (tasks) => set({ tasks }),
  addTask: (task) => set((state) => ({ 
    tasks: [...state.tasks, task] 
  })),
  // ... more actions
}));
```

### Data Fetching with React Query

```typescript
// hooks/useTasks.ts
import { useQuery, useMutation } from '@tanstack/react-query';

export const useTasks = () => {
  return useQuery({
    queryKey: ['tasks'],
    queryFn: taskService.getTasks,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 1, // 1 minute
  });
};

export const useCreateTask = () => {
  return useMutation({
    mutationFn: taskService.createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};
```

### Offline Support

```typescript
// services/syncService.ts
export class SyncService {
  private syncQueue: Operation[] = [];
  private isOnline = navigator.onLine;
  
  constructor(private db: IDBDatabase) {
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());
  }
  
  async handleOnline() {
    // Process sync queue when connection restored
    for (const operation of this.syncQueue) {
      try {
        await this.executeOperation(operation);
      } catch (error) {
        // Keep in queue if fails
      }
    }
  }
  
  async queueOperation(operation: Operation) {
    this.syncQueue.push(operation);
    if (this.isOnline) {
      await this.executeOperation(operation);
    } else {
      // Store in IndexedDB for persistence
      await this.storeInIndexedDB(operation);
    }
  }
}
```

---

## Backend Architecture

### Technology Stack

**Server**
- **Node.js 18+** with Express 5
- **TypeScript 5+** - Type safety
- **Prisma ORM** - Database abstraction
- **PostgreSQL 15+** - Primary database
- **Redis 7+** - Caching and real-time features
- **Socket.io** - Real-time synchronization

**Authentication & Security**
- **jsonwebtoken** - JWT token creation
- **bcryptjs** - Password hashing
- **passport.js** - OAuth integration (Optional)
- **helmet** - Security headers
- **express-rate-limit** - Rate limiting
- **express-validator** - Input validation

**APIs & External Services**
- **axios** - HTTP client
- **node-mailer** - Email sending
- **stripe** - Payment processing (Optional)
- **google-cloud-speech** - Voice-to-text (Optional)

**Monitoring & Logging**
- **winston** - Logging
- **sentry** - Error tracking
- **pino** - Performance logging (Optional)

**Testing**
- **Jest** - Unit testing
- **supertest** - HTTP assertions
- **ts-jest** - TypeScript support

### Project Structure

```
backend/
├── src/
│   ├── index.ts                    # App entry point
│   ├── config/
│   │   ├── database.ts            # Database connection
│   │   ├── redis.ts               # Redis connection
│   │   ├── logger.ts              # Logging setup
│   │   ├── email.ts               # Email service
│   │   └── env.ts                 # Environment variables
│   │
│   ├── models/                     # Prisma models (in prisma/)
│   │   ├── User.ts
│   │   ├── Task.ts
│   │   ├── Category.ts
│   │   ├── Team.ts
│   │   ├── Achievement.ts
│   │   └── ActivityLog.ts
│   │
│   ├── controllers/               # Request handlers
│   │   ├── AuthController.ts
│   │   ├── TaskController.ts
│   │   ├── UserController.ts
│   │   ├── TeamController.ts
│   │   └── AnalyticsController.ts
│   │
│   ├── services/                  # Business logic
│   │   ├── AuthService.ts
│   │   ├── TaskService.ts
│   │   ├── UserService.ts
│   │   ├── TeamService.ts
│   │   ├── AnalyticsService.ts
│   │   ├── AISuggestionsService.ts
│   │   ├── NotificationService.ts
│   │   ├── SyncService.ts
│   │   └── GamificationService.ts
│   │
│   ├── routes/                   # API routes
│   │   ├── auth.ts
│   │   ├── tasks.ts
│   │   ├── users.ts
│   │   ├── teams.ts
│   │   ├── analytics.ts
│   │   ├── sync.ts
│   │   └── index.ts
│   │
│   ├── middleware/               # Express middleware
│   │   ├── auth.ts
│   │   ├── errorHandler.ts
│   │   ├── validation.ts
│   │   ├── logging.ts
│   │   ├── rateLimiting.ts
│   │   └── rbac.ts               # Role-based access control
│   │
│   ├── utils/                    # Utility functions
│   │   ├── jwt.ts
│   │   ├── validators.ts
│   │   ├── errors.ts
│   │   ├── date-utils.ts
│   │   └── math.ts
│   │
│   ├── types/                    # TypeScript types
│   │   ├── express.d.ts          # Express extensions
│   │   ├── index.ts
│   │   ├── task.ts
│   │   ├── user.ts
│   │   └── api.ts
│   │
│   ├── websocket/
│   │   ├── WebSocketServer.ts
│   │   └── handlers/
│   │       ├── taskHandler.ts
│   │       └── notificationHandler.ts
│   │
│   └── __tests__/
│       ├── setup.ts
│       ├── unit/
│       ├── integration/
│       └── e2e/
│
├── prisma/
│   ├── schema.prisma             # Database schema
│   ├── migrations/               # Database migrations
│   └── seed.ts                   # Database seeding
│
├── .env.example                  # Example env variables
├── jest.config.js
├── tsconfig.json
└── package.json
```

### Express Server Setup

```typescript
// src/index.ts
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth';
import taskRoutes from './routes/tasks';
import { configureWebSocket } from './websocket/WebSocketServer';

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);
// ... other routes

// Error handling
app.use(errorHandler);

const server = app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Configure WebSocket
configureWebSocket(server);

export default server;
```

### Prisma Schema

```prisma
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id                String      @id @default(cuid())
  email             String      @unique
  passwordHash      String
  firstName         String?
  lastName          String?
  
  // Gamification
  level             Int         @default(1)
  xpTotal           Int         @default(0)
  currentStreak     Int         @default(0)
  longestStreak     Int         @default(0)
  
  // Relations
  tasks             Task[]
  categories        Category[]
  achievements      Achievement[]
  notifications     Notification[]
  teams             Team[]
  teamMemberships   TeamMember[]
  
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt
}

model Task {
  id                String      @id @default(cuid())
  title             String
  description       String?
  
  // Scheduling
  dueDate           DateTime?
  startDate         DateTime?
  estimatedDuration Int?        // minutes
  
  // Status & Priority
  status            TaskStatus  @default(NOT_STARTED)
  priority          Priority    @default(MEDIUM)
  
  // Categorization
  categoryId        String?
  tags              String[]    @default([])
  
  // Relations
  userId            String
  user              User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  category          Category?   @relation(fields: [categoryId], references: [id], onDelete: SetNull)
  
  // Gamification
  difficulty        Difficulty  @default(MEDIUM)
  xpReward          Int         @default(0)
  
  // Tracking
  completedAt       DateTime?
  timeSpent         Int?        // minutes
  completionPercentage Int      @default(0)
  
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt
}

// ... more models
```

### Service Layer Pattern

```typescript
// src/services/TaskService.ts
import { prisma } from '../config/database';
import { cache } from '../config/redis';

export class TaskService {
  async getTasks(userId: string, filters?: TaskFilter) {
    // Check cache first
    const cacheKey = `tasks:${userId}`;
    const cached = await cache.get(cacheKey);
    if (cached) return JSON.parse(cached);
    
    // Query database
    const tasks = await prisma.task.findMany({
      where: { userId, ...this.buildFilterWhere(filters) },
      include: { category: true },
      orderBy: { dueDate: 'asc' },
    });
    
    // Cache results
    await cache.setex(cacheKey, 300, JSON.stringify(tasks));
    return tasks;
  }
  
  async createTask(userId: string, data: CreateTaskDTO) {
    const task = await prisma.task.create({
      data: {
        ...data,
        userId,
        xpReward: this.calculateXP(data),
      },
    });
    
    // Invalidate cache
    await cache.del(`tasks:${userId}`);
    
    // Send notification
    notificationService.notify(userId, 'Task created');
    
    return task;
  }
  
  private calculateXP(task: CreateTaskDTO): number {
    let xp = 10;
    if (task.difficulty === 'HARD') xp *= 2;
    if (task.priority === 'CRITICAL') xp *= 1.5;
    return Math.round(xp);
  }
  
  private buildFilterWhere(filters?: TaskFilter) {
    if (!filters) return {};
    
    return {
      ...(filters.status && { status: filters.status }),
      ...(filters.priority && { priority: filters.priority }),
      ...(filters.categoryId && { categoryId: filters.categoryId }),
      ...(filters.dueDateRange && {
        dueDate: {
          gte: filters.dueDateRange.start,
          lte: filters.dueDateRange.end,
        },
      }),
    };
  }
}
```

---

## Database Schema

### Core Tables

**User**
- id (UUID)
- email (unique)
- passwordHash
- firstName, lastName
- level, xpTotal, streaks
- preferences (JSON)
- createdAt, updatedAt

**Task**
- id (UUID)
- userId (FK)
- title, description
- dueDate, startDate
- status, priority
- categoryId (FK)
- tags (array)
- difficulty, xpReward
- completedAt, timeSpent
- createdAt, updatedAt

**Category**
- id (UUID)
- userId (FK)
- name
- color
- icon
- isDefault
- createdAt, updatedAt

**Achievement**
- id (UUID)
- userId (FK)
- badge type
- unlockedAt

**Team**
- id (UUID)
- name
- ownerId (FK)
- members (relation)
- createdAt, updatedAt

### Indexes

```sql
-- Performance critical indexes
CREATE INDEX idx_task_user_created ON task(user_id, created_at DESC);
CREATE INDEX idx_task_user_due ON task(user_id, due_date ASC);
CREATE INDEX idx_task_status_priority ON task(status, priority);
CREATE INDEX idx_user_email ON "user"(email);
CREATE INDEX idx_achievement_user ON achievement(user_id);
```

---

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - Logout
- `POST /api/auth/verify-email` - Verify email

### Tasks
- `GET /api/tasks` - List tasks (with filters)
- `POST /api/tasks` - Create task
- `GET /api/tasks/:id` - Get task details
- `PATCH /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `POST /api/tasks/:id/complete` - Mark as complete

### Users
- `GET /api/users/me` - Get current user
- `PATCH /api/users/me` - Update profile
- `GET /api/users/me/stats` - Get user statistics
- `GET /api/users/me/achievements` - Get achievements

### Analytics
- `GET /api/analytics/dashboard` - Dashboard stats
- `GET /api/analytics/trends` - Productivity trends
- `GET /api/analytics/categories` - Category breakdown

### Sync
- `POST /api/sync/push` - Push changes to server
- `GET /api/sync/pull` - Pull latest data
- `GET /api/sync/status` - Get sync status

---

## Deployment Architecture

### Frontend Deployment (Vercel)

```
GitHub Repository → GitHub Actions
  ↓ (on pull request)
Automatic preview build
  ↓ (on merge to main)
Production build & deploy to Vercel
  ↓
CDN distribution globally
```

### Backend Deployment (DigitalOcean/AWS)

```
GitHub Repository → GitHub Actions
  ↓ (on push to main)
Run tests & build
  ↓
Build Docker image
  ↓
Push to Docker registry
  ↓
Deploy to production server
  ↓
Health checks & monitoring
```

### Infrastructure as Code

```dockerfile
# Dockerfile for backend
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

---

## Environment Variables

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=https://api.taskmanager.com
NEXT_PUBLIC_WEB_SOCKET_URL=wss://api.taskmanager.com
NEXT_PUBLIC_ENVIRONMENT=production
```

### Backend (.env)
```
DATABASE_URL=postgresql://user:password@localhost:5432/task_manager
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://taskmanager.com
```

---

## Monitoring & Observability

### Logging Stack
- **Winston** for application logging
- **Elasticsearch** for log aggregation
- **Kibana** for log visualization
- Structured logging with correlation IDs

### Metrics
- **Prometheus** for metrics collection
- **Grafana** for dashboards
- Key metrics:
  - Request latency (p50, p95, p99)
  - Error rates
  - Database query times
  - Cache hit rates
  - WebSocket connection count

### Error Tracking
- **Sentry** for error tracking
- Release tracking
- Performance monitoring
- User feedback

---

**For implementation details, refer to PHASE_5_DETAILED_ROADMAP.md**
