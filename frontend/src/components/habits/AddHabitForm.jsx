import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { HABIT_CADENCES } from "../../game/constants";
import { HABIT_ICONS, iconByName } from "../../game/icons";

const COLORS = ["#06b6d4", "#7c3aed", "#10b981", "#f59e0b", "#ef4444", "#a78bfa", "#3b82f6"];

const BLANK = { title: "", icon: "Flame", color: "#06b6d4", cadence: "daily", xp: 50 };

/** Inline habit creator — no modal, the form is short enough to live on the page. */
export default function AddHabitForm({ onAdd, onCancel }) {
  const [form, setForm] = useState(BLANK);

  const submit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    onAdd({ ...form, title: form.title.trim(), xp: Math.max(5, Number(form.xp) || 50) });
    setForm(BLANK);
    onCancel?.();
  };

  return (
    <motion.form
      onSubmit={submit}
      className="glass neon-border rounded-2xl p-5 space-y-4"
      initial={{ opacity: 0, y: -10, height: 0 }}
      animate={{ opacity: 1, y: 0, height: "auto" }}
      exit={{ opacity: 0, y: -10, height: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      <div>
        <label
          htmlFor="habit-title"
          className="text-[10px] uppercase tracking-[0.25em] font-bold text-violet-300/80"
        >
          Habit
        </label>
        <input
          id="habit-title"
          autoFocus
          required
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          placeholder="e.g. Morning conditioning"
          className="holo-input mt-1.5 w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500"
        />
      </div>

      <div>
        <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-violet-300/80">
          Sigil
        </span>
        <div className="mt-1.5 flex flex-wrap gap-1.5" role="radiogroup" aria-label="Habit icon">
          {HABIT_ICONS.map((name) => {
            const Icon = iconByName(name);
            const selected = form.icon === name;
            return (
              <button
                key={name}
                type="button"
                role="radio"
                aria-checked={selected}
                aria-label={name}
                onClick={() => setForm((f) => ({ ...f, icon: name }))}
                className={`p-2 rounded-lg border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70 ${
                  selected ? "scale-105" : "opacity-45 hover:opacity-90"
                }`}
                style={{
                  color: form.color,
                  borderColor: `${form.color}${selected ? "88" : "22"}`,
                  background: `${form.color}${selected ? "1c" : "06"}`,
                }}
              >
                <Icon size={16} aria-hidden />
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-violet-300/80">
            Colour
          </span>
          <div className="mt-1.5 flex gap-1.5" role="radiogroup" aria-label="Habit colour">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                role="radio"
                aria-checked={form.color === c}
                aria-label={`Colour ${c}`}
                onClick={() => setForm((f) => ({ ...f, color: c }))}
                className={`w-6 h-6 rounded-full transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70 ${
                  form.color === c ? "scale-110 ring-2 ring-white/60" : "opacity-60 hover:opacity-100"
                }`}
                style={{ background: c, boxShadow: `0 0 10px ${c}88` }}
              />
            ))}
          </div>
        </div>

        <div>
          <label
            htmlFor="habit-cadence"
            className="text-[10px] uppercase tracking-[0.25em] font-bold text-violet-300/80"
          >
            Cadence
          </label>
          <select
            id="habit-cadence"
            value={form.cadence}
            onChange={(e) => setForm((f) => ({ ...f, cadence: e.target.value }))}
            className="holo-input mt-1.5 w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-100 [color-scheme:dark]"
          >
            {Object.entries(HABIT_CADENCES).map(([key, meta]) => (
              <option key={key} value={key} className="bg-[#0b1120]">
                {meta.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="habit-xp"
            className="text-[10px] uppercase tracking-[0.25em] font-bold text-violet-300/80"
          >
            XP per log
          </label>
          <input
            id="habit-xp"
            type="number"
            min="5"
            step="5"
            value={form.xp}
            onChange={(e) => setForm((f) => ({ ...f, xp: e.target.value }))}
            className="holo-input mt-1.5 w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-amber-300 font-bold [color-scheme:dark]"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <motion.button
          type="submit"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="flex-1 inline-flex items-center justify-center gap-2 font-display font-bold tracking-[0.2em] text-xs py-2.5 rounded-xl text-white
            bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-500 shadow-[0_0_24px_rgba(124,58,237,0.5)]
            hover:shadow-[0_0_36px_rgba(6,182,212,0.6)] transition-shadow
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70"
        >
          <Sparkles size={14} aria-hidden /> FORGE HABIT
        </motion.button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 rounded-xl text-xs font-bold tracking-[0.2em] text-slate-400 border border-white/10 hover:text-slate-200 transition-colors
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70"
          >
            CANCEL
          </button>
        )}
      </div>
    </motion.form>
  );
}
