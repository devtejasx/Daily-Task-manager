import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, ChevronDown } from "lucide-react";
import { DIFFICULTIES, CATEGORIES } from "../data/missions";
import { PRIORITIES, localISO } from "../game/constants";
import RecurrencePicker from "./mission/RecurrencePicker";

const BLANK = {
  title: "",
  description: "",
  difficulty: "C",
  priority: "MEDIUM",
  dueDate: localISO(),
  dueTime: "18:00",
  category: "Training",
  xp: null, // null -> use defaultXP
  recurrence: null, // null -> one-off mission
};

export default function AddMissionModal({ open, onClose, onAdd, defaultXP = 300, initial = null }) {
  const [form, setForm] = useState(BLANK);
  const [pulsing, setPulsing] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Seed the form from a quick-start template when the modal opens.
  const wasOpen = useRef(false);
  useEffect(() => {
    if (open && !wasOpen.current) {
      setForm({ ...BLANK, ...(initial || {}) });
      setShowAdvanced(false);
    }
    wasOpen.current = open;
  }, [open, initial]);

  // Esc to close (Enter-to-create is native form submit)
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const rewardXP = form.xp ?? defaultXP;

  const submit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setPulsing(true);
    setTimeout(() => {
      onAdd({
        ...form,
        title: form.title.trim(),
        description: form.description.trim() || "No briefing provided.",
        xp: Math.max(10, Number(rewardXP) || defaultXP),
        status: "active",
      });
      setPulsing(false);
      setForm((f) => ({ ...f, title: "", description: "", xp: null, recurrence: null }));
      onClose();
    }, 350);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.form
            onSubmit={submit}
            className="glass neon-border relative w-full max-w-lg rounded-2xl p-6 sm:p-7 z-10 max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.85, y: 30, filter: "blur(8px)" }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.9, y: 20, filter: "blur(6px)" }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-display font-black text-lg tracking-widest text-slate-100 text-glow-arcane">
                  NEW MISSION
                </h2>
                <p className="text-[10px] tracking-[0.3em] text-cyan-300/70 font-semibold mt-0.5">
                  QUEST REGISTRATION TERMINAL
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              {/* --- essentials --- */}
              <div>
                <label className="text-[10px] uppercase tracking-[0.25em] font-bold text-violet-300/80">
                  Mission Title
                </label>
                <input
                  autoFocus
                  value={form.title}
                  onChange={set("title")}
                  placeholder="e.g. Clear the Inbox Dungeon"
                  className="holo-input mt-1.5 w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-[0.25em] font-bold text-violet-300/80">
                  Priority
                </label>
                <div className="mt-1.5 grid grid-cols-4 gap-1.5">
                  {Object.entries(PRIORITIES).map(([key, p]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, priority: key }))}
                      className={`text-[10px] font-bold tracking-wider py-1.5 rounded-lg border transition-all ${
                        form.priority === key ? "" : "opacity-45 hover:opacity-90"
                      }`}
                      style={{
                        color: p.color,
                        borderColor: `${p.color}${form.priority === key ? "88" : "33"}`,
                        background: `${p.color}${form.priority === key ? "1c" : "08"}`,
                        boxShadow: form.priority === key ? `0 0 12px ${p.color}44` : "none",
                      }}
                    >
                      {p.label.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase tracking-[0.25em] font-bold text-violet-300/80">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={form.dueDate}
                    onChange={set("dueDate")}
                    className="holo-input mt-1.5 w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-100 [color-scheme:dark]"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-[0.25em] font-bold text-violet-300/80">
                    Category
                  </label>
                  <select
                    value={form.category}
                    onChange={set("category")}
                    className="holo-input mt-1.5 w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-100 [color-scheme:dark]"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c} className="bg-[#0b1120]">
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* --- more options (advanced) --- */}
              <button
                type="button"
                onClick={() => setShowAdvanced((v) => !v)}
                className="flex items-center gap-1.5 text-[10px] font-bold tracking-[0.25em] text-cyan-300/80 hover:text-cyan-200 transition-colors"
              >
                <ChevronDown size={13} className={`transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
                MORE OPTIONS
              </button>

              <AnimatePresence initial={false}>
                {showAdvanced && (
                  <motion.div
                    key="advanced"
                    className="space-y-4 overflow-hidden"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div>
                      <label className="text-[10px] uppercase tracking-[0.25em] font-bold text-violet-300/80">
                        Briefing
                      </label>
                      <textarea
                        value={form.description}
                        onChange={set("description")}
                        rows={2}
                        placeholder="Describe the objective..."
                        className="holo-input mt-1.5 w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 resize-none"
                      />
                    </div>

                    <RecurrencePicker
                      value={form.recurrence}
                      onChange={(recurrence) => setForm((f) => ({ ...f, recurrence }))}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] uppercase tracking-[0.25em] font-bold text-violet-300/80">
                          Difficulty
                        </label>
                        <div className="mt-1.5 grid grid-cols-6 gap-1.5">
                          {Object.keys(DIFFICULTIES).map((d) => (
                            <button
                              key={d}
                              type="button"
                              onClick={() => setForm((f) => ({ ...f, difficulty: d }))}
                              className={`font-display font-bold text-xs py-2 rounded-lg border transition-all duration-200 ${
                                form.difficulty === d ? "scale-105" : "opacity-50 hover:opacity-90"
                              }`}
                              style={{
                                color: DIFFICULTIES[d].color,
                                borderColor: `${DIFFICULTIES[d].color}${form.difficulty === d ? "aa" : "33"}`,
                                background: `${DIFFICULTIES[d].color}${form.difficulty === d ? "22" : "0a"}`,
                                boxShadow: form.difficulty === d ? `0 0 14px ${DIFFICULTIES[d].glow}` : "none",
                              }}
                            >
                              {d}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] uppercase tracking-[0.25em] font-bold text-violet-300/80">
                            XP Reward
                          </label>
                          <input
                            type="number"
                            min="10"
                            step="10"
                            value={rewardXP}
                            onChange={(e) => setForm((f) => ({ ...f, xp: e.target.value }))}
                            className="holo-input mt-1.5 w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-amber-300 font-bold [color-scheme:dark]"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase tracking-[0.25em] font-bold text-violet-300/80">
                            Due Time
                          </label>
                          <input
                            type="time"
                            value={form.dueTime}
                            onChange={set("dueTime")}
                            className="holo-input mt-1.5 w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-100 [color-scheme:dark]"
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                type="submit"
                className="relative w-full mt-1 font-display font-bold tracking-[0.25em] text-sm py-3 rounded-xl text-white overflow-hidden
                  bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-500
                  shadow-[0_0_24px_rgba(124,58,237,0.5)] hover:shadow-[0_0_36px_rgba(6,182,212,0.6)] transition-shadow"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                animate={
                  pulsing
                    ? { boxShadow: ["0 0 24px rgba(124,58,237,0.5)", "0 0 70px rgba(6,182,212,0.95)", "0 0 24px rgba(124,58,237,0.5)"] }
                    : {}
                }
                transition={{ duration: 0.35 }}
              >
                <span className="inline-flex items-center gap-2 justify-center">
                  <Sparkles size={15} /> REGISTER MISSION
                </span>
              </motion.button>
              <p className="text-center text-[9px] text-slate-500 tracking-wider">
                PRESS ENTER TO CREATE · ESC TO CANCEL
              </p>
            </div>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
