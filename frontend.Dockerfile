# Frontend Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY frontend/package*.json ./

RUN npm ci

COPY frontend/src ./src
COPY frontend/public ./public
COPY frontend/*.config.* ./
COPY frontend/tsconfig.json ./

EXPOSE 3000

CMD ["npm", "run", "dev"]
