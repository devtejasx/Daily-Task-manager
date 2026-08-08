<div align="center">

<img src="frontend/public/icons/icon-192.png" width="96" alt="ARISE" />

# ARISE — Discipline Quest

### What if becoming disciplined felt like levelling up in an RPG?

</div>

You already know what you should be doing. That was never the hard part.

Every to-do app on earth will help you write the list. None of them help you
*feel like doing it* — so you keep the list, abandon the list, and start a new
list somewhere else in three months. Organisation was never the bottleneck.
Motivation is.

**ARISE treats your real life as the dungeon.** Tasks become missions. Finishing
them earns XP. Consistency becomes power, and power is permanent — you climb from
E-Rank to National-Level Hunter not by doing more, but by *coming back*.

### The part that matters most

Every habit app punishes you for missing a day, and that punishment is precisely
why people quit them. A missed day is the moment you are most likely to give up,
so it is the moment this app is warmest.

Miss a day and a **Streak Shield** — forged by your own consistency — absorbs it.
Out of shields? Your streak is *held for one more day*, and clearing tomorrow's
quest takes the whole thing back with a bonus. There is no failure screen. The
word "failed" does not appear in the product, and nothing you have earned can
ever be taken away.

**This app rewards consistency, not perfection.** That is the whole design.

> The philosophy every change is measured against lives in
> **[PROJECT_VISION.md](PROJECT_VISION.md)**.

<div align="center">

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-Auth_+_Firestore-FFCA28?logo=firebase&logoColor=black)
![Vitest](https://img.shields.io/badge/Vitest-497_tests-6E9F18?logo=vitest&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-installable-5A0FC8?logo=pwa&logoColor=white)
![Node](https://img.shields.io/badge/node-%3E%3D20-339933?logo=node.js&logoColor=white)

</div>

---

## Try it without signing up

The landing page has a **demo mode**: a veteran S-Rank hunter, 213 days deep,
with four months of cleared missions, a filled heatmap and a wall of titles.
Clear one of their missions and watch the XP land. Nothing is saved.

It is the fastest honest answer to "what is this?" — an empty dashboard cannot
explain a progression system, because there is nothing on screen to progress.

---

## Screenshots

> **Not yet captured.** The shots below are the ones worth having; drop the
> files into `docs/screenshots/` with these names and they will render here.
> Run `npm run dev`, then capture at 1440×900 for desktop and 390×844 for mobile.

| | |
| --- | --- |
| **Dashboard** — rank badge, streak, daily quest, today's gates<br>`docs/screenshots/dashboard.png` | **Mission Board** — filters, drag & drop, recurrence chips<br>`docs/screenshots/tasks.png` |
| **Analytics** — completion rate, XP curve, activity heatmap<br>`docs/screenshots/analytics.png` | **Calendar** — month/week, priority colours, multi-day spans<br>`docs/screenshots/calendar.png` |
| **Habits** — streaks, weekly/monthly progress, habit calendar<br>`docs/screenshots/habits.png` | **Level-up cinematic** — the money shot for the GIF<br>`docs/screenshots/demo.gif` |

A good 10-second demo GIF: create a mission → drag it up the board → clear it →
catch the XP burst and level-up overlay → land on `/analytics`.

---

## Features

### Missions
- **Mission board** with difficulty tiers (E → S), categories, priorities and XP rewards
- **Recurring missions** — daily, weekly, monthly or a custom N-day interval. Clearing one
  spawns the next occurrence automatically while the cleared card keeps its history.
  **Skip** an occurrence, **pause** a series, **resume** it later
- **Drag & drop ordering** with pointer, touch and full keyboard support; the order is
  persisted, and reordering a filtered view never disturbs missions that were off screen
- **Deadlines** — due date and time, a live countdown, Today / Tomorrow / "Overdue · 3d"
  badges and a red rail down overdue cards
- **Multi-day missions** that span a date range on the calendar
- **Reminders** — 5 min / 15 min / 30 min / 1 hour / 1 day before, as browser
  notifications. Permission is asked exactly once
- **Advanced filters** — category, priority, difficulty, XP range, completed, pending,
  overdue, due today, due this week, recurring, and title search. All compose together

### Progression
- **Daily quest** — pick 4 required missions; clear them all to extend your streak and
  earn a completion bonus that grows with the streak and then caps
- **The Resolve system** — the game rewards consistency, not perfection. See below
- **Discipline Score** — 0–100 from four capped signals: consistency, momentum, effort
  and recovery. Deliberately *not* completed/total, which would reward writing easier
  missions and penalise planning ahead. Effort counts at most four clears **per day**,
  so thirty missions in one sitting score the same as four
- **Hunter ranks** — E → D → C → B → A → S → National, earned by *either* the original
  streak thresholds (21 / 90 / 180 / 365 days, unchanged) **or** level + missions
  cleared + Discipline Score. Rank is stored, never derived from the current streak, and
  **never goes down** — a missed day can't take a badge off your profile
- **Titles** — 14 of them, earned by behaviour and worn beside your name
- **Weekly challenge** — a target derived from *your own* recent output and set slightly
  below it, so it is never calibrated to somebody else's week
- **Weekly boss** — optional, opt-in, three objectives (missions, days shown up for,
  quests cleared) so it can't be beaten by one enormous Saturday. Missing one is never
  described as a loss
- **Hunter Profile** — rank, title, Discipline Score with a full breakdown, lifetime
  record, and a progression timeline of the days something actually changed
- **XP + levels** on a rising curve, with level-up overlays and floating XP bursts
- **Achievements** in six categories with four rarities, swept automatically as you play

### Anti-farm design

The failure mode of every gamified task app is that splitting one real task into thirty
fake ones pays thirty times. That trains the opposite of the habit this product exists
for, so three separate mechanics refuse it:

- XP is credited in full up to a generous daily soft cap, then at a reducing rate with a
  floor that never reaches zero. Fifty fragments are worth measurably less than the work
  they replaced, and a genuinely heavy day still gains
- The Discipline Score counts **days**, capped per day, not things ticked
- Every consistency achievement and title measures days shown up for

Damping is never phrased as a penalty and you are never warned you are approaching a
limit — an honest day will not meet it.

### The Resolve system

A missed day is the moment a hunter is most likely to quit, so it is the moment
the app has to be warmest. Nothing here can take XP, levels, achievements or a
personal best away — **power once earned is permanent**. Only the current streak
is ever at stake, and it gets two chances before it goes:

| Situation | What happens | What you see |
| --- | --- | --- |
| Cleared the daily quest | Streak +1, plus XP. Every 7th day forges a **Streak Shield** (max 3) | `STREAK SHIELD FORGED` |
| Missed a day, shield banked | A shield is spent; the streak is **untouched** | `SHIELD HELD` |
| Missed a day, no shields | The streak is **held for one day**, not destroyed | `STREAK PRESERVED` |
| Cleared the quest during that day | The whole climb returns, plus a comeback bonus | `STREAK RECOVERED` |
| That day passed too | The streak settles; the old run stays on your record | `A NEW CLIMB BEGINS` |

There is no failure screen. No red, no shake, no "you failed" — the word doesn't
appear in the product. Coming back is treated as the skill it is, with its own
achievement line (`Nothing Kept Me Down`, `Always Returns`, `Fully Resolved`).

### Beyond missions
- **Habit tracker** — daily logging, weekly/monthly progress against a cadence, streaks,
  consistency percentage, XP per log and a back-fillable month calendar
- **Productivity analytics** — completion rate, XP this week/month, current and longest
  streak, most-completed category, average tasks per day, a weekly completion chart,
  an 8-week XP curve, a category split and a four-month activity heatmap
- **Pomodoro timer** — 25/5 by default with custom durations, pause/resume/reset/skip,
  a notification and a chime on finish. Keeps running across route changes
- **Calendar** — month and week views, drag missions between dates, priority colours,
  recurring indicators and quick-add on any day

### Platform
- **Cloud sync** — Firebase Auth (email/password + Google), one save document per user
- **Offline** — Firestore IndexedDB persistence plus a local mirror; edit offline and
  everything syncs on reconnect
- **Installable PWA** with offline caching and a non-intrusive update prompt
- **Guest mode** — explore the whole UI signed out; protected actions prompt to sign in
  and resume where you left off
- **Themes** — Arcane, Shadow, Frost and Ember, plus an animation toggle and dimmed ambience
- **Export / import** — JSON (round-trippable) and CSV (spreadsheet-friendly), with
  validation and a confirmation summary before anything is replaced
- **Accessible** — keyboard navigation throughout, visible focus rings, ARIA labels and
  live-region announcements for the otherwise-silent cinematics

---

## Architecture

```mermaid
flowchart TD
    subgraph shell["App shell"]
        MAIN["main.jsx<br/>BrowserRouter · ErrorBoundary · PWA"]
        APP["App.jsx<br/>layout, chrome, prop assembly"]
        ROUTES["AppRoutes.jsx<br/>lazy route map"]
    end

    subgraph state["State (React-free, directly testable)"]
        REDUCER["state/reducer.js"]
        HELPERS["state/helpers.js<br/>rollover · achievements"]
        SELECTORS["state/selectors.js"]
        ACTIONS["state/actions.js"]
    end

    subgraph hooks["Hooks"]
        GS["useGameState"]
        FX["useGameFx"]
        FILTERS["useMissionFilters"]
        SAVE["useCloudSave"]
        REM["useReminders"]
        POMO["usePomodoro"]
    end

    subgraph services["Services"]
        FB["firebase.js"]
        SAVESVC["saveService.js<br/>+ local mirror"]
        MIG["migration.js<br/>versioned schema"]
        BACKUP["backup.js<br/>export / import"]
        NOTIF["notifications.js"]
    end

    CLOUD[("Firestore<br/>tasks/{uid}")]

    MAIN --> APP --> ROUTES
    APP --> GS & FX & FILTERS & SAVE & REM
    GS --> REDUCER --> HELPERS
    GS --> SELECTORS & ACTIONS
    SAVE --> SAVESVC --> FB --> CLOUD
    SAVESVC --> MIG --> REDUCER
    REM --> NOTIF
    POMO --> NOTIF
    BACKUP --> MIG
```

**Two design decisions worth knowing about:**

1. **One document, versioned in the payload.** The entire game state lives at
   `tasks/{uid}` as a JSON string. Rather than versioning collections, the payload
   carries a `version` and is upgraded in place on load by `services/migration.js`.
   Migration is idempotent and forward compatible — fields written by a newer client
   survive a round trip through an older one.

   The v4 step is worth reading as an example: v3 stored the hunter's best rank as an
   *index* into the rank table, and v4 inserts C-Rank and A-Rank into that table. Read
   naively, a stored `3` would have turned an S-Rank hunter into a B-Rank one. The v3
   table is frozen in the migration as `LEGACY_RANK_KEYS`, the index is translated
   through it exactly once into a stable key, and the original integer is left in place
   so a client still running v3 keeps reading what it wrote.

2. **The reducer knows nothing about React.** Every transition lives in `src/state/`,
   which is why the state machine can be driven directly from tests. That's how the
   pomodoro pause bug and the missing-`history` migration gap were both caught.

---

## Getting Started

**Prerequisites:** Node.js 20+ and npm.

```bash
npm install
```

```bash
npm run dev
```

The app runs at **http://localhost:5173**. You can explore the whole interface as a
guest — sign-in is only needed to persist anything.

| Command | What it does |
| --- | --- |
| `npm run dev` | Vite dev server with HMR |
| `npm run build` | Production build → `frontend/dist` |
| `npm run preview` | Serve the production build locally |
| `npm test` | Run the test suite once |
| `npm run test:watch` | Re-run tests on change |
| `npm run test:coverage` | Coverage report (v8 + HTML) |

---

## Folder Structure

```
├── frontend/
│   ├── public/icons/            # PWA icon set (192/512 + maskable)
│   ├── src/
│   │   ├── components/          # UI, grouped by feature
│   │   │   ├── analytics/       # chart frame, heatmap calendar
│   │   │   ├── auth/            # AuthGate, login modal, auth form
│   │   │   ├── background/      # three.js battlefield scene, particles
│   │   │   ├── calendar/        # day cell, draggable mission chip
│   │   │   ├── cinematic/       # welcome intro
│   │   │   ├── filters/         # filter bar and chips
│   │   │   ├── habits/          # habit card, calendar, add form
│   │   │   ├── mission/         # deadline, recurrence, reminder, actions
│   │   │   ├── settings/        # preferences, defaults, data panels
│   │   │   └── ui/              # skeletons, boot screen, error boundary, PWA prompt
│   │   ├── pages/               # Dashboard, Missions, Calendar, Habits,
│   │   │                        # Analytics, Achievements, Profile, Settings
│   │   ├── state/               # reducer, helpers, actions, selectors (no React)
│   │   ├── hooks/               # useGameState, useGameFx, usePomodoro,
│   │   │                        # useReminders, useCloudSave, useMissionFilters…
│   │   ├── services/            # firebase, saveService, migration, backup, notifications
│   │   ├── utils/               # date, recurrence, filters, analytics, habits, calendar
│   │   ├── game/                # rules: levels, ranks, discipline, xp, titles,
│   │   │                        # rarity, challenges, timeline, achievements
│   │   ├── data/                # difficulties, categories, templates
│   │   ├── test/                # Vitest setup + factories
│   │   ├── routes.js            # single source of truth for URLs
│   │   ├── AppRoutes.jsx        # URL → screen map
│   │   └── App.jsx              # layout, chrome, prop assembly
│   ├── vite.config.js           # build, chunking, PWA
│   └── vitest.config.js         # test environment
├── firestore.rules              # per-user access rules
├── netlify.toml                 # SPA deploy config
└── .github/workflows/           # CI: build + Trivy scan
```

Files are kept under roughly 300 lines; anything larger is split by responsibility.

---

## Tech Stack

| Layer | Tech |
| --- | --- |
| UI | React 18, Vite 6, Tailwind CSS 4, framer-motion, lucide-react |
| Routing | React Router 6, lazy routes + manual vendor chunking |
| Charts | Recharts |
| Drag & drop | dnd-kit (core, sortable, modifiers) |
| Effects | three.js / react-three-fiber, tsparticles, GSAP |
| Auth | Firebase Authentication (email/password, Google) |
| Data | Cloud Firestore, one save document per user, IndexedDB persistence |
| Offline | vite-plugin-pwa + Workbox |
| Testing | Vitest, React Testing Library, jsdom |

---

## Testing

```bash
npm test
```

497 tests across 21 files, covering the XP curve and credit bands, the Discipline
Score and its resistance to task-spam, rank evaluation and the permanence guarantee,
titles and rarity, weekly and boss challenges, the progression timeline, the recurrence
engine, filters, analytics, habit maths, calendar and deadline helpers, schema
migration through v4, backup validation, the full reducer, auth, the pomodoro state
machine, and mission-card and Hunter Profile rendering.

Several tests assert *product* rules rather than behaviour — that no challenge or
Discipline band copy contains failure language, that an unfinished week emits nothing at
all, and that a day of task-splitting unlocks none of the consistency records. Those are
the constraints most likely to be broken by accident later.

Component tests query by accessible role and name, so they double as an accessibility
check.

---

## Firebase Setup

To point the app at your own Firebase project:

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Authentication** → Email/Password and Google
3. Create a **Cloud Firestore** database
4. Publish the rules from [`firestore.rules`](firestore.rules)
5. Replace the web config in
   [`frontend/src/services/firebase.js`](frontend/src/services/firebase.js)

The web config is public by design — security comes from Auth plus the Firestore rules,
which restrict every user to their own `tasks/{uid}` document.

---

## Deployment

The build is a plain SPA, so any static host works.

- **Netlify** — config in [`netlify.toml`](netlify.toml), publishes `frontend/dist`
  with an SPA fallback so deep links resolve
- Add your production domain to **Firebase Auth → Authorized domains**
- Serve over HTTPS: the service worker and notifications both require it

---

## Roadmap

- [ ] Seasonal or monthly challenges, on the same derived-from-history model as the week
- [ ] Cosmetic profile customisation (frames, auras) unlocked by rank
- [ ] Sub-tasks and checklists inside a mission
- [ ] Guilds — shared boards and co-op daily quests
- [ ] Calendar import from Google Calendar / .ics
- [ ] Focus statistics from pomodoro sessions, folded into analytics
- [ ] Push notifications via FCM so reminders fire with the app closed
- [ ] Rich habit types (counters and durations, not just done/not-done)
- [ ] Per-mission time tracking
- [ ] Widgets and a mobile home-screen quick-add shortcut

---

## License

MIT — see [LICENSE](LICENSE).
