/* =========================================================
   Route table

   Single source of truth for the app's URLs. The sidebar, the
   legacy `setView(id)` callers and the router all read from here so
   a path only ever has to change in one place.
   ========================================================= */

import {
  LayoutDashboard,
  Swords,
  CalendarDays,
  Flame,
  BarChart3,
  Trophy,
  UserCircle2,
  Settings as SettingsIcon,
} from "lucide-react";

/** Legacy view id -> path. Keeps `setView("missions")` call sites working. */
export const VIEW_PATHS = {
  dashboard: "/dashboard",
  missions: "/tasks",
  tasks: "/tasks",
  calendar: "/calendar",
  habits: "/habits",
  analytics: "/analytics",
  achievements: "/achievements",
  profile: "/profile",
  settings: "/settings",
};

/** Sidebar / bottom-bar navigation, in display order. */
export const NAV_ITEMS = [
  { id: "dashboard", path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "missions", path: "/tasks", label: "Missions", icon: Swords },
  { id: "calendar", path: "/calendar", label: "Calendar", icon: CalendarDays },
  { id: "habits", path: "/habits", label: "Habits", icon: Flame },
  { id: "analytics", path: "/analytics", label: "Analytics", icon: BarChart3 },
  { id: "achievements", path: "/achievements", label: "Achievements", icon: Trophy },
  { id: "profile", path: "/profile", label: "Profile", icon: UserCircle2 },
  { id: "settings", path: "/settings", label: "Settings", icon: SettingsIcon },
];

export function pathForView(view) {
  return VIEW_PATHS[view] ?? "/dashboard";
}

/** Where an unrecognised URL lands. */
export const FALLBACK_PATH = "/dashboard";

/** Every path that renders a real screen. */
export const KNOWN_PATHS = new Set(Object.values(VIEW_PATHS));

/**
 * Resolve a URL to the path that should actually be rendered.
 *
 * The page transition is keyed on this rather than on the raw pathname:
 * keying on a pathname that redirects mid-flight leaves AnimatePresence's
 * `mode="wait"` holding an exiting child forever, and the page comes up
 * blank. Normalising first means the key never changes during a redirect.
 */
export function resolvePath(pathname) {
  return KNOWN_PATHS.has(pathname) ? pathname : FALLBACK_PATH;
}
