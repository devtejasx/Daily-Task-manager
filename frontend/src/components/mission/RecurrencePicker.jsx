import { motion, AnimatePresence } from "framer-motion";
import { RECURRENCE_TYPES } from "../../game/constants";
import { makeRecurrence, describeRecurrence } from "../../utils/recurrence";

const OPTIONS = [
  { key: null, label: "ONCE" },
  ...Object.entries(RECURRENCE_TYPES).map(([key, meta]) => ({
    key,
    label: meta.label.toUpperCase(),
  })),
];

/**
 * Recurrence selector used by the mission form.
 *
 * @param {object|null} value      current recurrence rule (null = one-off)
 * @param {(rule: object|null) => void} onChange
 */
export default function RecurrencePicker({ value, onChange }) {
  const activeType = value?.type ?? null;

  const pick = (type) => {
    if (type === null) return onChange(null);
    // Keep the interval when switching between rule types.
    onChange(makeRecurrence(type, type === "custom" ? value?.interval || 3 : 1));
  };

  return (
    <div>
      <label className="text-[10px] uppercase tracking-[0.25em] font-bold text-violet-300/80">
        Repeats
      </label>
      <div
        className="mt-1.5 grid grid-cols-5 gap-1.5"
        role="radiogroup"
        aria-label="Recurrence"
      >
        {OPTIONS.map((o) => {
          const selected = activeType === o.key;
          return (
            <button
              key={o.label}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => pick(o.key)}
              className={`text-[9px] font-bold tracking-wider py-1.5 rounded-lg border transition-all
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70 ${
                  selected
                    ? "text-violet-200 border-violet-400/70 bg-violet-500/20 shadow-[0_0_12px_rgba(124,58,237,0.35)]"
                    : "text-slate-400 border-white/10 bg-white/[0.03] opacity-70 hover:opacity-100"
                }`}
            >
              {o.label}
            </button>
          );
        })}
      </div>

      <AnimatePresence initial={false}>
        {activeType === "custom" && (
          <motion.div
            key="interval"
            className="overflow-hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center gap-2 mt-2.5">
              <span className="text-xs text-slate-400">Every</span>
              <input
                type="number"
                min="1"
                max="365"
                aria-label="Repeat interval in days"
                value={value?.interval ?? 1}
                onChange={(e) =>
                  onChange(makeRecurrence("custom", Number(e.target.value) || 1))
                }
                className="holo-input w-20 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-sm text-slate-100 [color-scheme:dark]"
              />
              <span className="text-xs text-slate-400">days</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {value && (
        <p className="text-[10px] text-cyan-300/70 tracking-wider mt-2">
          {describeRecurrence(value).toUpperCase()} · A NEW OCCURRENCE IS CREATED WHEN THIS ONE
          IS CLEARED
        </p>
      )}
    </div>
  );
}
