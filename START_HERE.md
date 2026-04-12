# 🎯 WEEK 1 QUICK START - Copy & Paste Commands

Ready to run the application? Just copy and paste these commands!

---

## **Terminal 1: Backend Setup & Start**

```bash
# Navigate to project
cd "TASK MANAGER"

# Go to backend
cd backend

# Install dependencies (first time only)
npm install

# Start development server with auto-reload
npm run dev
```

**Wait for this message:**
```
✅ MongoDB connected successfully
🚀 Server running on http://localhost:5000
```

---

## **Terminal 2: Frontend Setup & Start**

```bash
# Navigate to project (from new terminal)
cd "TASK MANAGER"

# Go to frontend
cd frontend

# Install dependencies (first time only)
npm install

# Start development server
npm run dev
```

**Wait for this message:**
```
▲ Next.js 14.x.x
ready on http://localhost:3000
```

---

## **Terminal 3: MongoDB (if running locally)**

```bash
# If you have MongoDB installed locally
mongod
```

**Or use Docker:**
```bash
cd "TASK MANAGER"
docker-compose up -d
```

---

## 🌐 Access the Application

🎯 **Open your browser:**
```
http://localhost:3000
```

---

## ✅ Quick Verification

### 1. Health Check
```bash
curl http://localhost:5000/api/health
```
Should return: `{"status":"ok"}`

### 2. Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test User",
    "password": "Password123!"
  }'
```

### 3. View in Browser
1. Go to http://localhost:3000
2. Click "Sign Up" or go to http://localhost:3000/login/register
3. Enter email, name, password
4. Click Register
5. Should redirect to dashboard

---

## 📊 What's Running

| Service | URL | Status |
|---------|-----|--------|
| Backend API | http://localhost:5000 | ✅ Running |
| Frontend | http://localhost:3000 | ✅ Running |
| MongoDB | localhost:27017 | ✅ Running |
| API Health | http://localhost:5000/api/health | ✅ Ready |

---

## 🛑 Stop Services

```bash
# Press Ctrl+C in each terminal to stop
# This stops: Backend, Frontend, MongoDB
```

---

## 🔄 Next Time You Run

```bash
# Terminal 1
cd "TASK MANAGER"/backend && npm run dev

# Terminal 2 (new terminal)
cd "TASK MANAGER"/frontend && npm run dev

# Terminal 3 (if needed)
mongod
```

*(No need to run `npm install` again)*

---

## 🆘 Troubleshooting

### Backend won't start: "Port 5000 already in use"
```bash
# Kill the process
lsof -i :5000 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Then retry npm run dev
```

### Frontend won't start: "Port 3000 already in use"
```bash
# Kill the process
lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Then retry npm run dev
```

### MongoDB connection failed
```bash
# Make sure MongoDB is running
mongod

# OR use Docker
docker-compose up -d
```

### Still having issues?
Check full troubleshooting in **[WEEK_1_SETUP_GUIDE.md](WEEK_1_SETUP_GUIDE.md)**

---

## 📚 Documentation Files

- **[WEEK_1_COMPLETE_SUMMARY.md](WEEK_1_COMPLETE_SUMMARY.md)** ← Start here for overview
- **[WEEK_1_SETUP_GUIDE.md](WEEK_1_SETUP_GUIDE.md)** ← Detailed setup instructions
- **[WEEK_1_TESTING_CHECKLIST.md](WEEK_1_TESTING_CHECKLIST.md)** ← Step-by-step testing
- **[WEEK_1_API_REFERENCE.md](WEEK_1_API_REFERENCE.md)** ← Complete API docs

---

## ✨ You're All Set!

The application is **100% ready to run**. Just execute the commands above and you'll have:

✅ Authentication system working  
✅ User registration & login working  
✅ Database connected  
✅ Frontend running  
✅ Backend API running  

**Happy coding!** 🚀
