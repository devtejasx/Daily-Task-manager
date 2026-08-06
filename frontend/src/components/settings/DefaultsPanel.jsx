import { motion } from "framer-motion";
import { Wand2 } from "lucide-react";
import { PRIORITIES, REMINDER_OPTIONS } from "../../game/constants";
import { DIFFICULTIES, CATEGORIES } from "../../data/missions";

/**
 * Values the New Mission form starts from. `xp: null` keeps the existing
 * behaviour of scaling the reward with the hunter's level.
 */
export default function DefaultsPanel({ defaults, onChange, levelXP }) {
  const set = (patch) => onChange({ defaults: { ...defaults, ...patch } });

  return (
    <motion.section
      className="glass neon-border rounded-2xl p-5"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.18, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      aria-labelledby="defaults-heading"
    >
      <div className="flex items-center gap-2.5 mb-1">
        <Wand2 size={17} className="text-cyan-300" aria-hidden />
        <h2
          id="defaults-heading"
          className="font-display font-bold text-sm tracking-[0.2em] text-slate-200"
        >
          MISSION DEFAULTS
        </h2>
      </div>
      <p className="text-xs text-slate-500 mb-4">
        What the New Mission form starts from every time.
      </p>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="default-priority"
            className="text-[10px] uppercase tracking-[0.25em] font-bold text-violet-300/80"
          >
            Priority
          </label>
          <select
            id="default-priority"
            value={defaults.priority}
            onChange={(e) => set({ priority: e.target.value })}
            className="holo-input mt-1.5 w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-100 [color-scheme:dark]"
          >
            {Object.entries(PRIORITIES).map(([key, p]) => (
              <option key={key} value={key} className="bg-[#0b1120]">
                {p.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="default-difficulty"
            className="text-[10px] uppercase tracking-[0.25em] font-bold text-violet-300/80"
          >
            Difficulty
          </label>
          <select
            id="default-difficulty"
            value={defaults.difficulty}
            onChange={(e) => set({ difficulty: e.target.value })}
            className="holo-input mt-1.5 w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-100 [color-scheme:dark]"
          >
            {Object.entries(DIFFICULTIES).map(([key, d]) => (
              <option key={key} value={key} className="bg-[#0b1120]">
                {d.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="default-category"
            className="text-[10px] uppercase tracking-[0.25em] font-bold text-violet-300/80"
          >
            Category
          </label>
          <select
            id="default-category"
            value={defaults.category}
            onChange={(e) => set({ category: e.target.value })}
            className="holo-input mt-1.5 w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-100 [color-scheme:dark]"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c} className="bg-[#0b1120]">
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="default-reminder"
            className="text-[10px] uppercase tracking-[0.25em] font-bold text-violet-300/80"
          >
            Reminder
          </label>
          <select
            id="default-reminder"
            value={defaults.reminder ?? ""}
            onChange={(e) => set({ reminder: e.target.value === "" ? null : Number(e.target.value) })}
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

        <div className="sm:col-span-2">
          <label
            htmlFor="default-xp"
            className="text-[10px] uppercase tracking-[0.25em] font-bold text-violet-300/80"
          >
            XP Reward
          </label>
          <div className="flex items-center gap-2 mt-1.5">
            <input
              id="default-xp"
              type="number"
              min="10"
              step="10"
              placeholder={`${levelXP} (scales with level)`}
              value={defaults.xp ?? ""}
              onChange={(e) => set({ xp: e.target.value === "" ? null : Number(e.target.value) })}
              className="holo-input flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-amber-300 font-bold [color-scheme:dark]"
            />
            {defaults.xp != null && (
              <button
                type="button"
                onClick={() => set({ xp: null })}
                className="text-[10px] font-bold tracking-wider text-slate-400 hover:text-cyan-300 border border-white/10 rounded-xl px-3 py-2 transition-colors
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70"
              >
                AUTO
              </button>
            )}
          </div>
          <p className="text-[10px] tracking-[0.15em] text-slate-600 mt-2">
            LEAVE EMPTY TO KEEP SCALING WITH YOUR HUNTER LEVEL (CURRENTLY {levelXP} XP)
          </p>
        </div>
      </div>
    </motion.section>
  );
}
