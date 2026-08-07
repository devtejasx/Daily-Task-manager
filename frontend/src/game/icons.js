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
