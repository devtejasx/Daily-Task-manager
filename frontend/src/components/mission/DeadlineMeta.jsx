import { CalendarDays, Clock, AlarmClock, Timer, BellRing } from "lucide-react";
import { dueBadge, dueDateTime, formatCountdown, humanDay } from "../../utils/date";
import { useCountdown } from "../../hooks/useCountdown";
import { REMINDER_OPTIONS } from "../../game/constants";

/** Colour + glow per deadline state, tuned to the existing rank palette. */
const TONES = {
  overdue: "text-red-400",
  today: "text-cyan-300",
  tomorrow: "text-amber-300",
  soon: "text-slate-300",
  future: "text-slate-400",
  none: "text-slate-500",
};

/**
 * Due-date chips for a mission card: the day badge (Overdue / Today /
 * Tomorrow / In Nd / date), the due time, a live countdown and the
 * configured reminder.
 */
export default function DeadlineMeta({ mission, showCountdown = true }) {
  const completed = mission.status === "completed";
  const badge = dueBadge(mission);
  const due = dueDateTime(mission);
  // Frozen once cleared — a finished mission shouldn't keep ticking.
  const remaining = useCountdown(due, showCountdown && !completed);
  const reminder = REMINDER_OPTIONS.find((r) => r.value === mission.reminder);

  return (
    <>
      <span
        className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
          completed ? TONES.none : TONES[badge.tone]
        }`}
        title={`Due ${humanDay(mission.dueDate)}${mission.dueTime ? ` at ${mission.dueTime}` : ""}`}
      >
        <CalendarDays size={13} aria-hidden />
        {badge.label}
        {mission.endDate && mission.endDate > mission.dueDate && (
          <span className="text-slate-500"> → {humanDay(mission.endDate)}</span>
        )}
      </span>

      {mission.dueTime && (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400">
          <Clock size={12} aria-hidden />
          {mission.dueTime}
        </span>
      )}

      {!completed && remaining != null && (
        <span
          className={`inline-flex items-center gap-1 text-xs font-semibold tabular-nums ${
            remaining <= 0 ? "text-red-400" : remaining < 3_600_000 ? "text-amber-300" : "text-slate-400"
          }`}
          title={remaining <= 0 ? "Past the deadline" : "Time remaining"}
        >
          {remaining <= 0 ? <AlarmClock size={12} aria-hidden /> : <Timer size={12} aria-hidden />}
          {remaining <= 0 ? `${formatCountdown(remaining)} late` : formatCountdown(remaining)}
        </span>
      )}

      {reminder && !completed && (
        <span
          className="inline-flex items-center gap-1 text-[10px] font-semibold text-violet-300/70"
          title={`Reminder: ${reminder.label}`}
        >
          <BellRing size={11} aria-hidden />
          {reminder.label}
        </span>
      )}
    </>
  );
}
