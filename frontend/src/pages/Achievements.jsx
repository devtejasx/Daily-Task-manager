import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { ACHIEVEMENTS, ACHIEVEMENT_CATEGORIES } from "../game/constants";
import { RARITY_ORDER, rarityOf } from "../game/rarity";
import { iconByName } from "../game/icons";
import { EMPTY } from "../game/copy";

/** One record. Only Epic and Legendary are allowed to glow — see game/rarity. */
function RecordCard({ achievement, unlockedAt, index }) {
  const unlocked = Boolean(unlockedAt);
  const rarity = rarityOf(achievement.rarity);
  const Icon = iconByName(achievement.icon);
  const shout = unlocked && rarity.glow;

  return (
    <motion.li
      className={`glass rounded-2xl p-5 relative overflow-hidden list-none ${
        shout ? "neon-border" : ""
      }`}
      style={unlocked ? { borderColor: `${rarity.color}33` } : undefined}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(0.3, index * 0.04), duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      whileHover={unlocked ? { y: -4 } : {}}
    >
      {shout && (
        <div
          className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-2xl opacity-30"
          style={{ background: achievement.color }}
          aria-hidden
        />
      )}
      <div className="flex items-start gap-4 relative">
        <div
          className={`p-3 rounded-xl border shrink-0 ${shout ? "animate-float-slow" : ""}`}
          style={{
            borderColor: unlocked ? `${achievement.color}55` : "rgba(255,255,255,0.08)",
            background: unlocked ? `${achievement.color}15` : "rgba(255,255,255,0.03)",
            boxShadow: shout ? `0 0 18px ${achievement.color}44` : "none",
          }}
        >
          {unlocked ? (
            <Icon size={22} style={{ color: achievement.color }} aria-hidden />
          ) : (
            <Lock size={22} className="text-slate-600" aria-hidden />
          )}
        </div>

        <div className="min-w-0">
          <h3
            className={`font-display font-bold text-sm tracking-wide ${
              unlocked ? "text-slate-100" : "text-slate-500"
            }`}
          >
            {achievement.title}
          </h3>
          <p className={`text-xs mt-1 ${unlocked ? "text-slate-400" : "text-slate-600"}`}>
            {achievement.desc}
          </p>

          <div className="flex flex-wrap items-center gap-2 mt-2.5">
            {/* Rarity is stated in words, not only in colour — the same
                information has to reach a hunter who cannot distinguish
                violet from amber. */}
            <span
              className="text-[9px] font-bold tracking-[0.2em] px-2 py-0.5 rounded-full border"
              style={{
                color: unlocked ? rarity.color : "#64748b",
                borderColor: unlocked ? `${rarity.color}44` : "rgba(255,255,255,0.1)",
                background: unlocked ? `${rarity.color}12` : "transparent",
              }}
            >
              {rarity.label.toUpperCase()}
            </span>
            <span
              className={`text-[9px] font-bold tracking-[0.25em] px-2 py-0.5 rounded-full border ${
                unlocked
                  ? "text-emerald-300 border-emerald-400/30 bg-emerald-400/10"
                  : "text-slate-600 border-white/10"
              }`}
            >
              {unlocked
                ? `UNLOCKED · ${new Date(unlockedAt + "T12:00:00").toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}`
                : "SEALED"}
            </span>
          </div>
        </div>
      </div>
    </motion.li>
  );
}

export default function Achievements({ achievements }) {
  const [filter, setFilter] = useState("all");

  const unlockedCount = ACHIEVEMENTS.filter((a) => achievements[a.id]).length;

  /** Counts per rarity, so the filters say what they are worth. */
  const rarityCounts = useMemo(() => {
    const counts = {};
    for (const a of ACHIEVEMENTS) {
      const key = rarityOf(a.rarity).key;
      counts[key] = counts[key] ?? { total: 0, unlocked: 0 };
      counts[key].total += 1;
      if (achievements[a.id]) counts[key].unlocked += 1;
    }
    return counts;
  }, [achievements]);

  /** Category -> records, unlocked first then by rarity, rarest first. */
  const grouped = useMemo(() => {
    const pool =
      filter === "all" ? ACHIEVEMENTS : ACHIEVEMENTS.filter((a) => rarityOf(a.rarity).key === filter);

    return ACHIEVEMENT_CATEGORIES.map((category) => ({
      category,
      records: pool
        .filter((a) => a.category === category)
        .sort((a, b) => {
          const mine = Boolean(achievements[a.id]);
          const theirs = Boolean(achievements[b.id]);
          if (mine !== theirs) return mine ? -1 : 1;
          return rarityOf(b.rarity).order - rarityOf(a.rarity).order;
        }),
    })).filter((group) => group.records.length > 0);
  }, [filter, achievements]);

  return (
    <div className="space-y-6">
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
          <h3 className="font-display font-bold text-slate-200 tracking-wide">{EMPTY.achievements.title}</h3>
          <p className="text-sm text-slate-500 mt-1.5">{EMPTY.achievements.body}</p>
        </motion.div>
      )}

      {/* rarity filter */}
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter records by rarity">
        <button
          onClick={() => setFilter("all")}
          aria-pressed={filter === "all"}
          className={`text-[10px] font-bold tracking-[0.2em] px-3 py-1.5 rounded-xl border transition-colors
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70 ${
              filter === "all"
                ? "text-cyan-200 border-cyan-400/50 bg-cyan-400/10"
                : "text-slate-400 border-white/10 hover:border-white/25"
            }`}
        >
          ALL · {unlockedCount}/{ACHIEVEMENTS.length}
        </button>
        {RARITY_ORDER.map((rarity) => {
          const counts = rarityCounts[rarity.key];
          if (!counts) return null;
          const active = filter === rarity.key;
          return (
            <button
              key={rarity.key}
              onClick={() => setFilter(rarity.key)}
              aria-pressed={active}
              title={rarity.blurb}
              className="text-[10px] font-bold tracking-[0.2em] px-3 py-1.5 rounded-xl border transition-colors
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70"
              style={{
                color: active ? rarity.color : "#94a3b8",
                borderColor: active ? `${rarity.color}77` : "rgba(255,255,255,0.1)",
                background: active ? `${rarity.color}14` : "transparent",
              }}
            >
              {rarity.label.toUpperCase()} · {counts.unlocked}/{counts.total}
            </button>
          );
        })}
      </div>

      {grouped.map((group) => (
        <section key={group.category} className="space-y-3">
          <h2 className="font-display font-bold text-[11px] tracking-[0.28em] text-slate-400">
            {group.category.toUpperCase()}
          </h2>
          <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {group.records.map((a, i) => (
              <RecordCard key={a.id} achievement={a} unlockedAt={achievements[a.id]} index={i} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
