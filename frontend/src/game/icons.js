import {
  Sunrise,
  Zap,
  Swords,
  Flame,
  CalendarCheck,
  ShieldCheck,
  Sparkles,
  Crown,
  BadgeCheck,
  Medal,
  Trophy,
  Skull,
} from "lucide-react";

/** Icons referenced by name from achievement/toast definitions (keeps tree-shaking intact) */
export const ICON_MAP = {
  Sunrise,
  Zap,
  Swords,
  Flame,
  CalendarCheck,
  ShieldCheck,
  Sparkles,
  Crown,
  BadgeCheck,
  Medal,
  Trophy,
  Skull,
};

export function iconByName(name) {
  return ICON_MAP[name] ?? Sparkles;
}
