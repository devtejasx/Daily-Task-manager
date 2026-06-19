# Installation & Deployment Guide

## 🛠️ Prerequisites

Before starting, ensure you have:
- Node.js v18 or higher
- npm or yarn
- MongoDB database (local or MongoDB Atlas)
- Redis instance (local or Redis Cloud)
- Git

## 📥 Installation

### Step 1: Clone/Setup Project

```bash
# Navigate to project directory
cd "TASK MANAGER"

# Initialize git (if new)
git init
git add .
git commit -m "Initial commit"
```

### Step 2: Install Dependencies

```bash
# Install root workspace dependencies
npm install

# Install frontend dependencies
cd frontend && npm install && cd ..

# Install backend dependencies
cd backend && npm install && cd ..
```

### Step 3: Setup Environment Variables

**Backend Setup:**
```bash
cd backend

# Copy example env
cp .env.example .env

# Edit .env with your settings
# Important variables:
# - MONGODB_URI: Your MongoDB connection string
# - JWT_SECRET: Your secret key (min 32 characters)
# - REDIS_URL: Your Redis connection
# - AWS credentials (optional, for S3)
```

**Frontend Setup:**
```bash
cd ../frontend

# Copy example env
cp .env.example .env

# Typically no changes needed for local dev
# Backend URL should match your backend setup
```

### Step 4: Database Setup

#### Option A: Local MongoDB

```bash
# Install MongoDB (macOS with Homebrew)
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community

# Verify connection
mongosh
```

#### Option B: MongoDB Atlas (Cloud)

1. Go to mongodb.com/cloud/atlas
2. Create free account
3. Create a cluster
4. Get connection string
5. Add to backend `.env`:
```env
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/task-manager?retryWrites=true&w=majority
```

### Step 5: Redis Setup

#### Option A: Local Redis

```bash
# Install Redis (macOS with Homebrew)
brew install redis

# Start Redis
brew services start redis

# Verify
redis-cli ping  # Should return PONG
```

#### Option B: Redis Cloud

1. Go to redis.com/try-free
2. Sign up and create database
3. Get connection URL
4. Add to backend `.env`:
```env
REDIS_URL=redis://:password@host:port
```

## 🚀 Running Locally

### Option A: Docker Compose (Recommended)

```bash
# Ensure Docker is running

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Access:
# - Frontend: http://localhost:3000
# - Backend: http://localhost:5000
# - MongoDB: localhost:27017
# - Redis: localhost:6379
```

### Option B: Manual Local Development

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev

# Backend running on http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev

# Frontend running on http://localhost:3000
```

**Terminal 3 - MongoDB (if local):**
```bash
mongod
```

**Terminal 4 - Redis (if local):**
```bash
redis-server
```

## 🏗️ Building for Production

### Frontend Build

```bash
cd frontend

# Production build
npm run build

# Test production build locally
npm start

# Or use:
env NODE_ENV=production npm start
```

### Backend Build

```bash
cd backend

# Transpile TypeScript to JavaScript
npm run build

# Run production version
npm start
```

## ☁️ Deployment Options

### Option 1: Vercel (Frontend) + Heroku (Backend)

#### Frontend Deployment (Vercel)

1. Push code to GitHub
2. Go to vercel.com
3. Import project
4. Set environment variables:
   ```
   NEXT_PUBLIC_API_URL=https://your-api.herokuapp.com/api
   ```
5. Deploy

#### Backend Deployment (Heroku)

```bash
# Install Heroku CLI
npm i -g heroku

# Login
heroku login

# Create app
heroku create your-app-name

# Set environment variables
heroku config:set MONGODB_URI=your_atlas_uri
heroku config:set JWT_SECRET=your_secret
heroku config:set REDIS_URL=your_redis_url
heroku config:set NODE_ENV=production
heroku config:set FRONTEND_URL=https://your-frontend.vercel.app

# Deploy
git push heroku main

# View logs
heroku logs --tail -a your-app-name
```

### Option 2: AWS (ECS + RDS + Elasticache)

```bash
# Build Docker images
docker build -t task-manager-backend -f backend.Dockerfile .
docker build -t task-manager-frontend -f frontend.Dockerfile .

# Tag for ECR
docker tag task-manager-backend:latest your-registry/task-manager-backend:latest
docker tag task-manager-frontend:latest your-registry/task-manager-frontend:latest

# Push to ECR
docker push your-registry/task-manager-backend:latest
docker push your-registry/task-manager-frontend:latest

# Deploy using ECS task definition
# (Configure via AWS Console or CLI)
```

### Option 3: Railway.app

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Set environment variables
railway variables

# Deploy
railway up
```

### Option 4: Docker Swarm / Kubernetes

```bash
# For Kubernetes deployment:
# Create namespaces, deployments, services, ingress configs
# See kubernetes/ folder for YAML manifests
```

## 📊 Database Migration

### Create Collections & Indexes

```bash
# MongoDB shell
mongosh

# Use your database
use task-manager

# Create indexes for performance
db.tasks.createIndex({ userId: 1, createdAt: -1 })
db.tasks.createIndex({ dueDate: 1, status: 1 })
db.users.createIndex({ email: 1 })
db.notifications.createIndex({ userId: 1, createdAt: -1 })
```

### Backup Database

```bash
# MongoDB backup
mongodump --uri mongodb://localhost:27017/task-manager --out ./backup

# MongoDB restore
mongorestore --uri mongodb://localhost:27017 ./backup
```

## 🔧 Configuration

### Performance Tuning

**Backend:**
```env
# Enable production mode
NODE_ENV=production

# Set appropriate worker count
WORKER_THREADS=4

# Database connection pool
DB_POOL_SIZE=10

# Redis key expiration
REDIS_TTL=3600
```

**Frontend:**
```env
# Enable analytics
NEXT_PUBLIC_GA_ID=your_ga_id

# API timeout
NEXT_PUBLIC_API_TIMEOUT=30000
```

### SSL/TLS Certificate

For production, use Let's Encrypt:

```bash
# Via Heroku (automatic)
heroku certs:auto:enable -a your-app-name

# Via AWS
# Use AWS Certificate Manager (ACM)

# Via Vercel (automatic)
# Vercel automatically provisions SSL certificates
```

## ✅ Verification Checklist

After deployment, verify:

- [ ] Frontend loads without console errors
- [ ] Login/Register works
- [ ] Can create tasks
- [ ] Can complete tasks
- [ ] XP/Level system is working
- [ ] Dark mode toggle works
- [ ] Notifications appear
- [ ] API health check passes (`/api/health`)
- [ ] Database is storing data
- [ ] No console errors in browser
- [ ] No error logs on server
- [ ] HTTPS is configured
- [ ] CORS is working properly
- [ ] Mobile view is responsive

## 🆘 Troubleshooting Common Issues

### Port Already in Use

```bash
# Find process using port
lsof -i :3000
lsof -i :5000

# Kill process
kill -9 <PID>

# Or use different port
PORT=3001 npm run dev
```

### CORS Errors

Check backend `index.ts`:
```typescript
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  })
)
```

### MongoDB Connection Timeout

```bash
# Check connection string
# Verify IP whitelist in MongoDB Atlas
# Ensure network access is configured
```

### Out of Memory

```bash
# Increase Node memory
NODE_OPTIONS=--max_old_space_size=4096 npm start
```

### Build Failures

```bash
# Clear cache and reinstall
rm -rf node_modules
npm install

# Clear Next.js cache
rm -rf frontend/.next

# Rebuild
npm run build
```

## 📈 Monitoring & Logging

### Application Monitoring

```bash
# Use PM2 for process management
npm i -g pm2

# Start app with PM2
pm2 start backend/dist/index.js --name "task-manager-api"

# Monitor
pm2 monit
```

### Error Tracking (Sentry)

```bash
# Add Sentry to backend
npm install @sentry/node

# Configure in index.ts
import * as Sentry from "@sentry/node"
Sentry.init({ dsn: process.env.SENTRY_DSN })
```

### Analytics

```bash
# Frontend: Google Analytics
# Already configured in next.config.js

# Backend: Custom dashboard
# Dashboard coming in Phase 3
```

---

## 📚 Additional Resources

- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Express Production Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Docker Deployment](https://docs.docker.com/guide/)
- [Kubernetes Deployment](https://kubernetes.io/docs/)

---

For more help, check the [README.md](./README.md) or create an issue!
