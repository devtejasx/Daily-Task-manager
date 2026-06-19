# Quick Start Guide

## ⚡ Get Running in 5 Minutes

### Prerequisites Check
- Node.js 18+
- npm or yarn
- MongoDB (local or MongoDB Atlas)
- Redis (optional, local or cloud)

### 1️⃣ Clone or Setup Project

```bash
cd "TASK MANAGER"
```

### 2️⃣ Run Setup Script

**Windows:**
```bash
setup.bat
```

**macOS/Linux:**
```bash
bash setup.sh
```

### 3️⃣ Configure Environment

The setup script created `backend/.env`.  Edit it now:

```env
MONGODB_URI=mongodb://localhost:27017/task-manager
JWT_SECRET=your_super_secret_key_min_32_chars
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
REDIS_URL=redis://localhost:6379
```

### 4️⃣ Start Development

**Option A: Docker (Recommended)**
```bash
docker-compose up -d
```
Then visit http://localhost:3000

**Option B: Manual**
Make sure MongoDB and Redis are running, then:

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

Visit http://localhost:3000

### 5️⃣ Create First Task

1. Click "Get Started Free"
2. Register account
3. Click "+ New Task"
4. Create a task
5. Mark as complete to earn XP!

---

## 📚 Common Commands

### Frontend
```bash
cd frontend

npm run dev              # Start dev server
npm run build           # Production build
npm run start           # Start production  
npm run lint            # Run linter
npm test               # Run tests
```

### Backend
```bash
cd backend

npm run dev             # Start with auto-reload
npm run build          # Compile TypeScript
npm start              # Run compiled version
npm test               # Run tests
npm run lint           # Lint code
```

### Docker
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs backend
docker-compose logs frontend

# Stop services
docker-compose down

# Rebuild images
docker-compose build

# Full restart
docker-compose down && docker-compose up -d
```

---

## 🔍 Verify Setup

### Backend Health
```bash
curl http://localhost:5000/api/health
# Should return: { "status": "ok", "timestamp": "...", "environment": "development" }
```

### MongoDB Connection
```bash
# In backend console logs, should see:
# ✅ MongoDB connected successfully
```

### Frontend Loads
```
http://localhost:3000
# Should show TaskMaster home page
```

---

## 🆘 Quick Troubleshooting

### Port Already in Use
```bash
# Kill port 3000
lsof -ti:3000 | xargs kill -9

# Kill port 5000
lsof -ti:5000 | xargs kill -9
```

### MongoDB Won't Connect
```bash
# Verify MongoDB is running
mongosh

# Check connection string matches your setup
# Local: mongodb://localhost:27017/task-manager
# Atlas: mongodb+srv://user:pass@cluster.mongodb.net/task-manager
```

### Redis Connection Error
```bash
# Check Redis is running
redis-cli ping  # Should return PONG

# Or skip Redis (not required for Phase 1)
```

### Dependencies Missing
```bash
# Clean reinstall
rm -rf node_modules
npm install

# Backend
cd backend && npm install && cd ..

# Frontend  
cd frontend && npm install && cd ..
```

### Clear Build Cache
```bash
# Frontend
rm -rf frontend/.next

# Backend
rm -rf backend/dist
```

---

## 📖 Useful Resources

| Resource | Link |
|----------|------|
| Full Documentation | [README.md](/README.md) |
| Installation Guide | [docs/INSTALLATION.md](/docs/INSTALLATION.md) |
| Architecture | [docs/ARCHITECTURE.md](/docs/ARCHITECTURE.md) |
| Roadmap | [docs/DEVELOPMENT_PHASES.md](/docs/DEVELOPMENT_PHASES.md) |
| API Docs | Coming in Phase 2 |

---

## 🎯 Next Steps After Setup

1. **Explore the Dashboard**
   - Create a few tasks
   - Mark tasks complete
   - Watch XP increase

2. **Check the Code**
   - Frontend: `frontend/src/app/page.tsx`
   - Backend: `backend/src/index.ts`
   - Services: `backend/src/services/`

3. **Try Dark Mode**
   - Click theme toggle (coming soon)
   - Stored in local preferences

4. **Create Multiple Tasks**
   - Try different priorities
   - Try different categories
   - See dashboard update

5. **Read Docs**
   - Check DEVELOPMENT_PHASES.md for features being built
   - Read ARCHITECTURE.md to understand structure

---

## 💡 Pro Tips

- **Auto-reload Dev Servers**: Both frontend and backend watch for changes
- **Keyboard Shortcuts**: Check docs for shortcuts (coming in Phase 2)
- **Offline Support**: Tasks are cached locally (coming in Phase 2)
- **Dark Mode**: Built in, toggle in settings (coming in Phase 2)
- **Responsive Design**: Works great on mobile browsers

---

## 🆘 Need Help?

- Check [README.md](/README.md) for comprehensive docs
- See [docs/INSTALLATION.md](/docs/INSTALLATION.md) for detailed setup
- Review [docs/DEVELOPMENT_PHASES.md](/docs/DEVELOPMENT_PHASES.md) for features
- Create an issue on GitHub (when repo is public)

---

## ✨ You're All Set!

You now have a fully functional task management application running locally!

**Happy task managing! 🚀**
