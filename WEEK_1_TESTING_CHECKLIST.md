# Week 1 Authentication - Quick Testing Checklist

## Pre-Flight Checklist

### Environment Setup
- [ ] **Backend .env exists** → Check `backend/.env` has JWT_SECRET and MONGODB_URI
- [ ] **Frontend .env exists** → Check `frontend/.env.local` has NEXT_PUBLIC_API_URL
- [ ] **MongoDB running** → `mongod` or Docker container active

### Dependencies
- [ ] **Backend deps installed** → `backend/node_modules/` exists
- [ ] **Frontend deps installed** → `frontend/node_modules/` exists

---

## Server Startup Verification

### Backend (Terminal 1)
```bash
cd backend
npm run dev
```

✅ **Success Indicators:**
- [ ] No TypeScript errors
- [ ] "🚀 Server running on http://localhost:5000" message
- [ ] "✅ MongoDB connected successfully" message
- [ ] No port already in use errors

### Frontend (Terminal 2)
```bash
cd frontend
npm run dev
```

✅ **Success Indicators:**
- [ ] No build errors
- [ ] "Local: http://localhost:3000" message
- [ ] Ready state shows in terminal

---

## API Health Check

### Test 1: Health Endpoint (No Auth Required)
```bash
curl -v http://localhost:5000/api/health
```

✅ **Expected Response:**
- HTTP Status: **200 OK**
- Body: `{"status":"ok"}`

---

## Authentication Tests

### Test 2: User Registration

**Command:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "name": "Test User",
    "password": "SecurePassword123!"
  }'
```

✅ **Expected Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "some-mongo-id",
      "email": "testuser@example.com",
      "name": "Test User",
      "level": 1,
      "totalXp": 0,
      "streak": 0
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "User registered successfully"
}
```

**Save the token:** You'll need it for the next test.

❌ **If Registration Fails:**
- [ ] Check backend console for detailed error
- [ ] Verify MongoDB is running
- [ ] Check .env file has MONGODB_URI set

---

### Test 3: User Login

**Command:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "SecurePassword123!"
  }'
```

✅ **Expected Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "...",
      "email": "testuser@example.com",
      "name": "Test User"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Login successful"
}
```

---

### Test 4: Get User Profile (Protected Route)

**Command:**
```bash
# Replace YOUR_TOKEN with actual token from registration
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

✅ **Expected Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "email": "testuser@example.com",
    "name": "Test User",
    "level": 1,
    "totalXp": 0,
    "theme": "dark",
    "createdAt": "2024-01-XX..."
  }
}
```

---

### Test 5: Missing Authorization Header

**Command:**
```bash
curl -X GET http://localhost:5000/api/auth/profile
```

❌ **Expected Response (401 Unauthorized):**
```json
{
  "success": false,
  "message": "No token provided"
}
```

---

### Test 6: Invalid Token

**Command:**
```bash
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer invalid.token.here"
```

❌ **Expected Response (401 Unauthorized):**
```json
{
  "success": false,
  "message": "Invalid token"
}
```

---

## Browser Testing (UI)

### Test 7: Registration Page
- [ ] Navigate to http://localhost:3000/login/register
- [ ] Fill in: Email, Name, Password
- [ ] Click "Sign Up"
- [ ] Should redirect to dashboard
- [ ] Open DevTools → Application → Local Storage
- [ ] Check `token` key exists

### Test 8: Login Page
- [ ] Navigate to http://localhost:3000/login
- [ ] Enter credentials from Test 7
- [ ] Click "Login"
- [ ] Should redirect to dashboard

### Test 9: Protected Route
- [ ] Navigate to http://localhost:3000/dashboard
- [ ] Should show user data (if logged in)
- [ ] Clear localStorage and refresh
- [ ] Should redirect to /login

---

## Debugging Commands

### Check if Port 5000 is in Use
```bash
# macOS/Linux
lsof -i :5000

# Windows
netstat -ano | findstr :5000
```

### Check if Port 3000 is in Use
```bash
# macOS/Linux
lsof -i :3000

# Windows
netstat -ano | findstr :3000
```

### Kill Process on Port 5000
```bash
# macOS/Linux
kill -9 $(lsof -t -i:5000)

# Windows
taskkill /PID <PID> /F
```

### View MongoDB Connection
```bash
# In backend terminal, look for:
# ✅ MongoDB connected to mongodb://localhost:27017/task_manager
```

### Check Environment Variables
```bash
# Backend
cat backend/.env | grep JWT_SECRET
cat backend/.env | grep MONGODB_URI

# Frontend  
cat frontend/.env.local | grep NEXT_PUBLIC_API_URL
```

---

## Common Errors & Solutions

### Error: "MongoDB connection failed"
**Cause:** MongoDB not running or wrong URI
**Solution:** 
```bash
# Start MongoDB locally
mongod

# OR use MongoDB Atlas
# Update MONGODB_URI in backend/.env with your Atlas connection string
```

### Error: "PORT 5000 already in use"
**Cause:** Another process using port 5000
**Solution:** Kill existing process
```bash
# Find process
lsof -i :5000

# Kill by PID
kill -9 <PID>
```

### Error: "Cannot find module 'tsx'"
**Cause:** Dependencies not installed
**Solution:**
```bash
cd backend
npm install
```

### Error: "getaddrinfo ENOTFOUND mongodb"
**Cause:** MongoDB service not running or hostname wrong
**Solution:** 
- Ensure MongoDB running
- Check MONGODB_URI in .env is correct
- Default: `mongodb://localhost:27017/task_manager`

### Error: "401 Invalid token"
**Cause:** Using expired or malformed token
**Solution:**
- Get new token from /auth/login
- Ensure Bearer scheme included: `Authorization: Bearer <token>`

### Error: "CORS error in browser console"
**Cause:** Frontend and backend not communicating
**Solution:**
- Verify backend on http://localhost:5000 ✅
- Verify NEXT_PUBLIC_API_URL in frontend/.env.local
- Restart both servers

---

## Success Criteria

All tests should pass:

| # | Test | Status |
|---|------|--------|
| 1 | Health check returns 200 | ✅ / ❌ |
| 2 | Registration creates user & token | ✅ / ❌ |
| 3 | Login returns token | ✅ / ❌ |
| 4 | Profile access with token works | ✅ / ❌ |
| 5 | No token returns 401 | ✅ / ❌ |
| 6 | Invalid token returns 401 | ✅ / ❌ |
| 7 | Register page loads | ✅ / ❌ |
| 8 | Login page works | ✅ / ❌ |
| 9 | Protected routes redirect | ✅ / ❌ |

**If all pass:** ✅ **Week 1 Authentication Complete!**

**If any fail:** Review the "Common Errors & Solutions" section above.

---

## Next Steps After Verification

Once all tests pass:
1. **Week 2:** Start building Task CRUD endpoints
2. **Week 3:** Add Task features (priority, deadlines, etc.)
3. **Week 4:** Implement Team collaboration

🚀 **You're ready to build!**
