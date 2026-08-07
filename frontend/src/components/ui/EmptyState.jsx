import { motion, useReducedMotion } from "framer-motion";
import { iconByName } from "../../game/icons";

/**
 * The shared empty state.
 *
 * A blank panel tells the hunter the app is broken or that they are behind.
 * Neither is true, and both are discouraging — so every empty space instead
 * names what it is for and offers the one action worth taking next.
 *
 * Copy lives in game/copy.js (EMPTY.*) so the voice stays consistent; this
 * component only decides how it looks.
 */
export default function EmptyState({
  icon = "Sparkles",
  title,
  body,
  cta,
  onCta,
  color = "#7c3aed",
  compact = false,
}) {
  const reduced = useReducedMotion();
  const Icon = iconByName(icon);

  return (
    <motion.div
      className={`flex flex-col items-center text-center ${compact ? "py-8 px-4" : "py-14 px-6"}`}
      initial={{ opacity: 0, y: reduced ? 0 : 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* A slow, quiet pulse — present, but never competing with a real
          celebration. Dramatic effects are reserved for earned moments. */}
      <motion.div
        className={`${compact ? "w-12 h-12" : "w-16 h-16"} rounded-2xl flex items-center justify-center mb-5`}
        style={{ background: `${color}14`, border: `1px solid ${color}44` }}
        animate={reduced ? undefined : { scale: [1, 1.05, 1], opacity: [0.85, 1, 0.85] }}
        transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
      >
        <Icon
          size={compact ? 22 : 28}
          style={{ color, filter: `drop-shadow(0 0 8px ${color})` }}
          aria-hidden
        />
      </motion.div>

      <h3
        className={`font-display font-bold tracking-[0.16em] text-slate-200 ${
          compact ? "text-xs" : "text-sm"
        }`}
      >
        {title}
      </h3>

      {body && (
        <p className="text-slate-400 text-sm mt-3 max-w-sm leading-relaxed">{body}</p>
      )}

      {cta && onCta && (
        <motion.button
          onClick={onCta}
          className="mt-6 font-display font-bold text-[11px] tracking-[0.2em] rounded-xl px-5 py-2.5
                     transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
          style={{ color, background: `${color}1a`, border: `1px solid ${color}55` }}
          whileHover={reduced ? undefined : { scale: 1.03 }}
          whileTap={reduced ? undefined : { scale: 0.97 }}
        >
          {cta}
        </motion.button>
      )}
    </motion.div>
  );
}
