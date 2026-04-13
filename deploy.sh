#!/bin/bash

echo ""
echo "=========================================="
echo "   Task Manager - Deployment Helper"
echo "=========================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install it from https://nodejs.org"
    exit 1
fi
echo "✅ Node.js found"

# Check if Heroku CLI is installed
if ! command -v heroku &> /dev/null; then
    echo "❌ Heroku CLI is not installed."
    echo "   Download from: https://devcenter.heroku.com/articles/nodejs-support"
    exit 1
fi
echo "✅ Heroku CLI found"

# Check if Git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install it from https://git-scm.com"
    exit 1
fi
echo "✅ Git found"

echo ""
echo "=========================================="
echo "   Step 1: Dependencies"
echo "=========================================="
echo ""

cd backend
echo "Installing backend dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install backend dependencies"
    exit 1
fi
echo "✅ Backend dependencies installed"

cd ../frontend
echo "Installing frontend dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install frontend dependencies"
    exit 1
fi
echo "✅ Frontend dependencies installed"

cd ..

echo ""
echo "=========================================="
echo "   Step 2: Heroku Login"
echo "=========================================="
echo ""
echo "Opening browser for Heroku login..."
heroku login

echo ""
echo "=========================================="
echo "   Step 3: Create Heroku App"
echo "=========================================="
echo ""
read -p "Enter your Heroku app name (e.g., taskmanager-api-yourname): " APP_NAME

cd backend
heroku create $APP_NAME
if [ $? -ne 0 ]; then
    echo "❌ Failed to create Heroku app (may already exist)"
fi

echo ""
echo "=========================================="
echo "   Step 4: Set Environment Variables"
echo "=========================================="
echo ""
echo "⚠️  You need to add these environment variables to your Heroku app:"
echo ""
echo "   1. MONGODB_URI - Your MongoDB Atlas connection string"
echo "   2. REDIS_URL - Your Redis Cloud connection string"
echo "   3. JWT_SECRET - A strong random secret (min 32 chars)"
echo "   4. FRONTEND_URL - Your Netlify URL (will be provided later)"
echo "   5. NODE_ENV - Set to \"production\""
echo ""
echo "Example command:"
echo "   heroku config:set MONGODB_URI=\"your_mongodb_url\" REDIS_URL=\"your_redis_url\" JWT_SECRET=\"your_secret\" FRONTEND_URL=\"your_netlify_url\" NODE_ENV=\"production\""
echo ""
read -p "Press Enter when you've set all environment variables..."

echo ""
echo "=========================================="
echo "   Step 5: Deploy Backend"
echo "=========================================="
echo ""

# Ensure we're in git repository
if [ ! -d ../.git ]; then
    echo "Initializing git repository..."
    cd ../..
    git init
    git add .
    git commit -m "Initial commit"
    cd backend
fi

echo "Deploying to Heroku..."
git push heroku main || git push heroku master

echo ""
echo "=========================================="
echo "   ✅ Deployment Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "   1. Get your Heroku app URL: heroku domains"
echo "   2. Update frontend/.env.production with your backend URL"
echo "   3. Deploy frontend to Netlify (via GitHub or drag-and-drop)"
echo "   4. Test the application"
echo ""
cd ..
