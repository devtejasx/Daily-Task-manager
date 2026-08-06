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
  { id: "settings", path: "/settings", label: "Settings", icon: SettingsIcon },
];

export function pathForView(view) {
  return VIEW_PATHS[view] ?? "/dashboard";
}
