import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, RotateCcw, SkipForward, X, Timer, Settings2 } from "lucide-react";
import { usePomodoro, formatClock, PHASES } from "../hooks/usePomodoro";

/** Circular progress dial around the clock face. */
function Dial({ progress, color, children }) {
  const size = 172;
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(148,163,184,0.12)"
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          animate={{ strokeDashoffset: circumference * (1 - progress) }}
          transition={{ duration: 0.3, ease: "linear" }}
          style={{ filter: `drop-shadow(0 0 8px ${color})` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
    </div>
  );
}

/**
 * Floating pomodoro panel. Lives at the app root so the timer keeps running
 * across route changes.
 */
export default function PomodoroTimer({ open, onClose, settings, onUpdateDurations }) {
  const [editing, setEditing] = useState(false);
  const timer = usePomodoro(settings?.pomodoro, {
    sound: settings?.sound,
    notifications: settings?.notifications?.enabled && settings?.notifications?.pomodoro,
  });

  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          className="fixed z-40 bottom-24 lg:bottom-8 right-4 sm:right-5 w-[min(22rem,calc(100vw-2rem))]
            glass neon-border rounded-2xl p-5"
          role="dialog"
          aria-label="Pomodoro timer"
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.92 }}
          transition={{ type: "spring", stiffness: 280, damping: 26 }}
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <h2 className="font-display font-black text-sm tracking-[0.2em] text-slate-100">
                FOCUS CHAMBER
              </h2>
              <p className="text-[10px] tracking-[0.2em] text-cyan-300/70 font-semibold mt-0.5">
                ROUND {timer.round} · {timer.completedRounds} CLEARED
              </p>
            </div>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setEditing((v) => !v)}
                aria-label="Custom durations"
                aria-expanded={editing}
                className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-cyan-400/10 transition-colors
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70"
              >
                <Settings2 size={16} aria-hidden />
              </button>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close timer"
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70"
              >
                <X size={16} aria-hidden />
              </button>
            </div>
          </div>

          {/* phase switcher */}
          <div className="grid grid-cols-3 gap-1.5 mb-4" role="tablist" aria-label="Timer phase">
            {Object.values(PHASES).map((p) => (
              <button
                key={p.key}
                type="button"
                role="tab"
                aria-selected={timer.phase === p.key}
                onClick={() => timer.setPhase(p.key)}
                className={`text-[9px] font-bold tracking-wider py-1.5 rounded-lg border transition-all
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70 ${
                    timer.phase === p.key ? "" : "opacity-45 hover:opacity-90"
                  }`}
                style={{
                  color: p.color,
                  borderColor: `${p.color}${timer.phase === p.key ? "88" : "33"}`,
                  background: `${p.color}${timer.phase === p.key ? "1c" : "08"}`,
                }}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="flex flex-col items-center">
            <Dial progress={timer.progress} color={timer.meta.color}>
              <span
                className="font-display font-black text-3xl tabular-nums"
                style={{ color: timer.meta.color, textShadow: `0 0 18px ${timer.meta.color}88` }}
                aria-live="off"
              >
                {formatClock(timer.remaining)}
              </span>
              <span className="text-[9px] tracking-[0.3em] font-bold text-slate-500 mt-1">
                {timer.meta.label}
              </span>
            </Dial>
            <p className="text-[11px] text-slate-500 mt-2 text-center">{timer.meta.blurb}</p>
          </div>

          <div className="flex items-center justify-center gap-2 mt-4">
            <motion.button
              type="button"
              onClick={timer.toggle}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.94 }}
              aria-label={timer.running ? "Pause timer" : "Start timer"}
              className="inline-flex items-center gap-2 font-display font-bold text-xs tracking-[0.2em] text-white rounded-xl px-5 py-2.5
                bg-gradient-to-r from-violet-600 to-cyan-500 shadow-[0_0_20px_rgba(124,58,237,0.5)]
                hover:shadow-[0_0_32px_rgba(6,182,212,0.6)] transition-shadow
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70"
            >
              {timer.running ? <Pause size={14} aria-hidden /> : <Play size={14} aria-hidden />}
              {timer.running ? "PAUSE" : "START"}
            </motion.button>
            <button
              type="button"
              onClick={timer.reset}
              aria-label="Reset this phase"
              title="Reset this phase"
              className="p-2.5 rounded-xl text-slate-400 hover:text-amber-300 hover:bg-amber-500/10 border border-white/10 transition-colors
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70"
            >
              <RotateCcw size={15} aria-hidden />
            </button>
            <button
              type="button"
              onClick={timer.skip}
              aria-label="Skip to next phase"
              title="Skip to next phase"
              className="p-2.5 rounded-xl text-slate-400 hover:text-cyan-300 hover:bg-cyan-400/10 border border-white/10 transition-colors
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70"
            >
              <SkipForward size={15} aria-hidden />
            </button>
          </div>

          <AnimatePresence initial={false}>
            {editing && (
              <motion.div
                key="durations"
                className="overflow-hidden"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="grid grid-cols-2 gap-2.5 pt-4 mt-4 border-t border-white/5">
                  {[
                    { key: "work", label: "Focus (min)" },
                    { key: "shortBreak", label: "Short break" },
                    { key: "longBreak", label: "Long break" },
                    { key: "rounds", label: "Rounds → long" },
                  ].map((field) => (
                    <div key={field.key}>
                      <label
                        htmlFor={`pomo-${field.key}`}
                        className="text-[9px] uppercase tracking-[0.2em] font-bold text-violet-300/80"
                      >
                        {field.label}
                      </label>
                      <input
                        id={`pomo-${field.key}`}
                        type="number"
                        min="1"
                        max={field.key === "rounds" ? 12 : 180}
                        value={settings?.pomodoro?.[field.key] ?? 25}
                        onChange={(e) =>
                          onUpdateDurations?.({
                            ...settings.pomodoro,
                            [field.key]: Math.max(1, Number(e.target.value) || 1),
                          })
                        }
                        className="holo-input mt-1 w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-sm text-slate-100 [color-scheme:dark]"
                      />
                    </div>
                  ))}
                </div>
                <p className="text-[9px] tracking-[0.2em] text-slate-600 mt-2">
                  25/5 IS THE CLASSIC. CHANGES APPLY WHEN THE TIMER IS IDLE.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

export { Timer as PomodoroIcon };
