import { Repeat, PauseCircle } from "lucide-react";
import { describeRecurrence } from "../../utils/recurrence";

/**
 * Chip shown on a mission card when the mission repeats.
 * Paused series render muted so a stalled habit is obvious at a glance.
 */
export default function RecurrenceBadge({ recurrence, size = 9 }) {
  if (!recurrence) return null;
  const paused = Boolean(recurrence.paused);
  const color = paused ? "#94a3b8" : "#a78bfa";
  const Icon = paused ? PauseCircle : Repeat;

  return (
    <span
      title={describeRecurrence(recurrence)}
      className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.15em] font-bold px-2 py-0.5 rounded-full border"
      style={{
        color,
        borderColor: `${color}44`,
        background: `${color}10`,
      }}
    >
      <Icon size={size} aria-hidden />
      {describeRecurrence(recurrence)}
    </span>
  );
}
