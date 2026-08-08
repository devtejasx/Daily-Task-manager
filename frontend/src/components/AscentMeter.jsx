import { motion, useReducedMotion } from "framer-motion";
import { Flame, Target } from "lucide-react";
import { DAILY_REQUIRED, HUNTER_RANKS, nextRank } from "../game/constants";

/**
 * The always-on answer to "am I getting stronger?"
 *
 * Rank, level and streak were already in the top bar, but two things were
 * missing everywhere except the dashboard: what the hunter is climbing
 * *toward*, and whether today has been dealt with. Both belong on every
 * screen — progression the hunter has to navigate to find is progression
 * they will stop noticing.
 *
 * Compact by design: this sits beside existing chrome, so it stays quiet
 * until there is genuinely something to show.
 */
export default function AscentMeter({ rankIndex, streak, dailyDone, recovery, ascent = null }) {
  const reduced = useReducedMotion();
  const upcoming = ascent?.next ?? nextRank(rankIndex);
  const current = HUNTER_RANKS[rankIndex];

  // Progress toward the next rank now comes from the full evaluation —
  // whichever of the two routes the hunter is closer on. Falling back to
  // the streak band keeps this component usable on its own.
  const to = upcoming?.streak ?? 0;
  const progress = ascent
    ? ascent.progress
    : upcoming
    ? Math.min(1, Math.max(0, (streak - (current?.streak ?? 0)) / Math.max(1, to - (current?.streak ?? 0))))
    : 1;
  const daysLeft = upcoming ? Math.max(0, to - streak) : 0;

  const questDone = dailyDone >= DAILY_REQUIRED;

  return (
    <div className="hidden lg:flex items-center gap-4">
      {/* ---- next rank ---- */}
      <div className="min-w-[150px]">
        <div className="flex items-baseline justify-between gap-2">
          <span className="font-display text-[9px] font-bold tracking-[0.18em] text-slate-500">
            {upcoming ? "NEXT RANK" : "MAX RANK"}
          </span>
          <span
            className="font-display text-[10px] font-bold tracking-wider"
            style={{ color: (upcoming ?? current)?.color }}
          >
            {upcoming ? upcoming.title.replace(" HUNTER", "") : "NATIONAL"}
          </span>
        </div>

        <div className="mt-1 h-1.5 rounded-full bg-white/8 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{
              background: `linear-gradient(90deg, ${current?.color ?? "#94a3b8"}, ${
                (upcoming ?? current)?.color ?? "#a78bfa"
              })`,
              originX: 0,
            }}
            initial={false}
            animate={{ scaleX: progress || 0.001 }}
            transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 120, damping: 22 }}
          />
        </div>

        <p className="text-[9px] tracking-wider text-slate-500 mt-1">
          {recovery
            ? `${recovery.streak} days held — today takes them back`
            : !upcoming
            ? "nothing left to climb"
            : `${Math.round(progress * 100)}% of the way there`}
        </p>
      </div>

      {/* ---- today ---- */}
      <div
        className="flex items-center gap-2 pl-4 border-l border-white/10"
        title={`Today's quest: ${dailyDone} of ${DAILY_REQUIRED} cleared`}
      >
        <Target
          size={13}
          className={questDone ? "text-emerald-300" : "text-violet-300/70"}
          aria-hidden
        />
        <div className="flex gap-1" aria-hidden>
          {Array.from({ length: DAILY_REQUIRED }, (_, i) => (
            <motion.span
              key={i}
              className="w-1.5 h-1.5 rounded-full"
              initial={false}
              animate={{
                backgroundColor: i < dailyDone ? "#10b981" : "rgba(255,255,255,0.16)",
                scale: i < dailyDone ? 1 : 0.8,
              }}
              transition={{ type: "spring", stiffness: 260, damping: 18 }}
              style={i < dailyDone ? { boxShadow: "0 0 6px rgba(16,185,129,0.9)" } : undefined}
            />
          ))}
        </div>
        <span className="sr-only">
          Today&apos;s quest: {dailyDone} of {DAILY_REQUIRED} missions cleared
        </span>
      </div>
    </div>
  );
}

/**
 * The phone-sized answer to the same question.
 *
 * The full meter needs horizontal room the top bar simply doesn't have on a
 * handset, and the desktop version hides below `lg` — which left the primary
 * device with no persistent sense of progress at all. This keeps the two
 * facts that actually drive a day: the streak, and how much of today is done.
 */
export function AscentStrip({ rankIndex, streak, dailyDone, recovery, ascent = null }) {
  const upcoming = ascent?.next ?? nextRank(rankIndex);
  const percent = ascent ? Math.round(ascent.progress * 100) : null;

  return (
    <div className="lg:hidden flex items-center gap-3 px-4 py-2 border-t border-white/5 bg-white/[0.02]">
      <span className="flex items-center gap-1.5 shrink-0">
        <Flame
          size={13}
          className={streak > 0 ? "text-amber-400" : "text-slate-600"}
          aria-hidden
        />
        <span className="font-display font-bold text-xs text-amber-300">{streak}</span>
      </span>

      <span className="text-[10px] tracking-wider text-slate-500 truncate min-w-0">
        {recovery
          ? `${recovery.streak} days held — today takes them back`
          : !upcoming
          ? "National-Level"
          : percent != null
          ? `${percent}% to ${upcoming.title.replace(" HUNTER", "")}`
          : `${Math.max(0, upcoming.streak - streak)} days to ${upcoming.title.replace(" HUNTER", "")}`}
      </span>

      <span className="flex gap-1 ml-auto shrink-0" aria-hidden>
        {Array.from({ length: DAILY_REQUIRED }, (_, i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full"
            style={{
              background: i < dailyDone ? "#10b981" : "rgba(255,255,255,0.16)",
              boxShadow: i < dailyDone ? "0 0 6px rgba(16,185,129,0.9)" : "none",
            }}
          />
        ))}
      </span>
      <span className="sr-only">
        Today&apos;s quest: {dailyDone} of {DAILY_REQUIRED} missions cleared
      </span>
    </div>
  );
}
