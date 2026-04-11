# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy monorepo files
COPY package.json package-lock.json ./
COPY backend ./backend
COPY frontend ./frontend

# Install dependencies
RUN npm ci

# Build backend
RUN cd backend && npm run build

# Build frontend  
RUN cd frontend && npm run build


# Production stage - Backend
FROM node:18-alpine AS backend-prod

WORKDIR /app

# Copy package files
COPY backend/package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy built backend
COPY --from=builder /app/backend/dist ./dist

EXPOSE 5000

CMD ["node", "dist/index.js"]


# Production stage - Frontend
FROM node:18-alpine AS frontend-prod

WORKDIR /app

# Copy package files
COPY frontend/package*.json ./

# Install production dependencies
RUN npm ci --only=production

# Copy built frontend
COPY --from=builder /app/frontend/.next ./.next
COPY --from=builder /app/frontend/public ./public
COPY frontend/next.config.js ./

EXPOSE 3000

CMD ["npm", "start"]
