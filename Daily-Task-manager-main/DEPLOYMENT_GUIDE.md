# 🚀 Complete Hosting Setup Guide - Task Manager

## Overview
Deploy your Task Manager for **FREE** using:
- **Frontend**: Netlify (free tier, automatic deploys)
- **Backend**: Heroku or Railway (free tier)
- **Database**: MongoDB Atlas (free tier)
- **Cache**: Redis Cloud (free tier)

---

## STEP 1: MongoDB Atlas Setup (Database)

### 1.1 Create MongoDB Atlas Account
1. Go to [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. Click "Try Free"
3. Sign up with email
4. Create a new project (name: "task-manager")

### 1.2 Create Database Cluster
1. Click "Create" when prompted
2. Select **M0 (Free)** tier
3. Choose your region (closest to you)
4. Click "Create Cluster" - wait 5 minutes

### 1.3 Set Up Database Access
1. Go to **Database Access** (left menu)
2. Click **"Add New Database User"**
3. Enter username: `taskmanager`
4. Choose **Password** authentication
5. Enter a strong password (save this!)
6. Role: **Built-in Role** → `dbOwner`
7. Click "Add User"

### 1.4 Get Connection String
1. Go to **Clusters** → click **"Connect"**
2. Choose **"Connect your application"**
3. Select **Node.js** driver
4. Copy the connection string:
   ```
   mongodb+srv://taskmanager:<password>@YOUR-CLUSTER-NAME.mongodb.net/task-manager?retryWrites=true&w=majority
   ```
5. Replace `<password>` with your actual password
6. **Save this URL** - you'll need it

### 1.5 Add IP Whitelist (Important!)
1. Go to **Network Access** (left menu)
2. Click **"Add IP Address"**
3. Copy: `0.0.0.0/0` (allows all IPs for free tier)
4. Click "Add Entry" → "Confirm"

---

## STEP 2: Redis Cloud Setup (Cache)

### 2.1 Create Redis Account
1. Go to [redis.com/cloud](https://redis.com/cloud)
2. Click "Free"
3. Sign up or login
4. Create a new database

### 2.2 Create Free Database
1. Click **"Create Database"**
2. Plan: **Free** ($0)
3. Cloud: **AWS**
4. Region: Choose your region
5. Database name: `task-manager`
6. Click **"Create Database"** - wait 2-3 minutes

### 2.3 Get Redis Connection URL
1. Click your database name
2. Find **"Redis URI"** (starts with `redis://`)
3. Format should be: `redis://default:PASSWORD@HOST:PORT`
4. **Save this URL**

---

## STEP 3: Backend Deployment to Heroku (Option A - Recommended)

### 3.1 Prepare Backend for Heroku
Create `.env.production` in backend folder:
```
PORT=5000
NODE_ENV=production
MONGODB_URI=<YOUR_MONGODB_CONNECTION_STRING>
REDIS_URL=<YOUR_REDIS_URL>
JWT_SECRET=generate-a-strong-random-secret-here-min-32-chars
FRONTEND_URL=https://yourdomain.netlify.app
APP_URL=https://yourdomain.netlify.app
EMAIL_PROVIDER=development
EMAIL_FROM=noreply@taskmanager.app
ENVIRONMENT=production
```

### 3.2 Create Procfile
In backend folder, create file named `Procfile` (no extension):
```
web: npm run start
```

### 3.3 Deploy to Heroku
1. Install Heroku CLI: [heroku.com/nodejs](https://devcenter.heroku.com/articles/nodejs-support)

2. Login to Heroku:
   ```bash
   heroku login
   ```

3. Create app:
   ```bash
   cd backend
   heroku create your-app-name-api
   # (use something like: taskmanager-api-yourname)
   ```

4. Set environment variables:
   ```bash
   heroku config:set MONGODB_URI="<YOUR_MONGODB_CONNECTION_STRING>"
   heroku config:set REDIS_URL="<YOUR_REDIS_URL>"
   heroku config:set JWT_SECRET="your-super-secret-key-at-least-32-chars"
   heroku config:set FRONTEND_URL="https://yourdomain.netlify.app"
   heroku config:set NODE_ENV="production"
   ```

5. Deploy:
   ```bash
   git push heroku main
   # (or: git push heroku master - depends on your branch)
   ```

6. View your backend URL:
   ```bash
   heroku domains
   # Will be something like: https://taskmanager-api-yourname.herokuapp.com
   ```

**Backend URL**: Save this (e.g., `https://taskmanager-api-yourname.herokuapp.com`)

---

## STEP 3 ALTERNATIVE: Backend Deployment to Railway (Option B)

### 3.1 Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub or email
3. Create new project

### 3.2 Deploy Backend Service
1. Click **"Deploy from GitHub"** or upload files
2. Select your task-manager repository
3. Railway auto-detects it's a Node.js backend
4. Click "Deploy"

### 3.3 Set Environment Variables in Railway
1. Go to your project
2. Click **Backend service → Variables**
3. Add all variables:
   ```
   MONGODB_URI=<YOUR_MONGODB_CONNECTION_STRING>
   REDIS_URL=<YOUR_REDIS_URL>
   JWT_SECRET=your-super-secret-key-at-least-32-chars
   FRONTEND_URL=https://yourdomain.netlify.app
   NODE_ENV=production
   ```
4. Click "Save"

### 3.4 Get Backend URL
1. Click **Settings** → **Domains**
2. You'll see a domain like `taskmanager-api-*.railway.app`
3. **Save this URL**

---

## STEP 4: Frontend Deployment to Netlify

### 4.1 Update Frontend Environment
Update `frontend/.env.production`:
```
NEXT_PUBLIC_API_URL=https://taskmanager-api-yourname.herokuapp.com/api
NEXT_PUBLIC_WEB_SOCKET_URL=wss://taskmanager-api-yourname.herokuapp.com
NEXT_PUBLIC_ENVIRONMENT=production
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_AI_FEATURES=true
NEXT_PUBLIC_ENABLE_VOICE_INPUT=true
NEXT_PUBLIC_ENABLE_TEAM_FEATURES=true
NEXT_PUBLIC_APP_NAME=TaskMaster
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### 4.2 Create Netlify Configuration
Create `netlify.toml` in root folder:
```toml
[build]
  command = "cd frontend && npm run build"
  publish = "frontend/.next"
  functions = "backend/functions"

[[redirects]]
  from = "/api/*"
  to = "https://taskmanager-api-yourname.herokuapp.com/api/:splat"
  status = 200
  force = true

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 4.3 Connect GitHub to Netlify
1. Go to [netlify.com](https://netlify.com)
2. Sign up with GitHub
3. Click **"Add new site"** → **"Connect to Git"**
4. Select your repository
5. Settings:
   - **Base directory**: (leave empty)
   - **Build command**: `cd frontend && npm run build`
   - **Publish directory**: `frontend/.next`
6. Click **"Deploy site"**

### 4.4 Set Environment Variables in Netlify
1. Go to your site dashboard
2. **Site settings** → **Build & deploy** → **Environment**
3. Click **"Edit variables"**
4. Add:
   ```
   NEXT_PUBLIC_API_URL=https://taskmanager-api-yourname.herokuapp.com/api
   NEXT_PUBLIC_WEB_SOCKET_URL=wss://taskmanager-api-yourname.herokuapp.com
   ```
5. Click "Save"

### 4.5 Redeploy
1. Click **"Deploys"**
2. **"Trigger deploy"** → **"Deploy site"**
3. Wait for build to complete
4. Get your Netlify URL (e.g., `https://your-site-name.netlify.app`)

---

## STEP 5: Connect Frontend to Backend

### 5.1 Update Frontend API Configuration
In `frontend/.env.production` (already done above):
```
NEXT_PUBLIC_API_URL=https://your-backend-url.herokuapp.com/api
NEXT_PUBLIC_WEB_SOCKET_URL=wss://your-backend-url.herokuapp.com
```

### 5.2 Update Backend CORS
In `backend/src/config/middleware.ts`:
```typescript
const corsOptions = {
  origin: 'https://your-site-name.netlify.app',
  credentials: true
};
```

### 5.3 Deploy Backend
```bash
cd backend
git add .
git commit -m "Update CORS for production"
git push heroku main
```

---

## STEP 6: Verify Everything Works

### Test Frontend
1. Open `https://your-site-name.netlify.app`
2. Try to register a new user
3. Try to login

### Test Backend
1. Visit `https://your-backend-url.herokuapp.com/api/health` (if you have this endpoint)
2. Check browser console for API errors
3. MongoDB should have new user data

### Troubleshooting
1. **"Cannot reach backend"** → Check CORS settings
2. **"Connection refused"** → Check MongoDB Atlas IP whitelist
3. **"Invalid JWT"** → Make sure JWT_SECRET is same on backend
4. **Build fails** → Check `npm run build` works locally first

---

## STEP 7: Custom Domain (Optional)

### On Netlify
1. Site settings → Domain management
2. Click "Add custom domain"
3. Enter your domain (e.g., `taskmanager.com`)
4. Update DNS records with Netlify's nameservers
5. Wait 24-48 hours for propagation

### Update Backend
Update `FRONTEND_URL` on Heroku:
```bash
heroku config:set FRONTEND_URL="https://taskmanager.com"
```

---

## 📋 Quick Checklist

- [ ] MongoDB Atlas account created & cluster running
- [ ] Redis Cloud account created & database running
- [ ] Backend `.env.production` created with all secrets
- [ ] Backend deployed to Heroku/Railway
- [ ] Frontend `.env.production` created with backend URL
- [ ] Frontend deployed to Netlify
- [ ] CORS configured to allow Netlify domain
- [ ] User registration tested via frontend
- [ ] Backend API responding correctly

---

## 🔑 Important Notes

### Security
- **Never** commit `.env` files with real secrets
- Rotate `JWT_SECRET` periodically
- Use strong passwords for MongoDB
- Monitor Heroku logs for errors

### Costs
- MongoDB Atlas: FREE (512 MB storage)
- Redis Cloud: FREE (30 MB storage)
- Heroku: Now requires paid plan (~$7/month)
- Alternative to Heroku: Railway/Render (free tier available)
- Netlify: FREE (100 GB bandwidth/month)

### Troubleshooting Commands

```bash
# View Heroku logs
heroku logs --tail

# View Heroku config variables
heroku config

# SSH into Heroku dyno
heroku ps:exec

# Restart Heroku app
heroku restart

# View deployed files
git log --oneline -n 10
```

---

## 🎯 What's Next?

After deployment:
1. Monitor your app for 24 hours
2. Load test with real users
3. Set up error tracking (Sentry)
4. Add automated backups for MongoDB
5. Enable CDN for frontend (Netlify does this)
6. Set up monitoring/alerts

---

## 📞 Support During Deployment

If you encounter issues:
1. Check Heroku logs: `heroku logs --tail`
2. Check MongoDB Atlas connection: **Network Access** & **IP Whitelist**
3. Verify environment variables are set
4. Check Netlify build logs in Netlify dashboard
5. Test API locally first before deploying

---

**Happy Hosting! 🚀**
