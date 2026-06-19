# Developer Quick Reference Guide
**Task Manager Application - Development Commands & Setup**

---

## Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL 15+
- Redis 7+
- Git
- VS Code (recommended)

### Initial Setup

```bash
# Clone repository
git clone https://github.com/yourusername/task-manager.git
cd task-manager

# Install dependencies
npm install

# Setup environment files
cp .env.example .env           # backend
cp frontend/.env.example frontend/.env.local

# Setup databases
createdb task_manager         # PostgreSQL
redis-server                  # Redis

# Run migrations
cd backend && npm run migrate

# Start development
npm run dev
```

---

## Backend Development

### Common Commands

```bash
# Development
npm run dev                    # Start dev server (watch mode)
npm run build                  # Build for production
npm run start                  # Start production server

# Database
npm run migrate               # Run migrations
npm run migrate:dev          # Reset DB (dev only)
npm run seed                 # Seed database
npm run studio              # Prisma Studio (UI for DB)

# Testing
npm run test                 # Run all tests
npm run test --watch        # Watch mode
npm run test:coverage       # Generate coverage report
npm run test:e2e           # Run E2E tests

# Code Quality
npm run lint                # ESLint check
npm run lint:fix           # Auto-fix linting issues
npm run format             # Prettier format
npm run type-check         # TypeScript check

# API
npm run api:docs          # Generate API docs
npm run api:test          # Test API endpoints
```

### Environment Variables (.env)

```env
# Server
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/task_manager
DATABASE_MAX_CONNECTIONS=20

# Redis
REDIS_URL=redis://localhost:6379/0

# JWT
JWT_SECRET=your-super-secret-key-change-this
JWT_EXPIRE=7d

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:3001

# Email (SendGrid)
SENDGRID_API_KEY=your-sendgrid-key
SENDGRID_FROM_EMAIL=noreply@taskmanager.com

# AWS S3
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET=task-manager-bucket

# Google Cloud (Speech-to-Text)
GOOGLE_APPLICATION_CREDENTIALS=./credentials.json

# Stripe (optional)
STRIPE_SECRET_KEY=your-stripe-key

# Sentry (error tracking)
SENTRY_DSN=your-sentry-dsn

# Environment
LOG_LEVEL=debug
DEBUG=app:*
```

### API Endpoints

```bash
# Authentication
POST   /api/auth/register        # Register new user
POST   /api/auth/login           # User login
POST   /api/auth/refresh         # Refresh token
POST   /api/auth/logout          # User logout
POST   /api/auth/verify-email    # Verify email

# Tasks
GET    /api/tasks                # List tasks (with filters)
POST   /api/tasks                # Create task
GET    /api/tasks/:id            # Get task details
PATCH  /api/tasks/:id            # Update task
DELETE /api/tasks/:id            # Delete task
POST   /api/tasks/:id/complete   # Mark as complete

# Users
GET    /api/users/me             # Get current user
PATCH  /api/users/me             # Update profile
GET    /api/users/me/stats       # Get user statistics
GET    /api/users/me/achievements # Get achievements

# Categories
GET    /api/categories           # List categories
POST   /api/categories           # Create category
PATCH  /api/categories/:id       # Update category
DELETE /api/categories/:id       # Delete category

# Sync
POST   /api/sync/push            # Push changes
GET    /api/sync/pull            # Pull latest data
GET    /api/sync/status          # Get sync status

# Analytics
GET    /api/analytics/dashboard  # Dashboard stats
GET    /api/analytics/trends     # Productivity trends
GET    /api/analytics/categories # Category breakdown
```

### Database Schema Commands

```bash
# Create migration
npx prisma migrate dev --name add_feature_name

# Reset database
npx prisma migrate reset

# View database in UI
npx prisma studio

# Generate Prisma client
npx prisma generate

# Check migrations
npx prisma migrate status
```

### Testing Backend

```bash
# Unit tests
npm run test -- services/TaskService.test.ts

# Integration tests
npm run test -- __tests__/integration

# E2E tests
npm run test:e2e

# Test with coverage
npm run test -- --coverage

# Watch mode
npm run test -- --watch
```

### Debugging

```bash
# Enable debug logging
DEBUG=app:* npm run dev

# Debug specific module
DEBUG=app:services npm run dev

# VS Code debugging
# Add breakpoints, use F5 to start debugger
```

---

## Frontend Development

### Common Commands

```bash
# Development
npm run dev                     # Start dev server (port 3000)
npm run build                   # Build for production
npm run start                   # Start production server

# Testing
npm run test                    # Run all tests
npm run test --watch           # Watch mode
npm run test:coverage          # Coverage report
npm run e2e                     # Cypress E2E tests
npm run e2e:open              # Cypress UI

# Code Quality
npm run lint                    # ESLint check
npm run lint:fix               # Auto-fix
npm run format                 # Prettier
npm run type-check             # TypeScript

# Performance
npm run analyze                # Bundle analysis
npm run lighthouse            # Lighthouse audit
npm run pagespeed             # Page speed check
```

### Environment Variables (.env.local)

```env
# API
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_WEB_SOCKET_URL=ws://localhost:3000

# Environment
NEXT_PUBLIC_ENVIRONMENT=development

# Analytics (optional)
NEXT_PUBLIC_GA_ID=

# Feature flags
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_AI_FEATURES=true
NEXT_PUBLIC_ENABLE_VOICE_INPUT=true
```

### Component Structure

```typescript
// Basic component template
import React from 'react';
import { cn } from '@/lib/utils';

interface ComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export const Component: React.FC<ComponentProps> = ({ 
  className, 
  children 
}) => {
  return (
    <div className={cn('base-classes', className)}>
      {children}
    </div>
  );
};
```

### Using Hooks

```typescript
// Fetch data
import { useQuery } from '@tanstack/react-query';

const { data, isLoading, error } = useQuery({
  queryKey: ['tasks'],
  queryFn: () => taskService.getTasks(),
});

// Global state
import { useTaskStore } from '@/store/taskStore';

const tasks = useTaskStore(state => state.tasks);
const addTask = useTaskStore(state => state.addTask);

// Custom hooks
import { useAuth } from '@/hooks/useAuth';
const { user, isAuthenticated } = useAuth();
```

### Form Handling

```typescript
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const schema = z.object({
  title: z.string().min(1, 'Title required'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  dueDate: z.date().optional(),
});

type FormData = z.infer<typeof schema>;

export const TaskForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();
  
  const onSubmit = (data: FormData) => {
    // Handle submit
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('title')} />
      {errors.title && <span>{errors.title.message}</span>}
    </form>
  );
};
```

### Animation Examples

```typescript
import { motion } from 'framer-motion';

// Fade in
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.3 }}
>
  Content
</motion.div>

// Slide in
<motion.div
  initial={{ x: -100 }}
  animate={{ x: 0 }}
  transition={{ type: 'spring', stiffness: 300 }}
>
  Content
</motion.div>

// Scale
<motion.div
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
  Clickable
</motion.div>
```

### Styling with Tailwind

```typescript
// Conditional classes
import { cn } from '@/lib/utils';

<div className={cn(
  'base-classes',
  isActive && 'active-classes',
  isPriority && 'priority-classes'
)}>
  Content
</div>

// Dark mode
<div className="bg-white dark:bg-slate-900 text-black dark:text-white">
  Works in both themes
</div>
```

### Testing Components

```typescript
import { render, screen } from '@testing-library/react';
import { TaskCard } from './TaskCard';

describe('TaskCard', () => {
  it('renders task title', () => {
    render(<TaskCard task={mockTask} />);
    expect(screen.getByText('Task Title')).toBeInTheDocument();
  });
  
  it('calls onClick handler', () => {
    const handleClick = jest.fn();
    render(<TaskCard task={mockTask} onClick={handleClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalled();
  });
});
```

---

## Common Development Tasks

### Add a New Feature

```bash
# 1. Create backend endpoint
# - Create controller method
# - Create service method
# - Add route with middleware
# - Test with Postman/curl

# 2. Create frontend component
# - Build UI component
# - Add TypeScript types
# - Connect to API reducer/query
# - Add to appropriate page

# 3. Test everything
npm run test              # backend
npm run test             # frontend

# 4. Commit
git add .
git commit -m "feat: implement new feature"
git push origin feature-branch
```

### Fix a Bug

```bash
# 1. Create bug branch
git checkout -b fix/bug-description

# 2. Locate bug
# - Add console logs if needed
# - Check browser/server logs
# - Use debugger

# 3. Fix bug
# - Make minimal changes
# - Add tests to prevent regression
# - Test locally

# 4. Commit
git commit -m "fix: brief description of fix"
git push origin fix/bug-description
```

### Run Full Test Suite

```bash
# Backend
cd backend
npm run lint
npm run test
npm run type-check

# Frontend
cd ../frontend
npm run lint
npm run test
npm run type-check

# All good? Commit and push
```

### Deploy to Production

```bash
# 1. Make sure all tests pass
npm run test

# 2. Build production
npm run build

# 3. Deploy
# Backend: Push to main, GitHub Actions deploys to Heroku
# Frontend: Push to main, Vercel auto-deploys

# 4. Verify deployment
# Check production URLs
# Monitor error tracking
```

---

## Debugging & Troubleshooting

### Frontend Debugging

```bash
# 1. Chrome DevTools
# - F12 to open
# - Console tab for logs
# - Network tab for API calls
# - Application tab for LocalStorage

# 2. React DevTools
# - Install browser extension
# - Check component props/state
# - Profile performance

# 3. VS Code Debugger
# - Set breakpoints
# - Press F5 to debug
# - Step through code

# 4. Common issues
npm install              # If dependencies missing
npm run build           # If build fails
rm -rf .next node_modules  # Nuclear option
```

### Backend Debugging

```bash
# 1. Enable debug logging
DEBUG=app:* npm run dev

# 2. Check database
npx prisma studio     # Visual DB explorer
psql task_manager     # PostgreSQL CLI

# 3. Check Redis
redis-cli            # Redis command line

# 4. API testing
curl -X GET http://localhost:3000/api/tasks \
  -H "Authorization: Bearer YOUR_TOKEN"

# 5. Server logs
# Watch stdout/stderr in terminal
```

### Common Issues

| Issue | Solution |
|-------|----------|
| Port 3000 already in use | `kill -9 $(lsof -t -i:3000)` or use different port |
| Database connection failed | Check DATABASE_URL, ensure PostgreSQL running |
| Prisma client errors | Run `npm run prisma:generate` |
| Module not found | Run `npm install` and check import paths |
| TypeScript errors | Run `npm run type-check` to see all errors |
| Tests failing | Clear cache: `npm run test -- --clearCache` |
| Build failing | Delete node_modules: `rm -rf node_modules && npm install` |

---

## Git Workflow

### Branch Naming Convention

```bash
# Feature branch
git checkout -b feature/feature-name

# Bug fix branch
git checkout -b fix/bug-name

# Hotfix branch (production)
git checkout -b hotfix/critical-issue

# Release branch
git checkout -b release/v1.0.0
```

### Commit Message Format

```
type(scope): subject

type: feat, fix, docs, style, refactor, perf, test, chore
scope: component/service/module name
subject: brief description (imperative mood)

Example:
feat(tasks): add task filtering by priority

Add filtering capability to task list.
Updated TaskService and TaskController.
Added unit tests for new functionality.

Closes #123
```

### Pull Request Process

```bash
# 1. Create feature branch
git checkout -b feature/my-feature

# 2. Make changes and commit
git add .
git commit -m "feat(scope): description"

# 3. Push to remote
git push origin feature/my-feature

# 4. Create pull request on GitHub
# - Fill out PR template
# - Reference related issues
# - Request reviewers

# 5. Address review comments
# - Make requested changes
# - Commit and push
# - Don't create new PR

# 6. Merge when approved
# - Use "Squash and merge" for clean history
# - Delete branch after merge
```

---

## Performance Tips

### Frontend
- Use `React.memo` for expensive components
- Implement code splitting with `dynamic()`
- Use `next/image` for optimized images
- Memoize callbacks with `useCallback`
- Memoize values with `useMemo`
- Use virtual scrolling for long lists
- Lazy load modals and routes

### Backend
- Add database indexes on frequently queried fields
- Cache responses with Redis
- Use database connection pooling
- Implement pagination (default 20 items)
- Use selective field loading (projection)
- Implement rate limiting
- Monitor query performance

### General
- Monitor bundle size
- Use CDN for static assets
- Compress responses (gzip/brotli)
- Monitor API latency
- Track error rates
- Profile regularly

---

## Resources

### Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [Express Documentation](https://expressjs.com)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [React Query](https://tanstack.com/query/latest)
- [Framer Motion](https://www.framer.com/motion/)

### Tools
- [Postman](https://www.postman.com/) - API testing
- [pgAdmin](https://www.pgadmin.org/) - PostgreSQL UI
- [Redis-CLI](https://redis.io/docs/connect/cli/) - Redis management
- [Vercel](https://vercel.com/) - Frontend hosting
- [Sentry](https://sentry.io/) - Error tracking

### Learning
- TypeScript Deep Dive
- Clean Code by Robert C. Martin
- Design Patterns
- SOLID Principles
- API Design Best Practices

---

## Quick Checklists

### Before Committing
- [ ] Tests passing (`npm test`)
- [ ] No linting errors (`npm run lint`)
- [ ] TypeScript types correct (`npm run type-check`)
- [ ] Code formatted (`npm run format`)
- [ ] Console has no errors/warnings
- [ ] Changes tested locally
- [ ] Commit message is descriptive

### Before Pushing
- [ ] Pull latest from main
- [ ] Resolve any conflicts
- [ ] Tests still passing
- [ ] Build succeeds (`npm run build`)
- [ ] No sensitive data in commits
- [ ] Branch name is clear

### Before Merging to Production
- [ ] All tests passing
- [ ] Code reviewed by peer
- [ ] No critical warnings
- [ ] Performance acceptable
- [ ] Security check passed
- [ ] Database migrations tested
- [ ] Rollback plan documented

---

**Last Updated:** April 2026
**Questions?** Check the main README.md or ask in team chat
