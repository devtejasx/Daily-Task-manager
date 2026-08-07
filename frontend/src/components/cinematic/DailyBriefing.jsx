import { useEffect, useMemo, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Flame, Target, Zap } from "lucide-react";
import { DAILY_REQUIRED, HUNTER_RANKS, nextRank } from "../../game/constants";
import { greetingForDay, streakLine } from "../../game/copy";

/**
 * The returning hunter's briefing.
 *
 * Shown once a day, on the first load of a day that isn't the hunter's
 * first. Its job is to make coming back feel like being welcomed rather
 * than being handed a backlog — so it leads with what they already have,
 * not with what is outstanding.
 *
 * Auto-dismisses in five seconds; a click, Escape, or the button ends it
 * sooner. Never blocks: the dashboard is already mounted behind it.
 */
export default function DailyBriefing({
  streak,
  recovery,
  levelInfo,
  rankIndex,
  dailyDone,
  weeklyXP,
  today,
  onClose,
}) {
  const reduced = useReducedMotion();
  const closedRef = useRef(false);

  const close = useMemo(
    () => () => {
      if (closedRef.current) return;
      closedRef.current = true;
      onClose();
    },
    [onClose]
  );

  useEffect(() => {
    const t = window.setTimeout(close, 5000);
    const esc = (e) => e.key === "Escape" && close();
    window.addEventListener("keydown", esc);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("keydown", esc);
    };
  }, [close]);

  const rank = HUNTER_RANKS[rankIndex];
  const upcoming = nextRank(rankIndex);
  const remaining = Math.max(0, DAILY_REQUIRED - dailyDone);

  const STATS = [
    {
      icon: Flame,
      color: "#f59e0b",
      label: "STREAK",
      value: recovery ? `${recovery.streak} held` : `${streak}`,
      unit: recovery ? "" : streak === 1 ? "day" : "days",
    },
    {
      icon: Zap,
      color: "#06b6d4",
      label: "TO NEXT LEVEL",
      value: levelInfo.xpToNext.toLocaleString(),
      unit: "XP",
    },
    {
      icon: Target,
      color: "#7c3aed",
      label: "THIS WEEK",
      value: weeklyXP.toLocaleString(),
      unit: "XP",
    },
  ];

  return (
    <motion.div
      className="fixed inset-0 z-[75] flex items-center justify-center px-5"
      role="dialog"
      aria-modal="true"
      aria-label="Daily briefing"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.4 } }}
      onClick={close}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      <motion.div
        className="relative glass holo-scan neon-border rounded-2xl p-7 sm:p-9 max-w-lg w-full text-center"
        initial={reduced ? { opacity: 0 } : { opacity: 0, y: 26, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
      >
        <p
          className="font-display text-[10px] font-bold tracking-[0.3em]"
          style={{ color: rank?.color }}
        >
          {rank?.title}
        </p>

        <h2 className="font-display font-black text-2xl sm:text-3xl text-slate-100 mt-3">
          WELCOME BACK, HUNTER
        </h2>

        <p className="text-slate-400 text-sm mt-3 leading-relaxed">{greetingForDay(today)}</p>

        <div className="grid grid-cols-3 gap-3 mt-7">
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              className="rounded-xl border border-white/10 bg-white/[0.03] px-2 py-3"
              initial={reduced ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 + i * 0.1, duration: 0.45 }}
            >
              <s.icon
                size={15}
                className="mx-auto"
                style={{ color: s.color, filter: `drop-shadow(0 0 6px ${s.color})` }}
                aria-hidden
              />
              <p className="font-display font-black text-lg text-slate-100 mt-2 leading-none">
                {s.value}
              </p>
              <p className="text-[9px] tracking-[0.15em] text-slate-500 mt-1.5">
                {s.unit ? `${s.unit} · ` : ""}
                {s.label}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.p
          className="text-slate-300 text-sm mt-6 leading-relaxed"
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {streakLine(streak, recovery)}
        </motion.p>

        <motion.button
          onClick={close}
          className="mt-7 w-full font-display font-black text-xs tracking-[0.2em] text-slate-950
                     bg-gradient-to-r from-cyan-300 to-violet-300 rounded-xl px-6 py-3.5
                     hover:brightness-110 transition-[filter]
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
          initial={reduced ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          autoFocus
        >
          {remaining > 0
            ? `TAKE ON TODAY'S ${remaining} ${remaining === 1 ? "MISSION" : "MISSIONS"}`
            : "TODAY'S QUEST IS ALREADY CLEAR"}
        </motion.button>

        {upcoming && (
          <p className="text-[10px] tracking-wider text-slate-600 mt-4">
            {Math.max(0, upcoming.streak - streak)} consistent days to{" "}
            {upcoming.title.replace(" HUNTER", "")}
          </p>
        )}
      </motion.div>
    </motion.div>
  );
}
