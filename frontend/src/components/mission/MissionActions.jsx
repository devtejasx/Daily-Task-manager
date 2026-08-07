import { motion } from "framer-motion";
import { Target, Trash2, SkipForward, Pause, Play } from "lucide-react";

const buttonBase =
  "p-2 rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70";
/** Desktop reveals the row on hover; touch devices keep it permanently visible. */
const revealOnHover = "opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100";

/**
 * The right-hand action rail of a mission card: daily-quest toggle, the
 * recurring-series controls (skip / pause / resume) and delete.
 */
export default function MissionActions({
  mission,
  completed,
  isDaily,
  dailyFull,
  onToggleDaily,
  onSkipOccurrence,
  onToggleRecurrencePaused,
  onDelete,
}) {
  const recurrence = mission.recurrence;
  const paused = Boolean(recurrence?.paused);

  return (
    <div className="flex flex-col gap-1 shrink-0">
      {onToggleDaily && !completed && (
        <motion.button
          type="button"
          onClick={() => onToggleDaily(mission.id)}
          aria-label={isDaily ? "Remove from daily missions" : "Set as daily mission"}
          aria-pressed={isDaily}
          title={
            isDaily
              ? "Remove from today's required missions"
              : dailyFull
              ? "Daily slots full (4/4)"
              : "Set as today's required mission"
          }
          disabled={!isDaily && dailyFull}
          className={`${buttonBase} ${
            isDaily
              ? "text-violet-300 bg-violet-500/15 shadow-[0_0_14px_rgba(124,58,237,0.45)]"
              : dailyFull
              ? "text-slate-700 cursor-not-allowed"
              : `text-slate-500 hover:text-violet-300 hover:bg-violet-500/10 ${revealOnHover}`
          }`}
          whileTap={{ scale: 0.85 }}
        >
          <Target size={16} aria-hidden />
        </motion.button>
      )}

      {recurrence && !completed && onSkipOccurrence && (
        <motion.button
          type="button"
          onClick={() => onSkipOccurrence(mission.id)}
          aria-label="Skip this occurrence"
          title="Skip this occurrence — jumps to the next date, no XP awarded"
          className={`${buttonBase} text-slate-500 hover:text-amber-300 hover:bg-amber-500/10 ${revealOnHover}`}
          whileTap={{ scale: 0.85 }}
        >
          <SkipForward size={16} aria-hidden />
        </motion.button>
      )}

      {recurrence && onToggleRecurrencePaused && (
        <motion.button
          type="button"
          onClick={() => onToggleRecurrencePaused(mission.id, !paused)}
          aria-label={paused ? "Resume recurring mission" : "Pause recurring mission"}
          aria-pressed={paused}
          title={
            paused
              ? "Resume — new occurrences will be generated again"
              : "Pause — stop generating new occurrences"
          }
          className={`${buttonBase} ${
            paused
              ? "text-emerald-300 bg-emerald-500/10"
              : `text-slate-500 hover:text-cyan-300 hover:bg-cyan-500/10 ${revealOnHover}`
          }`}
          whileTap={{ scale: 0.85 }}
        >
          {paused ? <Play size={16} aria-hidden /> : <Pause size={16} aria-hidden />}
        </motion.button>
      )}

      <motion.button
        type="button"
        onClick={() => onDelete(mission.id)}
        aria-label={`Delete mission: ${mission.title}`}
        className={`${buttonBase} text-slate-500 hover:text-red-400 hover:bg-red-500/10 hover:shadow-[0_0_14px_rgba(239,68,68,0.35)] ${revealOnHover}`}
        whileTap={{ scale: 0.85 }}
      >
        <Trash2 size={16} aria-hidden />
      </motion.button>
    </div>
  );
}
