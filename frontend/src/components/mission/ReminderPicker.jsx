import { BellRing } from "lucide-react";
import { REMINDER_OPTIONS } from "../../game/constants";

/**
 * Reminder selector for the mission form. Values are minutes before the
 * mission's due moment; null means "no reminder".
 */
export default function ReminderPicker({ value, onChange }) {
  return (
    <div>
      <label
        htmlFor="mission-reminder"
        className="text-[10px] uppercase tracking-[0.25em] font-bold text-violet-300/80 inline-flex items-center gap-1.5"
      >
        <BellRing size={11} aria-hidden /> Reminder
      </label>
      <select
        id="mission-reminder"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
        className="holo-input mt-1.5 w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-100 [color-scheme:dark]"
      >
        <option value="" className="bg-[#0b1120]">
          No reminder
        </option>
        {REMINDER_OPTIONS.map((o) => (
          <option key={o.value} value={o.value} className="bg-[#0b1120]">
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
