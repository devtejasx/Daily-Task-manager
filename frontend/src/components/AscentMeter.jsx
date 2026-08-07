import { motion, useReducedMotion } from "framer-motion";
import { Target } from "lucide-react";
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
export default function AscentMeter({ rankIndex, streak, dailyDone, recovery }) {
  const reduced = useReducedMotion();
  const upcoming = nextRank(rankIndex);
  const current = HUNTER_RANKS[rankIndex];

  // Progress across the *current* band, so the bar always reads as motion
  // rather than as a distant, discouraging fraction of the final rank.
  const from = current?.streak ?? 0;
  const to = upcoming?.streak ?? from;
  const span = Math.max(1, to - from);
  const progress = upcoming ? Math.min(1, Math.max(0, (streak - from) / span)) : 1;
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
            : upcoming
            ? `${daysLeft} more consistent ${daysLeft === 1 ? "day" : "days"}`
            : "nothing left to climb"}
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
