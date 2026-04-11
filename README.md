# TaskMaster - Modern Task Manager Application

## 🚀 Overview

TaskMaster is a comprehensive, production-ready task management application combining gamification, AI insights, team collaboration, and seamless cloud synchronization. Built with modern technologies for optimal performance and user experience.

### Key Features

✅ **Core Task Management** - Create, organize, filter, search, and track tasks
✅ **Gamification System** - XP, levels, achievements, streaks, leaderboards  
✅ **Real-time Sync** - Multi-device synchronization with offline support
✅ **Smart Reminders** - Intelligent notification system with multiple channels
✅ **Team Collaboration** - Share tasks, assign work, real-time updates
✅ **Analytics & Insights** - AI-powered productivity analysis
✅ **Dark Mode & Themes** - Customizable UI with multiple themes
✅ **Recurring Tasks** - Smart recurrence patterns and habit tracking
✅ **Rich Editor** - Support for notes, attachments, and comments
✅ **Mobile Responsive** - Beautiful design on all devices

---

## 📋 Project Structure

```
TASK MANAGER/
├── frontend/                    # Next.js React App
│   ├── src/
│   │   ├── app/                # Next.js App Router
│   │   ├── components/         # Reusable React components
│   │   ├── hooks/              # Custom React hooks
│   │   ├── store/              # Zustand state management
│   │   ├── services/           # API clients
│   │   ├── types/              # TypeScript interfaces
│   │   └── lib/                # Utilities
│   ├── public/                 # Static assets
│   ├── package.json
│   ├── next.config.js
│   └── tsconfig.json
│
├── backend/                     # Express API Server
│   ├── src/
│   │   ├── routes/             # API route handlers
│   │   ├── controllers/        # Business logic
│   │   ├── services/           # Core services
│   │   ├── models/             # MongoDB schemas
│   │   ├── middleware/         # Auth, error handling
│   │   ├── config/             # Configuration
│   │   └── utils/              # Helper functions
│   ├── package.json
│   ├── tsconfig.json
│   └── index.ts                # Entry point
│
├── docs/                        # Documentation
├── docker-compose.yml          # Docker configuration
├── Dockerfile                  # Production Docker
├── backend.Dockerfile          # Backend Docker
├── frontend.Dockerfile         # Frontend Docker
├── package.json               # Root workspace config
└── README.md                  # This file
```

---

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **Next.js 14** - React framework with SSR
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Zustand** - State management
- **React Query** - Data fetching
- **React Hook Form** - Form management
- **Recharts** - Charts & analytics
- **Socket.io** - Real-time updates

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **TypeScript** - Type safety
- **MongoDB** - Database
- **Redis** - Caching & real-time
- **JWT** - Authentication
- **Mongoose** - ODM
- **Multer** - File uploads
- **Bull** - Job queue

### DevOps & Deployment
- **Docker** - Containerization
- **Docker Compose** - Local development
- **AWS S3** - File storage
- **Vercel** - Frontend hosting
- **Heroku/Railway** - Backend hosting
- **MongoDB Atlas** - Database hosting

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Redis (local or cloud)
- Docker (optional, for containerization)

### Local Development Setup

#### 1. Clone and Install

```bash
# Navigate to project directory
cd "TASK MANAGER"

# Copy environment variables
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Install dependencies
npm install
```

#### 2. Configure Environment

Edit `backend/.env`:
```env
MONGODB_URI=mongodb://localhost:27017/task-manager
JWT_SECRET=your_development_secret
NODE_ENV=development
```

#### 3. Start Development Servers

**Option A: Using Docker Compose (Recommended)**
```bash
docker-compose up -d
```

Access:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- API Docs: http://localhost:5000/api/health

**Option B: Local Development**

Terminal 1 - Backend:
```bash
cd backend
npm install
npm run dev
```

Terminal 2 - Frontend:
```bash
cd frontend
npm install
npm run dev
```

Terminal 3 - MongoDB (if local):
```bash
mongod
```

### First Steps

1. Visit http://localhost:3000
2. Click "Get Started Free"
3. Register new account
4. Start creating tasks!

---

## 📚 API Documentation

### Base URL
`http://localhost:5000/api`

### Authentication
All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer {token}
```

### Auth Endpoints

#### Register
```
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "securepass123"
}

Response: { token, refreshToken, user }
```

#### Login
```
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepass123"
}

Response: { token, refreshToken, user }
```

#### Get Profile
```
GET /auth/profile
Authorization: Bearer {token}

Response: { user }
```

### Task Endpoints

#### Create Task
```
POST /tasks
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Finish project",
  "description": "Complete the dashboard",
  "dueDate": "2025-12-31",
  "dueTime": "14:00",
  "category": "Work",
  "priority": "High",
  "difficulty": "Medium",
  "estimatedDuration": 120
}

Response: { task }
```

#### Get All Tasks
```
GET /tasks?status=NotStarted&category=Work&priority=High
Authorization: Bearer {token}

Response: { tasks }
```

#### Get Today's Tasks
```
GET /tasks/today
Authorization: Bearer {token}

Response: { tasks }
```

#### Update Task
```
PUT /tasks/{taskId}
Authorization: Bearer {token}

{
  "status": "InProgress",
  "priority": "Critical"
}

Response: { task }
```

#### Complete Task
```
POST /tasks/{taskId}/complete
Authorization: Bearer {token}

Response: { task, achievements, xpEarned }
```

#### Delete Task
```
DELETE /tasks/{taskId}
Authorization: Bearer {token}

Response: { success: true }
```

#### Search Tasks
```
GET /tasks/search?q=project
Authorization: Bearer {token}

Response: { tasks }
```

---

## 🎮 Gamification System

### XP & Levels

**XP Rewards:**
- Complete task: 50 XP base
- On-time completion: +20% bonus
- Early completion: +10-50% bonus
- High priority: +50% multiplier
- Critical priority: +100% multiplier

**Level Progression:**
```
Level 1-2: 100 XP
Level 2-3: 250 XP
Level 3-4: 450 XP
Level 4-5: 700 XP
Level 5-10: 1000 XP each
Level 10-20: 2000 XP each
Level 20-50: 5000 XP each
Level 50+: 10000 XP each
```

### Achievements

**Completion Badges:**
- 🎯 Overachiever - 100 tasks
- 🏆 Perfectionist -50 on-time tasks
- 🚀 Speedster - 10 tasks completed in 1/4 time

**Consistency Badges:**
- 📅 First Streak - 7-day streak
- 🔥 Habitual - 30-day streak
- 💪 Unstoppable - 100-day streak

**Mastery Badges:**
- 💼 Work Master - 25 work tasks
- 💪 Fitness Champion - 25 fitness tasks
- 📚 Study Guru - 25 study tasks

---

## 🔧 Development

### Frontend Development

Create new component:
```bash
# Add component file in src/components/
# Example: src/components/MyComponent.tsx
```

Create new page:
```bash
# Use Next.js App Router in src/app/
# Example: src/app/my-page/page.tsx
```

Add custom hook:
```bash
# Add to src/hooks/
# Example: src/hooks/useMyHook.ts
```

### Backend Development

Add new route:
```bash
# 1. Create controller in src/controllers/
# 2. Create service in src/services/
# 3. Add route in src/routes/
# 4. Import in index.ts
```

Add database model:
```bash
# Create in src/models/
# Export from index.ts
```

### Building for Production

Frontend:
```bash
cd frontend
npm run build
npm start
```

Backend:
```bash
cd backend
npm run build
npm start
```

---

## 🧪 Testing

### Frontend Tests
```bash
cd frontend
npm test
npm run test:watch
```

### Backend Tests
```bash
cd backend
npm test
npm run test:watch
```

### E2E Tests
```bash
npm run test:e2e
```

---

## 📦 Deployment

### Frontend (Vercel - Recommended)

```bash
# Connect GitHub repo to Vercel
# Set environment variables in Vercel dashboard
# Auto-deploys on push to main branch
```

### Backend (Heroku)

```bash
# Install Heroku CLI
heroku login

# Create app
heroku create task-manager-api

# Set environment variables
heroku config:set MONGODB_URI=your_mongodb_atlas_uri
heroku config:set JWT_SECRET=your_secret

# Deploy
git push heroku main
```

### Database (MongoDB Atlas)

1. Create account at mongodb.com/cloud/atlas
2. Create cluster
3. Get connection string
4. Add to `.env` as `MONGODB_URI`

### File Storage (AWS S3)

1. Create S3 bucket
2. Get access keys
3. Configure in backend `.env`:
```env
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
AWS_S3_BUCKET=task-manager-uploads
```

---

## 🔐 Security

- HTTPS/TLS for all communications
- JWT token authentication
- Password hashing with bcryptjs
- Environment variable encryption
- CORS protection
- Rate limiting on auth endpoints
- SQL injection prevention (MongoDB)
- XSS protection with Content Security Policy

---

## 📝 Environment Variables

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Backend (.env)
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/task-manager
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_super_secret_key
FRONTEND_URL=http://localhost:3000
```

---

## 🐛 Troubleshooting

### MongoDB Connection Failed
- Ensure MongoDB is running locally or check Atlas connection string
- Verify `MONGODB_URI` in `.env`

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Kill process on port 5000
lsof -ti:5000 | xargs kill -9
```

### Redis Connection Error
- Ensure Redis is running (`redis-server`)
- Check `REDIS_URL` in backend `.env`

### API Requests Failing
- Check backend console for errors
- Verify JWT token is valid
- Check CORS configuration

---

## 📞 Support & Contributing

### Issues
Found a bug? Open an issue in GitHub!

### Contributing
1. Fork repository
2. Create feature branch
3. Make changes
4. Submit pull request

---

## 📄 License

MIT License - see LICENSE file for details

---

## 🎯 Roadmap

### Phase 1 (Complete) ✅
- Core task management
- Basic dashboard
- Authentication

### Phase 2 (In Progress) 🚀
- Gamification system
- Advanced analytics
- Dark mode

### Phase 3 (Planned) 📅
- Team collaboration
- AI suggestions
- Mobile app

### Phase 4 (Planned) 🔮
- Voice input
- Advanced scheduling
- Integrations

---

**Last Updated:** December 2024
**Version:** 1.0.0
**Status:** Production Ready
