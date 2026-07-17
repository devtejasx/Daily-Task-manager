import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, CheckCircle2, Circle, Target } from "lucide-react";
import { DAILY_REQUIRED } from "../game/constants";

export default function DailyQuestPanel({ dailyMissions, dailyDone, dayComplete, onGoPick }) {
  const assigned = dailyMissions.length;
  const underAssigned = assigned < DAILY_REQUIRED;

  return (
    <motion.div
      className="glass holo-scan neon-border rounded-2xl p-5 relative overflow-hidden"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.32, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <Target size={17} className="text-violet-300" style={{ filter: "drop-shadow(0 0 6px rgba(124,58,237,0.8))" }} />
          <h2 className="font-display font-bold text-sm tracking-[0.2em] text-slate-200">
            TODAY'S REQUIRED MISSIONS
          </h2>
        </div>
        <span
          className={`font-display font-black text-lg ${
            dayComplete ? "text-emerald-300 text-glow-holo" : "text-cyan-300"
          }`}
        >
          {dailyDone}/{DAILY_REQUIRED}
          {dayComplete && <span className="text-xs ml-2 tracking-[0.2em]">COMPLETE</span>}
        </span>
      </div>

      {/* segmented progress */}
      <div className="flex gap-1.5 mt-3">
        {Array.from({ length: DAILY_REQUIRED }, (_, i) => (
          <motion.div
            key={i}
            className="h-2 flex-1 rounded-full overflow-hidden bg-white/5 border border-white/10"
            initial={false}
          >
            <motion.div
              className="h-full w-full"
              style={{
                background: "linear-gradient(90deg,#7c3aed,#06b6d4)",
                boxShadow: "0 0 10px rgba(6,182,212,0.6)",
                originX: 0,
              }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: i < dailyDone ? 1 : 0 }}
              transition={{ type: "spring", stiffness: 160, damping: 20 }}
            />
          </motion.div>
        ))}
      </div>

      {/* mission checklist */}
      <div className="mt-4 space-y-2">
        <AnimatePresence>
          {dailyMissions.map((m) => {
            const done = m.status === "completed";
            return (
              <motion.div
                key={m.id}
                layout
                className={`flex items-center gap-2.5 text-sm rounded-lg px-3 py-2 border ${
                  done
                    ? "border-emerald-400/25 bg-emerald-400/5 text-slate-400 line-through"
                    : "border-white/8 bg-white/[0.03] text-slate-200"
                }`}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
              >
                {done ? (
                  <CheckCircle2 size={15} className="text-emerald-400 shrink-0" style={{ filter: "drop-shadow(0 0 5px rgba(16,185,129,0.8))" }} />
                ) : (
                  <Circle size={15} className="text-violet-400/60 shrink-0" />
                )}
                <span className="truncate">{m.title}</span>
                <span className="ml-auto text-[10px] font-bold text-amber-300/80 shrink-0">+{m.xp} XP</span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* animated warning when under-assigned */}
      <AnimatePresence>
        {underAssigned && (
          <motion.button
            onClick={onGoPick}
            className="mt-4 w-full flex items-center gap-2.5 text-left rounded-xl border border-red-500/40 bg-red-500/10 px-3.5 py-2.5"
            initial={{ opacity: 0, y: 10 }}
            animate={{
              opacity: 1,
              y: 0,
              boxShadow: [
                "0 0 0px rgba(239,68,68,0.0)",
                "0 0 22px rgba(239,68,68,0.45)",
                "0 0 0px rgba(239,68,68,0.0)",
              ],
            }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ boxShadow: { duration: 1.6, repeat: Infinity }, default: { duration: 0.4 } }}
          >
            <motion.span
              animate={{ rotate: [0, -12, 12, -8, 8, 0] }}
              transition={{ duration: 0.9, repeat: Infinity, repeatDelay: 1.4 }}
            >
              <AlertTriangle size={17} className="text-red-400" />
            </motion.span>
            <span className="text-xs font-bold tracking-wide text-red-300">
              ONLY {assigned}/{DAILY_REQUIRED} DAILY MISSIONS ASSIGNED — the system demands {DAILY_REQUIRED}.
              <span className="block text-[10px] font-semibold text-red-200/70 mt-0.5 tracking-[0.15em]">
                TAP TO ASSIGN MISSIONS FROM THE BOARD
              </span>
            </span>
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
