# 🚀 QUICK START: Deploy in 5 Steps

## Step 1️⃣ Create Cloud Accounts (15 minutes)

### MongoDB Atlas (Database)
```
1. Go to: mongodb.com/cloud/atlas
2. Sign up → Create project
3. Create M0 (FREE) cluster
4. Database Access: Add user "taskmanager" with password
5. Network Access: Add IP 0.0.0.0/0
6. Connect → Get connection string
   Format: mongodb+srv://taskmanager:PASSWORD@CLUSTER.mongodb.net/task-manager
7. Save as MONGODB_URI
```

### Redis Cloud (Cache)
```
1. Go to: redis.com/cloud
2. Sign up → Create database (FREE)
3. Copy Redis URI
   Format: redis://default:PASSWORD@HOST:PORT
4. Save as REDIS_URL
```

---

## Step 2️⃣ Deploy Backend (10 minutes)

### Install Heroku CLI
```bash
# Windows: Download from https://devcenter.heroku.com/articles/nodejs-support
# Mac: brew tap heroku/brew && brew install heroku
# Linux: curl https://cli-assets.heroku.com/heroku-cli/channels/stable/heroku-cli-x64.tar.gz | tar -xz
```

### Deploy
```bash
heroku login
cd backend
heroku create YOUR-APP-NAME-API
# Replace YOUR-APP-NAME with something like: taskmanager-api-john

# Set environment variables
heroku config:set \
  MONGODB_URI="mongodb+srv://taskmanager:PASSWORD@CLUSTER.mongodb.net/task-manager?retryWrites=true&w=majority" \
  REDIS_URL="redis://default:PASSWORD@HOST:PORT" \
  JWT_SECRET="generate-a-strong-random-secret-at-least-32-characters" \
  FRONTEND_URL="https://YOUR-SITE.netlify.app" \
  NODE_ENV="production"

# Deploy
git push heroku main   # or 'master' if mainline is named that

# Get your backend URL
heroku domains
# Example: https://taskmanager-api-john.herokuapp.com
```

🎯 **SAVE THIS URL** - You need it for the frontend

---

## Step 3️⃣ Update Frontend Configuration (5 minutes)

### Edit `frontend/.env.production`
```
NEXT_PUBLIC_API_URL=https://taskmanager-api-john.herokuapp.com/api
NEXT_PUBLIC_WEB_SOCKET_URL=wss://taskmanager-api-john.herokuapp.com
NEXT_PUBLIC_ENVIRONMENT=production
```
Replace `taskmanager-api-john` with your actual Heroku app name

---

## Step 4️⃣ Deploy Frontend (10 minutes)

### Option A: Deploy from GitHub (Recommended)
```
1. Go to: netlify.com
2. Click "Add new site" → "Connect to Git"
3. Select your GitHub repository
4. Build settings:
   - Base directory: (leave blank)
   - Build command: cd frontend && npm run build
   - Publish directory: frontend/.next
5. Click "Deploy"
6. Go to "Site settings" → "Build & deploy" → "Environment"
7. Add variables:
   NEXT_PUBLIC_API_URL=https://YOUR-BACKEND-URL/api
   NEXT_PUBLIC_WEB_SOCKET_URL=wss://YOUR-BACKEND-URL
8. Trigger redeploy
```

### Option B: Deploy Manually
```bash
cd frontend
npm run build
# Drag 'frontend/.next' folder to Netlify
# Or use: netlify deploy --prod --dir=frontend/.next
```

🎯 **GET YOUR FRONTEND URL** (e.g., https://your-site.netlify.app)

---

## Step 5️⃣ Update Backend with Frontend URL (2 minutes)

```bash
cd backend
heroku config:set FRONTEND_URL="https://your-site.netlify.app"
git push heroku main
```

---

## ✅ Test Your Deployment

1. **Open your site**: https://your-site.netlify.app
2. **Register a new user**
3. **Check MongoDB**: Login to MongoDB Atlas → Collections → Should see new user
4. **Login with the user**
5. **Try getting quests** (should work if API is connected)

---

## 🆘 Troubleshooting

### "Cannot reach backend API"
- Check `FRONTEND_URL` matches your Netlify URL
- Check CORS in backend
- Verify MongoDB URI in Heroku settings

### "Backend won't deploy"
```bash
heroku logs --tail   # See what's wrong
git push heroku main --force  # Force push after fixes
```

### "Build fails on Netlify"
- Check `npm run build` works locally first:
  ```bash
  cd frontend
  npm run build
  ```
- Check `.env.production` has correct API URL

### "Database connection error"
- Verify MongoDB Atlas cluster is running
- Check database user created (taskmanager)
- Add Heroku IP to MongoDB Network Access: 0.0.0.0/0

---

## 📋 Environment Variables Quick Reference

### Backend (Heroku)
```
MONGODB_URI=mongodb+srv://taskmanager:PASSWORD@CLUSTER.mongodb.net/task-manager?retryWrites=true&w=majority
REDIS_URL=redis://default:PASSWORD@HOST:PORT
JWT_SECRET=your-strong-random-secret-32-chars-minimum
FRONTEND_URL=https://your-site.netlify.app
NODE_ENV=production
```

### Frontend (Netlify)
```
NEXT_PUBLIC_API_URL=https://your-backend-url.herokuapp.com/api
NEXT_PUBLIC_WEB_SOCKET_URL=wss://your-backend-url.herokuapp.com
```

---

## 🎯 Total Time Estimate: ~45 minutes

- MongoDB Atlas setup: 10 min
- Redis Cloud setup: 5 min
- Backend deployment: 10 min
- Frontend configuration: 5 min
- Frontend deployment: 10 min
- Testing & verification: 5 min

---

## 💰 Cost Breakdown

| Service | Free Tier | Cost |
|---------|-----------|------|
| MongoDB Atlas | 512 MB storage | FREE |
| Redis Cloud | 30 MB storage | FREE |
| Heroku | (Now requires paid plan) | $7-12/month |
| Netlify | 100 GB bandwidth | FREE |
| **Total** | | ~$7-12/month |

### Alternative (Lower Cost)
Replace Heroku with **Railway** or **Render** (both have free tiers)

---

## 📚 Full Documentation

For detailed steps and troubleshooting, see: `DEPLOYMENT_GUIDE.md`

---

**You're ready! Start with Step 1 → MongoDB Atlas 🚀**
