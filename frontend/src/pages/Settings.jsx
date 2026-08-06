import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FlaskConical,
  FastForward,
  Flame,
  Zap,
  RotateCcw,
  UserCircle2,
  LogOut,
} from "lucide-react";
import PreferencesPanel from "../components/settings/PreferencesPanel";
import DefaultsPanel from "../components/settings/DefaultsPanel";
import DataPanel from "../components/settings/DataPanel";
import { getPermission, requestPermissionOnce } from "../services/notifications";

export default function Settings({
  settings,
  onUpdateSettings,
  state,
  onImport,
  dimmed,
  setDimmed,
  sim,
  user,
  onSignOut,
  levelXP = 300,
}) {
  const [permission, setPermission] = useState(() => getPermission());

  // Re-read on focus: the hunter may have changed it in browser settings.
  useEffect(() => {
    const sync = () => setPermission(getPermission());
    window.addEventListener("focus", sync);
    return () => window.removeEventListener("focus", sync);
  }, []);

  const requestNotifications = useCallback(async () => {
    // `force` bypasses the once-only guard: this is a deliberate opt-in from
    // the settings page, not an unprompted popup.
    const result = await requestPermissionOnce(true);
    setPermission(result);
    if (result === "granted") {
      onUpdateSettings({ notifications: { ...settings.notifications, enabled: true } });
    }
  }, [onUpdateSettings, settings.notifications]);

  return (
    <div className="space-y-5 max-w-2xl">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="font-display font-black text-2xl text-slate-100 text-glow-arcane">
          SYSTEM CONFIG
        </h1>
        <p className="text-slate-400 text-sm mt-0.5">Tune the interface to your liking, Hunter.</p>
      </motion.div>

      {/* hunter account */}
      {user && (
        <motion.section
          className="glass neon-border rounded-2xl p-5 flex items-center justify-between gap-4"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          aria-label="Account"
        >
          <div className="flex items-center gap-4 min-w-0">
            <div className="p-2.5 rounded-xl border border-cyan-400/25 bg-cyan-400/10">
              <UserCircle2 size={19} className="text-cyan-300" aria-hidden />
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
            className="flex items-center gap-2 text-xs font-bold tracking-wider text-red-300 border border-red-400/30 bg-red-500/10 rounded-xl px-3.5 py-2.5
              hover:shadow-[0_0_16px_rgba(239,68,68,0.35)] transition-shadow shrink-0
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70"
          >
            <LogOut size={14} aria-hidden /> SIGN OUT
          </button>
        </motion.section>
      )}

      <PreferencesPanel
        settings={settings}
        onChange={onUpdateSettings}
        dimmed={dimmed}
        setDimmed={setDimmed}
        notificationPermission={permission}
        onRequestNotifications={requestNotifications}
      />

      <DefaultsPanel defaults={settings.defaults} onChange={onUpdateSettings} levelXP={levelXP} />

      <DataPanel state={state} onImport={onImport} />

      {/* chrono simulation — preview the daily/rank cinematics without waiting real days */}
      {sim && (
        <motion.section
          className="glass rounded-2xl p-5 border border-amber-400/20"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          aria-labelledby="sim-heading"
        >
          <div className="flex items-center gap-2.5 mb-1">
            <FlaskConical size={17} className="text-amber-300" aria-hidden />
            <h2
              id="sim-heading"
              className="font-display font-bold text-sm tracking-[0.2em] text-amber-200"
            >
              CHRONO SIMULATION
            </h2>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Testing chamber. Fast-forward time to preview streak failure, promotions and level-ups.
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={sim.nextDay}
              className="flex items-center gap-2 text-xs font-bold tracking-wider text-cyan-300 border border-cyan-400/30 bg-cyan-400/10 rounded-xl px-3.5 py-2.5
                hover:shadow-[0_0_16px_rgba(6,182,212,0.35)] transition-shadow
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70"
            >
              <FastForward size={14} aria-hidden /> SKIP TO NEXT DAY
            </button>
            <button
              onClick={() => sim.addStreak(21)}
              className="flex items-center gap-2 text-xs font-bold tracking-wider text-amber-300 border border-amber-400/30 bg-amber-400/10 rounded-xl px-3.5 py-2.5
                hover:shadow-[0_0_16px_rgba(245,158,11,0.35)] transition-shadow
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70"
            >
              <Flame size={14} aria-hidden /> +21 STREAK DAYS
            </button>
            <button
              onClick={() => sim.addXP(1200)}
              className="flex items-center gap-2 text-xs font-bold tracking-wider text-violet-300 border border-violet-400/30 bg-violet-500/10 rounded-xl px-3.5 py-2.5
                hover:shadow-[0_0_16px_rgba(124,58,237,0.35)] transition-shadow
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70"
            >
              <Zap size={14} aria-hidden /> +1200 XP
            </button>
            <button
              onClick={() => {
                if (window.confirm("Wipe the save and restart as a fresh hunter?")) sim.reset();
              }}
              className="flex items-center gap-2 text-xs font-bold tracking-wider text-red-300 border border-red-400/30 bg-red-500/10 rounded-xl px-3.5 py-2.5
                hover:shadow-[0_0_16px_rgba(239,68,68,0.35)] transition-shadow
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70"
            >
              <RotateCcw size={14} aria-hidden /> RESET SAVE
            </button>
          </div>
          <p className="text-[10px] text-slate-600 mt-3 tracking-wider">
            TIP: SKIP TO NEXT DAY WITH AN UNFINISHED DAILY QUEST TO WITNESS "MISSION FAILED".
          </p>
        </motion.section>
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
