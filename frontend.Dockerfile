# Frontend Dockerfile (build context: repo root — the lockfile lives there)
FROM node:18-alpine

WORKDIR /app

COPY package.json package-lock.json ./
COPY frontend/package.json ./frontend/

RUN npm ci --workspace=task-manager-frontend

COPY frontend/src ./frontend/src
COPY frontend/*.config.* ./frontend/
COPY frontend/tsconfig.json ./frontend/

WORKDIR /app/frontend

EXPOSE 3000

CMD ["npm", "run", "dev"]
