# TaskMaster - Modern Task Manager Application

![Node](https://img.shields.io/badge/node-%3E%3D18-339933?logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-7-47A248?logo=mongodb&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-ready-2496ED?logo=docker&logoColor=white)

A full-stack task management application with gamification, real-time updates, team collaboration, and analytics. Built as an npm workspaces monorepo with a Next.js frontend and an Express/MongoDB backend.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture Overview](#architecture-overview)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration-environment-variables)
- [Running Locally](#running-locally)
- [Running with Docker](#running-with-docker)
- [Build](#build)
- [Testing](#testing)
- [API Documentation](#api-documentation)
- [Gamification System](#gamification-system)
- [Deployment](#deployment)
- [CI/CD](#cicd)
- [Security Considerations](#security-considerations)
- [Troubleshooting](#troubleshooting)
- [Known Issues / Inconsistencies](#known-issues--inconsistencies)
- [Contributing](#contributing)
- [License](#license)

## Features

Based on the routes and services actually wired into the backend (`backend/src/index.ts`):

- **Task management** — create, update, complete, delete, filter, and search tasks (`routes/tasks.ts`)
- **Gamification** — XP, levels, achievements, streaks (`routes/gamification.ts`, `services/GamificationService.ts`, `AchievementService.ts`)
- **Habit tracking** — recurring habits with streak stats (`routes/habits.ts`, `services/HabitService.ts`)
- **Team collaboration** — teams and invitations (`routes/teams.ts`, `services/TeamService.ts`)
- **Analytics** — productivity/completion analytics (`routes/analytics.ts`, `services/AnalyticsService.ts`)
- **Pomodoro-style timer** — timed work sessions (`routes/timer.ts`, `components/Timer.tsx`, `TimerWidget.tsx`)
- **AI suggestions** — task suggestions endpoint (`routes/ai.ts`, `services/AISuggestionsService.ts`)
- **Voice input** — voice-to-task processing (`routes/voice.ts`, `services/VoiceService.ts`)
- **Real-time updates** — Socket.io-based WebSocket server (`websocket/WebSocketServer.ts`)
- **Email notifications** — via SendGrid/Gmail/Ethereal depending on `EMAIL_PROVIDER` (`services/EmailService.ts`)
- **Dashboard, calendar, analytics charts** in the Next.js frontend (`frontend/src/app/*`, `components/charts/*`)

## Tech Stack

### Frontend (`frontend/`)
- React 18, Next.js 14 (App Router), TypeScript
- Tailwind CSS, Framer Motion
- Zustand (state), TanStack React Query (data fetching)
- React Hook Form + Zod (forms/validation)
- Recharts, `react-big-calendar`
- Socket.io-client

### Backend (`backend/`)
- Node.js, Express, TypeScript (`tsx` for dev, compiled with `tsc`)
- MongoDB via Mongoose
- Redis (`services/cache.service.ts`)
- JWT auth (`jsonwebtoken`, `bcryptjs`)
- Socket.io (WebSocket server)
- Bull (job queue), Multer (uploads), AWS SDK (S3), Nodemailer
- Stripe SDK is a dependency and `services/payment.service.ts` exists, but **no route currently exposes it** — see [Known Issues](#known-issues--inconsistencies)

### Infrastructure
- Docker + Docker Compose (MongoDB, Redis, backend, frontend containers)
- GitHub Actions CI/CD (`.github/workflows/ci-cd.yml`)
- Netlify config present (`netlify.toml`); CI deploy step targets AWS ECS (backend) and Vercel (frontend)

## Architecture Overview

This is an npm-workspaces monorepo with two independently runnable apps that talk over HTTP + WebSocket:

```
┌─────────────────┐        REST (/api/*)        ┌──────────────────┐
│  Next.js         │ ───────────────────────────▶│  Express API      │
│  frontend/       │◀─────────────────────────── │  backend/         │
│  (port 3000)     │        WebSocket             │  (port 5000)      │
└─────────────────┘◀───────────────────────────▶└─────────┬────────┘
                                                            │
                                          ┌─────────────────┼─────────────────┐
                                          ▼                 ▼                 ▼
                                     MongoDB           Redis             AWS S3 / Email
                                   (Mongoose)        (cache/queue)        (uploads/notify)
```

- The frontend calls the backend exclusively through `frontend/src/services/api.ts` and `NEXT_PUBLIC_API_URL`.
- The backend exposes REST routes under `/api/*` plus a raw WebSocket server (`websocket/WebSocketServer.ts`) mounted on the same HTTP server (`backend/src/index.ts`).
- Auth is stateless JWT, validated in `middleware/auth.ts`; role-based access is enforced in `middleware/rbac.ts` for team endpoints.

## Project Structure

```
Daily-Task-manager/
├── frontend/                   # Next.js app (App Router)
│   ├── src/app/                 # Routed pages (dashboard, tasks, habits, teams, analytics, login)
│   ├── src/components/          # UI components (Timer, TaskCard, charts/, etc.)
│   ├── src/hooks/                # useTasks, useTimer, useTeams, useWebSocket, ...
│   ├── src/services/api.ts      # Axios client used by all hooks
│   └── src/store/               # Zustand store
├── backend/                     # Express API
│   ├── src/routes/               # auth, tasks, gamification, analytics, teams, habits, voice, ai, timer
│   ├── src/controllers/          # AuthController, TaskController
│   ├── src/services/             # Business logic per domain
│   ├── src/models/               # Mongoose schemas (Task, User, Team, Habit, Notification, ...)
│   ├── src/middleware/           # auth, rbac, errorHandler, logging, rateLimiting
│   ├── src/websocket/            # Socket.io server
│   └── src/__tests__/            # Jest unit + integration tests
├── docs/                         # Architecture, deployment, install, testing docs
├── docker-compose.yml            # Mongo + Redis + backend + frontend
├── backend.Dockerfile / frontend.Dockerfile / Dockerfile
├── netlify.toml
├── setup.sh / setup.bat          # Convenience install scripts
├── deploy.sh / deploy.bat        # Convenience deploy scripts
└── package.json                  # Root workspace scripts
```

> Note: this repository also contains a `Daily-Task-manager-main/` subfolder that is a byte-for-byte duplicate of the entire project — see [Known Issues](#known-issues--inconsistencies).

## Prerequisites

- Node.js 18+
- MongoDB (local instance or Atlas)
- Redis (local or hosted)
- Docker + Docker Compose (optional, for containerized setup)

## Installation

```bash
git clone https://github.com/devtejasx/Daily-Task-manager.git
cd Daily-Task-manager

# Copy environment templates
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local

# Install all workspace dependencies (root, frontend, backend)
npm install
```

## Configuration (Environment Variables)

### `backend/.env` (see `backend/.env.example` for the full list)

| Variable | Purpose | Example |
|---|---|---|
| `PORT` | API server port | `5000` |
| `NODE_ENV` | Environment | `development` |
| `MONGODB_URI` | Mongo connection string | `mongodb://localhost:27017/task-manager` |
| `MONGODB_TEST_URI` | Mongo URI used by tests | `mongodb://localhost:27017/task-manager-test` |
| `JWT_SECRET` / `JWT_EXPIRE` | Auth token signing | — |
| `REDIS_URL` | Redis connection | `redis://localhost:6379` |
| `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` / `AWS_REGION` / `AWS_S3_BUCKET` | File upload storage | — |
| `EMAIL_PROVIDER` | `gmail`, `sendgrid`, or `development` | `development` |
| `GMAIL_USER` / `GMAIL_PASSWORD` | Used if `EMAIL_PROVIDER=gmail` | — |
| `SENDGRID_API_KEY` | Used if `EMAIL_PROVIDER=sendgrid` | — |
| `ETHEREAL_USER` / `ETHEREAL_PASSWORD` | Dev-mode email testing (ethereal.email) | — |
| `FRONTEND_URL` / `APP_URL` | CORS origin / links in emails | `http://localhost:3000` |

### `frontend/.env.local` (see `frontend/.env.example`)

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend REST base URL, e.g. `http://localhost:5000/api` |
| `NEXT_PUBLIC_APP_URL` | Public URL of the frontend, e.g. `http://localhost:3000` |

## Running Locally

Start MongoDB and Redis locally (or point `.env` at hosted instances), then:

```bash
# From the repo root — runs frontend and backend concurrently
npm run dev
```

Or run each app in its own terminal:

```bash
# Terminal 1 — backend (http://localhost:5000)
cd backend
npm install
npm run dev

# Terminal 2 — frontend (http://localhost:3000)
cd frontend
npm install
npm run dev
```

Health check: `GET http://localhost:5000/api/health`

## Running with Docker

```bash
docker-compose up -d
```

This starts four containers defined in `docker-compose.yml`:

| Service | Image/Build | Port |
|---|---|---|
| `mongodb` | `mongo:7` | `27017` |
| `redis` | `redis:7-alpine` | `6379` |
| `backend` | `backend.Dockerfile` | `5000` |
| `frontend` | `frontend.Dockerfile` | `3000` |

## Build

```bash
# Both workspaces, from the root
npm run build

# Or individually
cd backend && npm run build   # tsc -> dist/
cd frontend && npm run build  # next build
```

## Testing

```bash
# Backend (Jest + ts-jest)
cd backend
npm test
npm run test:watch

# Frontend (Jest + Testing Library) — declared in package.json,
# but no jest.config.js currently exists in frontend/, so `npm test` will fail until one is added
cd frontend
npm test
```

Existing backend test files:
- `backend/src/__tests__/services/task.service.test.ts`
- `backend/src/__tests__/api/tasks.integration.test.ts`
- `backend/src/__tests__/setup.ts`

## API Documentation

Base URL: `http://localhost:5000/api`. Protected routes require `Authorization: Bearer {token}`.

Routes actually mounted in `backend/src/index.ts`:

| Prefix | Router file | Purpose |
|---|---|---|
| `/api/auth` | `routes/auth.ts` | Register, login, profile |
| `/api/tasks` | `routes/tasks.ts` | CRUD, search, complete |
| `/api/gamification` | `routes/gamification.ts` | XP, levels, achievements |
| `/api/analytics` | `routes/analytics.ts` | Productivity analytics |
| `/api/teams` | `routes/teams.ts` | Teams, invitations |
| `/api/habits` | `routes/habits.ts` | Habit tracking |
| `/api/voice` | `routes/voice.ts` | Voice-to-task |
| `/api/ai` | `routes/ai.ts` | AI task suggestions |
| `/api/timer` | `routes/timer.ts` | Pomodoro timer sessions |
| `/api/health` | inline in `index.ts` | Liveness check |

Example — register:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","name":"John Doe","password":"securepass123"}'
```

Example — create a task:
```bash
curl -X POST http://localhost:5000/api/tasks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Finish project","category":"Work","priority":"High"}'
```

`backend/src/routes/subtasks.ts` and `backend/src/routes/aiCoach.ts` exist but are **not imported/mounted** in `index.ts`, so they are currently unreachable — see [Known Issues](#known-issues--inconsistencies).

## Gamification System

From `services/GamificationService.ts` and `services/AchievementService.ts`:

- Base XP for completing a task, with bonuses for on-time/early completion and priority multipliers
- Level thresholds increase progressively (documented in-app via `LevelProgress.tsx`)
- Achievement badges for completion counts, streaks, and category mastery

## Deployment

The CI pipeline's `deploy` job (`.github/workflows/ci-cd.yml`) targets:

- **Backend** → AWS ECS (`aws ecs update-service --cluster task-manager-prod --service task-manager-backend`)
- **Frontend** → Vercel (placeholder step; no Vercel CLI/action wired up yet)
- A `netlify.toml` is also present for an alternative Netlify frontend deployment
- Database: MongoDB Atlas connection string set via `MONGODB_URI`
- File storage: AWS S3 via the `AWS_*` variables

`deploy.sh` / `deploy.bat` are provided as local convenience scripts.

## CI/CD

`.github/workflows/ci-cd.yml` runs on push/PR to `main`/`develop`:

1. **backend-test** — spins up MongoDB + Redis service containers, runs `npm run lint` (non-blocking) and `npm test`, uploads coverage to Codecov
2. **frontend-test** — lint (non-blocking) and `npm run build`
3. **build-docker** — builds both Docker images (no push)
4. **security-scan** — Trivy filesystem scan, results uploaded as SARIF
5. **code-quality** — ESLint across both workspaces
6. **deploy** — on `main` only: AWS ECS + Vercel deploy, then a smoke-check via `curl`, then Slack notification
7. **deploy-staging** — on `develop` only: placeholder staging deploy + smoke tests

## Security Considerations

- JWT-based auth (`middleware/auth.ts`); role-based access control for teams (`middleware/rbac.ts`)
- Passwords hashed with `bcryptjs`
- Rate limiting middleware (`middleware/rateLimiting.ts`)
- CORS restricted to `FRONTEND_URL`
- Secrets (`JWT_SECRET`, AWS keys, email credentials, Stripe key) are read from environment variables — never commit a real `.env`
- CI includes a Trivy vulnerability scan on every push/PR
- No `LICENSE` file currently exists in the repo despite prior references to "MIT License" — see [Known Issues](#known-issues--inconsistencies)

## Troubleshooting

- **MongoDB connection failed** — confirm MongoDB is running and `MONGODB_URI` in `backend/.env` is correct.
- **Port already in use** — free port 3000/5000: `lsof -ti:3000 | xargs kill -9` (macOS/Linux) or `Stop-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess` (Windows PowerShell).
- **Redis connection error** — ensure `redis-server` is running and `REDIS_URL` is correct.
- **API requests failing from frontend** — check `NEXT_PUBLIC_API_URL`, confirm the JWT token is present/valid, and check backend CORS config against `FRONTEND_URL`.
- **`npm test` fails in `frontend/`** — no `jest.config.js` exists yet for the frontend workspace even though Jest is declared in `package.json`.

## Known Issues / Inconsistencies

Found during this analysis — flagged here rather than silently fixed, since some require a decision:

1. **Duplicate nested project** — `Daily-Task-manager-main/` is a full, byte-identical copy of the entire repository (frontend, backend, all docs). This roughly doubles repo size for no benefit and should probably be deleted.
2. **Unmounted routes** — `backend/src/routes/subtasks.ts` and `backend/src/routes/aiCoach.ts` exist but are never imported in `backend/src/index.ts`, so those endpoints are dead code from the API's perspective.
3. **Unused Stripe integration** — `backend/src/services/payment.service.ts` implements Stripe billing logic and the `stripe` package is a dependency, but no route file or `index.ts` registration exposes it.
4. **No `jest.config.js` in `frontend/`** — the `test`/`test:watch` scripts exist in `frontend/package.json` but there's no Jest config, so they will likely fail out of the box.
5. **No `LICENSE` file** — the previous README stated "MIT License - see LICENSE file for details," but no such file exists in the repo.
6. **~50 top-level Markdown planning/status docs** (`PHASE_5_*.md`, `WEEK_*.md`, `IMPLEMENTATION_*.md`, etc.) — these read as historical planning artifacts rather than living documentation; worth archiving into `docs/` or removing if stale.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Open a pull request

## License

No `LICENSE` file is currently present in this repository. Add one (e.g., MIT) if you intend the project to be open-source under a specific license.

## Future Improvements

- Wire up or remove the unmounted `subtasks` and `aiCoach` routes
- Either finish and mount the Stripe payment integration or remove the unused dependency/service
- Add a frontend Jest config so `frontend`'s test script actually runs
- Consolidate the large number of top-level planning docs into `docs/`
- Remove the duplicated `Daily-Task-manager-main/` folder
