import {
  Sunrise,
  Zap,
  Swords,
  Flame,
  CalendarCheck,
  ShieldCheck,
  Hourglass,
  Repeat,
  Sparkles,
  Crown,
  BadgeCheck,
  Medal,
  Trophy,
  Skull,
  Dumbbell,
  BookOpen,
  Brain,
  Droplets,
  Moon,
  Leaf,
  Coffee,
  Music,
  PenLine,
  Footprints,
  BarChart3,
  Target,
  FilterX,
  CalendarDays,
  TrendingUp,
} from "lucide-react";

/** Icons referenced by name from achievement/toast definitions (keeps tree-shaking intact) */
export const ICON_MAP = {
  Sunrise,
  Zap,
  Swords,
  Flame,
  CalendarCheck,
  ShieldCheck,
  Hourglass,
  Repeat,
  Sparkles,
  Crown,
  BadgeCheck,
  Medal,
  Trophy,
  Skull,
  // habit icons
  Dumbbell,
  BookOpen,
  Brain,
  Droplets,
  Moon,
  Leaf,
  Coffee,
  Music,
  PenLine,
  Footprints,
  // empty-state icons
  BarChart3,
  Target,
  FilterX,
  CalendarDays,
  // progression icons
  TrendingUp,
};

/** The subset offered when creating a habit. */
export const HABIT_ICONS = [
  "Flame",
  "Dumbbell",
  "BookOpen",
  "Brain",
  "Droplets",
  "Moon",
  "Leaf",
  "Coffee",
  "Music",
  "PenLine",
  "Footprints",
  "Sparkles",
];

export function iconByName(name) {
  return ICON_MAP[name] ?? Sparkles;
}
