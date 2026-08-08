import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { PageSkeleton } from "./components/ui/Skeleton";

/* Route-level code splitting. Dashboard and the mission board are the two
   screens a hunter lands on, so they stay in the main bundle; everything
   else — including the Recharts-heavy analytics page — is fetched on first
   visit and cached by the service worker from then on. */
import Dashboard from "./pages/Dashboard";
import Missions from "./pages/Missions";

const Calendar = lazy(() => import("./pages/Calendar"));
const Achievements = lazy(() => import("./pages/Achievements"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Habits = lazy(() => import("./pages/Habits"));
const Profile = lazy(() => import("./pages/Profile"));
const Settings = lazy(() => import("./pages/Settings"));

/**
 * The route table. Every page's props are assembled in App and handed over
 * as one bundle, so this file stays a map of URL -> screen and nothing else.
 */
export default function AppRoutes({ location, viewProps, boardProps, pageProps }) {
  return (
    <Suspense fallback={<PageSkeleton cards={2} />}>
      <Routes location={location}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard {...viewProps} />} />
        <Route path="/tasks" element={<Missions {...viewProps} {...boardProps} />} />
        <Route path="/calendar" element={<Calendar {...pageProps.calendar} />} />
        <Route path="/habits" element={<Habits {...pageProps.habits} />} />
        <Route path="/analytics" element={<Analytics {...pageProps.analytics} />} />
        <Route path="/achievements" element={<Achievements {...pageProps.achievements} />} />
        <Route path="/profile" element={<Profile {...pageProps.profile} />} />
        <Route path="/settings" element={<Settings {...pageProps.settings} />} />
        {/* Unknown URL -> the command center, never a blank screen. */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
}
