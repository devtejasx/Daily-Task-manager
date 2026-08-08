import { motion } from "framer-motion";
import { Crown, Lock } from "lucide-react";
import { TITLES } from "../game/titles";
import { rarityOf } from "../game/rarity";

/**
 * The one piece of progression the hunter chooses for themselves.
 *
 * Locked titles show a hint rather than a threshold: a target you can
 * see the shape of is more motivating than a number, and less of a
 * spoiler. Nothing here is ever removed once earned.
 */
export default function TitlePicker({ titles = {}, activeTitle = null, onSelect }) {
  const unlockedCount = TITLES.filter((t) => titles[t.id]).length;

  return (
    <section className="space-y-3" aria-label="Hunter titles">
      <div className="flex items-baseline justify-between gap-3 flex-wrap">
        <h2 className="font-display font-bold text-[11px] tracking-[0.25em] text-slate-300">
          TITLES
        </h2>
        <span className="text-[10px] tracking-[0.15em] text-slate-500">
          {unlockedCount} OF {TITLES.length} EARNED
        </span>
      </div>

      {unlockedCount === 0 && (
        <p className="text-sm text-slate-500">
          None earned yet. Clear your first mission and the first one is yours.
        </p>
      )}

      <ul className="grid gap-2 sm:grid-cols-2">
        {TITLES.map((title) => {
          const unlockedAt = titles[title.id];
          const unlocked = Boolean(unlockedAt);
          const worn = activeTitle === title.id;
          const rarity = rarityOf(title.rarity);

          return (
            <li key={title.id}>
              <motion.button
                type="button"
                disabled={!unlocked}
                aria-pressed={worn}
                onClick={() => onSelect?.(worn ? null : title.id)}
                whileHover={unlocked ? { y: -2 } : undefined}
                whileTap={unlocked ? { scale: 0.99 } : undefined}
                className={`w-full text-left rounded-xl border p-3 transition-colors
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70
                  ${unlocked ? "cursor-pointer" : "cursor-not-allowed"}`}
                style={{
                  borderColor: worn ? `${rarity.color}88` : unlocked ? `${rarity.color}33` : "rgba(255,255,255,0.08)",
                  background: worn ? `${rarity.color}14` : "rgba(255,255,255,0.02)",
                  boxShadow: worn && rarity.glow ? `0 0 18px ${rarity.color}33` : "none",
                }}
              >
                <div className="flex items-center gap-2.5">
                  {unlocked ? (
                    <Crown size={15} style={{ color: rarity.color }} aria-hidden />
                  ) : (
                    <Lock size={15} className="text-slate-600" aria-hidden />
                  )}
                  <span
                    className={`font-display font-bold text-sm ${
                      unlocked ? "text-slate-100" : "text-slate-500"
                    }`}
                  >
                    {title.name}
                  </span>
                  {/* "WORN" is text, not just a highlight — the state has to
                      survive for anyone who can't compare two border colours. */}
                  {worn && (
                    <span
                      className="ml-auto text-[9px] font-bold tracking-[0.2em] px-2 py-0.5 rounded-full border"
                      style={{ color: rarity.color, borderColor: `${rarity.color}55` }}
                    >
                      WORN
                    </span>
                  )}
                </div>

                <p className={`text-xs mt-1.5 ${unlocked ? "text-slate-400" : "text-slate-600"}`}>
                  {unlocked ? title.desc : title.hint}
                </p>

                <span
                  className="inline-block mt-2 text-[9px] font-bold tracking-[0.2em]"
                  style={{ color: unlocked ? rarity.color : "#475569" }}
                >
                  {rarity.label.toUpperCase()}
                  {unlocked && " · EARNED"}
                </span>
              </motion.button>
            </li>
          );
        })}
      </ul>

      <p className="text-[11px] text-slate-500">
        Select an earned title to wear it, or select it again to wear none.
      </p>
    </section>
  );
}
