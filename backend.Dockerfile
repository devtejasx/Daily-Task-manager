# Backend Dockerfile (build context: repo root — the lockfile lives there)
FROM node:18-alpine

WORKDIR /app

COPY package.json package-lock.json ./
COPY backend/package.json ./backend/

RUN npm ci --workspace=task-manager-backend

COPY backend/src ./backend/src
COPY backend/tsconfig.json ./backend/

WORKDIR /app/backend

EXPOSE 5000

CMD ["npm", "run", "dev"]
