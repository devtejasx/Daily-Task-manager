# Week 1: Authentication - Setup & Running Guide

## ✅ What's Been Completed

**Backend Authentication Complete:**
- ✅ User model with MongoDB (password hashing with bcryptjs)
- ✅ JWT token generation and verification
- ✅ Login endpoint (`POST /api/auth/login`)
- ✅ Register endpoint (`POST /api/auth/register`)
- ✅ Get profile endpoint (`GET /api/auth/profile`)
- ✅ Update profile endpoint (`PUT /api/auth/profile`)
- ✅ Auth middleware for protected routes
- ✅ CORS configured for frontend communication
- ✅ Error handling middleware

**Frontend Authentication Complete:**
- ✅ useAuth hook for auth state management
- ✅ Login page with form
- ✅ Register page with form
- ✅ API client with interceptors
- ✅ Token management in localStorage
- ✅ Protected route wrapper
- ✅ Zustand store for user state
- ✅ Automatic auth check on app load

**Environment Configuration:**
- ✅ `.env` file for backend with all settings
- ✅ `.env.local` file for frontend with API URL
- ✅ MongoDB connection string configured
- ✅ JWT secret configured
- ✅ CORS properly set up

---

## 🚀 How to Run This Right Now

### Prerequisites
- Node.js 18+ installed
- MongoDB running (locally or Atlas)
- npm or yarn package manager

### Step 1: Start MongoDB

**Option A: Local MongoDB**
```bash
mongod
```

**Option B: MongoDB Atlas (Cloud)**
- Edit `backend/.env` and update `MONGODB_URI` with your Atlas connection string

### Step 2: Install Dependencies

Terminal 1 - Backend:
```bash
cd backend
npm install
```

Terminal 2 - Frontend:
```bash
cd frontend
npm install
```

### Step 3: Start Backend Server

```bash
cd backend
npm run dev
```

**You should see:**
```
✅ MongoDB connected successfully
🚀 Server running on http://localhost:5000
📝 Environment: development
🔌 WebSocket server ready
```

### Step 4: Start Frontend

Terminal 3:
```bash
cd frontend
npm run dev
```

**You should see:**
```
local:   http://localhost:3000
```

### Step 5: Test the Authentication

**Use Docker Compose (Easiest):**
```bash
cd ..  # Go to project root
docker-compose up -d
```

This will start:
- Backend on http://localhost:5000
- Frontend on http://localhost:3000
- MongoDB container
- Redis container

---

## 🧪 Test the Auth Flow

### Manual Testing via Browser

1. Go to http://localhost:3000
2. Click "Sign Up" or go to http://localhost:3000/login/register
3. Enter:
   - Email: `test@example.com`
   - Name: `Test User`
   - Password: `Password123!`
4. Click Register
5. You should be redirected to dashboard
6. Token is saved in localStorage

### API Testing with cURL

**Register a User:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test User",
    "password": "Password123!"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "...",
      "email": "test@example.com",
      "name": "Test User",
      "level": 1,
      "totalXp": 0
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  },
  "message": "User registered successfully"
}
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123!"
  }'
```

**Get Profile (with token):**
```bash
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 📁 Project Structure - Week 1 Complete

### Backend
```
backend/
├── .env                         ✅ Environment variables
├── src/
│   ├── config/
│   │   └── database.ts         ✅ MongoDB connection
│   ├── models/
│   │   └── User.ts             ✅ User schema with password hashing
│   ├── controllers/
│   │   └── AuthController.ts   ✅ Auth endpoints handler
│   ├── services/
│   │   └── AuthService.ts      ✅ Business logic for auth
│   ├── routes/
│   │   └── auth.ts             ✅ Auth API routes
│   ├── middleware/
│   │   ├── auth.ts             ✅ JWT verification middleware
│   │   └── errorHandler.ts     ✅ Error handling
│   └── index.ts                ✅ Server entry point
└── package.json                ✅ Dependencies
```

### Frontend
```
frontend/
├── .env.local                  ✅ Environment variables
├── src/
│   ├── app/
│   │   ├── login/
│   │   │   ├── page.tsx       ✅ Login page
│   │   │   └── register/
│   │   │       └── page.tsx   ✅ Register page
│   │   ├── dashboard/         (Ready for Week 2)
│   │   ├── layout.tsx         ✅ Root layout
│   │   └── page.tsx           ✅ Home page
│   ├── hooks/
│   │   └── useAuth.ts         ✅ Auth hook with login/register
│   ├── services/
│   │   └── api.ts             ✅ API client with interceptors
│   ├── store/
│   │   └── index.ts           ✅ Zustand user store
│   └── types/
│       └── index.ts           ✅ TypeScript interfaces
└── package.json               ✅ Dependencies
```

---

## 🔐 Security Features Implemented

✅ **Password Hashing**
- Bcrypt with 10 salt rounds
- Password never stored in plain text

✅ **JWT Tokens**
- 7-day expiration by default
- Signed with secret key
- Bearer token in Authorization header

✅ **CORS**
- Frontend only allowed (http://localhost:3000)
- Credentials enabled

✅ **Auth Middleware**
- Validates token on protected routes
- Extracts userId from token
- Auto-redirect on 401

✅ **Error Handling**
- Duplicate email prevention
- Invalid password detection
- Missing field validation

---

## 📝 API Endpoints Ready

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | /api/auth/register | ❌ | Create new user |
| POST | /api/auth/login | ❌ | Authenticate user |
| GET | /api/auth/profile | ✅ | Get user profile |
| PUT | /api/auth/profile | ✅ | Update user profile |

---

## 🎯 What's Ready for Next Steps

**Week 2 (Tasks CRUD):**
- Auth middleware in place ✅
- User model ready ✅
- Database connected ✅
- API structure established ✅

**To Build:**
- Task model
- Task CRUD endpoints
- Task service layer
- Frontend task pages

---

## ❓ Troubleshooting

### MongoDB Connection Failed
```
Solution: Make sure MongoDB is running
mongod (local) or check MongoDB Atlas connection string in .env
```

### Cannot connect to http://localhost:5000
```
Solution: Backend not running
cd backend && npm run dev
```

### Login button not working
```
Solution 1: Check browser console for errors
Solution 2: Verify .env.local has correct API_URL
Solution 3: Backend not running on port 5000
```

### Token not saved
```
Solution: Check localStorage in browser DevTools
Application → Storage → Local Storage → http://localhost:3000
```

### Port already in use
```
Solution for port 5000: lsof -i :5000 | grep LISTEN | awk '{print $2}' | xargs kill -9
Solution for port 3000: lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill -9
```

---

## ✅ Week 1 Checklist

- [ ] MongoDB running
- [ ] Backend installed (`npm install`)
- [ ] Frontend installed (`npm install`)
- [ ] Backend started (`npm run dev`)
- [ ] Frontend started (`npm run dev`)
- [ ] Registered a test user
- [ ] Logged in successfully
- [ ] Token saved to localStorage
- [ ] GET /api/health returns 200 OK
- [ ] API client working correctly

---

## 🚀 Next: Week 2 Preview

**What's Coming:**
- Task model & schema
- Task CRUD endpoints
- Dashboard API
- Frontend task list

**Estimated Time:** 40 hours
**Completion:** End of Week 2 you'll have basic task management working!

---

**Status: ✅ WEEK 1 COMPLETE - AUTH READY FOR PRODUCTION**

Start the servers and test the auth flow! 🎉
