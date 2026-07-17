# ARISE — Hunter Command Center

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-Auth_+_Firestore-FFCA28?logo=firebase&logoColor=black)
![Node](https://img.shields.io/badge/node-%3E%3D20-339933?logo=node.js&logoColor=white)

A gamified daily task manager inspired by *Solo Leveling*. Complete missions to
earn XP, level up, keep daily streaks alive, and climb the hunter ranks — with
cinematic level-up/promotion effects, achievements, and a mission history
timeline. Your progress is synced to the cloud via Firebase.

## Features

- **Missions board** — add, complete, and delete missions with difficulty tiers
  (E → S rank), categories, priorities, and XP rewards
- **Daily quest system** — pick 4 required missions each day; clear them all to
  extend your streak, or fail and lose it at midnight
- **Hunter progression** — XP levels, streak-based hunter ranks (E → National),
  animated promotions and level-up cinematics
- **Achievements** — unlockable records swept automatically as you play
- **Dashboard** — stats, weekly XP chart, mission history timeline, calendar view
- **Cloud sync** — Firebase Auth (email/password + Google) with per-user game
  saves in Firestore; sign in from any device and continue

## Tech Stack

| Layer      | Tech                                                          |
| ---------- | ------------------------------------------------------------- |
| UI         | React 18, Vite 6, Tailwind CSS 4, framer-motion, lucide-react |
| Effects    | three.js / react-three-fiber, tsparticles, GSAP               |
| Auth       | Firebase Authentication (email/password, Google)              |
| Data       | Cloud Firestore (one save document per user)                  |

## Project Structure

```
├── frontend/                # Vite + React app (the whole product)
│   ├── src/
│   │   ├── components/      # UI components (cards, panels, cinematics, background FX)
│   │   ├── views/           # Pages: Dashboard, Missions, Calendar, Achievements, Settings, Login
│   │   ├── hooks/           # useGameState (reducer + cloud persistence), useAuth
│   │   ├── game/            # Game rules: levels, ranks, achievements, constants
│   │   ├── data/            # Seed missions for new accounts
│   │   └── lib/             # firebase.js (init), saveService.js (Firestore saves)
│   ├── index.html
│   └── vite.config.js
├── firestore.rules          # Firestore security rules (per-user access)
├── netlify.toml             # Netlify deploy config (SPA)
└── .github/workflows/       # CI: frontend build + Trivy security scan
```

## Getting Started

Prerequisites: **Node.js 20+** and npm.

```bash
# install dependencies (root — npm workspaces)
npm install

# start the dev server (http://localhost:5173)
npm run dev

# production build (outputs frontend/dist)
npm run build
```

## Firebase Setup

The app uses a Firebase project for auth and storage. To point it at your own:

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Authentication** → Email/Password and Google sign-in
3. Create a **Cloud Firestore** database
4. Publish the rules from [`firestore.rules`](firestore.rules)
5. Replace the web config in [`frontend/src/lib/firebase.js`](frontend/src/lib/firebase.js)

Game saves are stored as one document per user at `tasks/{uid}`; the security
rules ensure users can only read and write their own save.

## Deployment

Any static host works — the build is a plain SPA:

- **Netlify**: config in [`netlify.toml`](netlify.toml) (publishes `frontend/dist`)
- Remember to add your production domain to Firebase Auth → Authorized domains

## License

MIT — see [LICENSE](LICENSE).
