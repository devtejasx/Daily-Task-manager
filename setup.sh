#!/bin/bash

# TaskMaster Setup Script
# This script automates the initial setup process

set -e

echo "🚀 TaskMaster Setup Script"
echo "=========================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check Node.js
echo -e "${YELLOW}Checking prerequisites...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 18+${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js $(node -v) found${NC}"

if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ npm $(npm -v) found${NC}"

# Check if git is initialized
if [ ! -d .git ]; then
    echo -e "${YELLOW}Initializing git repository...${NC}"
    git init
fi

# Install dependencies
echo -e "${YELLOW}Installing dependencies...${NC}"
npm install

echo -e "${YELLOW}Installing Backend dependencies...${NC}"
cd backend && npm install && cd ..

echo -e "${YELLOW}Installing Frontend dependencies...${NC}"
cd frontend && npm install && cd ..

# Create environment files if they don't exist
echo -e "${YELLOW}Setting up environment variables...${NC}"

if [ ! -f backend/.env ]; then
    echo -e "${YELLOW}Creating backend/.env from .env.example${NC}"
    cp backend/.env.example backend/.env
    echo -e "${YELLOW}⚠️  Edit backend/.env with your settings:${NC}"
    echo "   - MONGODB_URI"
    echo "   - JWT_SECRET"
    echo "   - REDIS_URL (if using remote)"
fi

if [ ! -f frontend/.env.local ]; then
    echo -e "${YELLOW}Creating frontend/.env.local from .env.example${NC}"
    cp frontend/.env.example frontend/.env.local
fi

# Offer to check Docker
echo -e ""
echo -e "${YELLOW}Would you like to use Docker Compose for local development? (recommended)${NC}"
echo "y/n"
read -r use_docker

if [ "$use_docker" = "y" ]; then
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}❌ Docker is not installed. Skipping Docker setup.${NC}"
        echo "Please install Docker from docker.com"
    else
        echo -e "${GREEN}✓ Docker is installed${NC}"
        echo -e "${YELLOW}Building Docker containers...${NC}"
        docker-compose build
        echo -e "${GREEN}✓ Docker setup complete!${NC}"
        echo ""
        echo -e "${GREEN}To start development servers:${NC}"
        echo "  docker-compose up -d"
        echo ""
        echo -e "${GREEN}Access:${NC}"
        echo "  Frontend: http://localhost:3000"
        echo "  Backend: http://localhost:5000"
    fi
else
    echo -e "${YELLOW}Make sure MongoDB and Redis are running locally!${NC}"
    echo ""
    echo -e "${GREEN}To start development servers:${NC}"
    echo "  Terminal 1: cd backend && npm run dev"
    echo "  Terminal 2: cd frontend && npm run dev"
fi

echo ""
echo -e "${GREEN}✓ Setup complete!${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Configure environment variables:"
echo "   - backend/.env"
echo "   - frontend/.env.local (optional for local dev)"
echo "2. Start the development servers"
echo "3. Open http://localhost:3000 in your browser"
echo "4. Register and start creating tasks!"
echo ""
echo -e "${GREEN}For more information, see:${NC}"
echo "  - README.md"
echo "  - docs/INSTALLATION.md"
echo "  - docs/DEVELOPMENT_PHASES.md"
