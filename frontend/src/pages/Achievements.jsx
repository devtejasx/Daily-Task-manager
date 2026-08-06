import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { ACHIEVEMENTS } from "../game/constants";
import { iconByName } from "../game/icons";

export default function Achievements({ achievements }) {
  const unlockedCount = ACHIEVEMENTS.filter((a) => achievements[a.id]).length;

  return (
    <div className="space-y-5">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <h1 className="font-display font-black text-2xl text-slate-100 text-glow-arcane">HALL OF RECORDS</h1>
        <p className="text-slate-400 text-sm mt-0.5">
          {unlockedCount} of {ACHIEVEMENTS.length} feats etched into the system.
        </p>
      </motion.div>

      {unlockedCount === 0 && (
        <motion.div
          className="glass rounded-2xl p-6 text-center border border-violet-400/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
        >
          <h3 className="font-display font-bold text-slate-200 tracking-wide">YOUR LEGEND HAS YET TO BEGIN</h3>
          <p className="text-sm text-slate-500 mt-1.5">Complete missions to unlock achievements and etch your name into the system.</p>
        </motion.div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {ACHIEVEMENTS.map((a, i) => {
          const unlockedAt = achievements[a.id];
          const unlocked = Boolean(unlockedAt);
          const Icon = iconByName(a.icon);
          return (
            <motion.div
              key={a.id}
              className={`glass rounded-2xl p-5 relative overflow-hidden ${unlocked ? "neon-border" : ""}`}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.06 + i * 0.06, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              whileHover={unlocked ? { y: -4 } : {}}
            >
              {unlocked && (
                <div
                  className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-2xl opacity-30"
                  style={{ background: a.color }}
                />
              )}
              <div className="flex items-start gap-4 relative">
                <div
                  className={`p-3 rounded-xl border ${unlocked ? "animate-float-slow" : ""}`}
                  style={{
                    borderColor: unlocked ? `${a.color}55` : "rgba(255,255,255,0.08)",
                    background: unlocked ? `${a.color}15` : "rgba(255,255,255,0.03)",
                    boxShadow: unlocked ? `0 0 18px ${a.color}44` : "none",
                  }}
                >
                  {unlocked ? <Icon size={22} style={{ color: a.color }} /> : <Lock size={22} className="text-slate-600" />}
                </div>
                <div>
                  <h3 className={`font-display font-bold text-sm tracking-wide ${unlocked ? "text-slate-100" : "text-slate-500"}`}>
                    {a.title}
                  </h3>
                  <p className={`text-xs mt-1 ${unlocked ? "text-slate-400" : "text-slate-600"}`}>{a.desc}</p>
                  <span
                    className={`inline-block mt-2.5 text-[9px] font-bold tracking-[0.25em] px-2 py-0.5 rounded-full border ${
                      unlocked
                        ? "text-emerald-300 border-emerald-400/30 bg-emerald-400/10"
                        : "text-slate-600 border-white/10"
                    }`}
                  >
                    {unlocked
                      ? `UNLOCKED · ${new Date(unlockedAt + "T12:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric" })}`
                      : "SEALED"}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
