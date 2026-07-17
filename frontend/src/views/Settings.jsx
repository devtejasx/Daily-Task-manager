import { motion } from "framer-motion";
import { Volume2, Sparkles, MonitorSmartphone, BellRing, Eclipse, FlaskConical, FastForward, Flame, Zap, RotateCcw, UserCircle2, LogOut } from "lucide-react";
import { useState } from "react";

function Toggle({ on, onChange }) {
  return (
    <button
      onClick={() => onChange(!on)}
      role="switch"
      aria-checked={on}
      className={`relative w-11 h-6 rounded-full transition-colors duration-300 ${
        on ? "bg-gradient-to-r from-violet-600 to-cyan-500 shadow-[0_0_14px_rgba(6,182,212,0.5)]" : "bg-white/10"
      }`}
    >
      <motion.span
        className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow"
        animate={{ left: on ? "22px" : "2px" }}
        transition={{ type: "spring", stiffness: 500, damping: 32 }}
      />
    </button>
  );
}

export default function Settings({ dimmed, setDimmed, sim, user, onSignOut }) {
  const [prefs, setPrefs] = useState({
    particles: true,
    sound: false,
    notifications: true,
    compact: false,
  });
  const set = (k) => (v) => setPrefs((p) => ({ ...p, [k]: v }));

  const rows = [
    { icon: Sparkles, title: "Particle Effects", desc: "Ambient mana particles in the background.", key: "particles" },
    { icon: Volume2, title: "System Sounds", desc: "Audio cues on mission events.", key: "sound" },
    { icon: BellRing, title: "Gate Alerts", desc: "Notify when a mission is due.", key: "notifications" },
    { icon: MonitorSmartphone, title: "Compact Mode", desc: "Denser layout for smaller displays.", key: "compact" },
  ];

  return (
    <div className="space-y-5 max-w-2xl">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <h1 className="font-display font-black text-2xl text-slate-100 text-glow-arcane">SYSTEM CONFIG</h1>
        <p className="text-slate-400 text-sm mt-0.5">Tune the interface to your liking, Hunter.</p>
      </motion.div>

      {/* hunter account */}
      {user && (
        <motion.div
          className="glass neon-border rounded-2xl p-5 flex items-center justify-between gap-4"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex items-center gap-4 min-w-0">
            <div className="p-2.5 rounded-xl border border-cyan-400/25 bg-cyan-400/10">
              <UserCircle2 size={19} className="text-cyan-300" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm text-slate-200 truncate">
                {user.displayName || "Hunter"}
              </p>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={onSignOut}
            className="flex items-center gap-2 text-xs font-bold tracking-wider text-red-300 border border-red-400/30 bg-red-500/10 rounded-xl px-3.5 py-2.5 hover:shadow-[0_0_16px_rgba(239,68,68,0.35)] transition-shadow shrink-0"
          >
            <LogOut size={14} /> SIGN OUT
          </button>
        </motion.div>
      )}

      <motion.div
        className="glass neon-border rounded-2xl divide-y divide-white/5"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex items-center justify-between gap-4 p-5">
          <div className="flex items-center gap-4">
            <div className="p-2.5 rounded-xl border border-violet-400/30 bg-violet-500/10">
              <Eclipse size={19} className="text-violet-300" />
            </div>
            <div>
              <p className="font-semibold text-sm text-slate-200">Dimmed Ambience</p>
              <p className="text-xs text-slate-500">Lower the glow intensity for late-night raids.</p>
            </div>
          </div>
          <Toggle on={dimmed} onChange={setDimmed} />
        </div>
        {rows.map((r) => (
          <div key={r.key} className="flex items-center justify-between gap-4 p-5">
            <div className="flex items-center gap-4">
              <div className="p-2.5 rounded-xl border border-cyan-400/25 bg-cyan-400/10">
                <r.icon size={19} className="text-cyan-300" />
              </div>
              <div>
                <p className="font-semibold text-sm text-slate-200">{r.title}</p>
                <p className="text-xs text-slate-500">{r.desc}</p>
              </div>
            </div>
            <Toggle on={prefs[r.key]} onChange={set(r.key)} />
          </div>
        ))}
      </motion.div>

      {/* chrono simulation — preview the daily/rank cinematics without waiting real days */}
      {sim && (
        <motion.div
          className="glass rounded-2xl p-5 border border-amber-400/20"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex items-center gap-2.5 mb-1">
            <FlaskConical size={17} className="text-amber-300" />
            <h2 className="font-display font-bold text-sm tracking-[0.2em] text-amber-200">CHRONO SIMULATION</h2>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Testing chamber. Fast-forward time to preview streak failure, promotions and level-ups.
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={sim.nextDay}
              className="flex items-center gap-2 text-xs font-bold tracking-wider text-cyan-300 border border-cyan-400/30 bg-cyan-400/10 rounded-xl px-3.5 py-2.5 hover:shadow-[0_0_16px_rgba(6,182,212,0.35)] transition-shadow"
            >
              <FastForward size={14} /> SKIP TO NEXT DAY
            </button>
            <button
              onClick={() => sim.addStreak(21)}
              className="flex items-center gap-2 text-xs font-bold tracking-wider text-amber-300 border border-amber-400/30 bg-amber-400/10 rounded-xl px-3.5 py-2.5 hover:shadow-[0_0_16px_rgba(245,158,11,0.35)] transition-shadow"
            >
              <Flame size={14} /> +21 STREAK DAYS
            </button>
            <button
              onClick={() => sim.addXP(1200)}
              className="flex items-center gap-2 text-xs font-bold tracking-wider text-violet-300 border border-violet-400/30 bg-violet-500/10 rounded-xl px-3.5 py-2.5 hover:shadow-[0_0_16px_rgba(124,58,237,0.35)] transition-shadow"
            >
              <Zap size={14} /> +1200 XP
            </button>
            <button
              onClick={() => {
                if (window.confirm("Wipe the save and restart as a fresh hunter?")) sim.reset();
              }}
              className="flex items-center gap-2 text-xs font-bold tracking-wider text-red-300 border border-red-400/30 bg-red-500/10 rounded-xl px-3.5 py-2.5 hover:shadow-[0_0_16px_rgba(239,68,68,0.35)] transition-shadow"
            >
              <RotateCcw size={14} /> RESET SAVE
            </button>
          </div>
          <p className="text-[10px] text-slate-600 mt-3 tracking-wider">
            TIP: SKIP TO NEXT DAY WITH AN UNFINISHED DAILY QUEST TO WITNESS "MISSION FAILED".
          </p>
        </motion.div>
      )}

      <motion.p
        className="text-[10px] tracking-[0.25em] text-slate-600 text-center font-semibold"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        ARISE COMMAND CENTER · SYNCED TO FIREBASE CLOUD
      </motion.p>
    </div>
  );
}
