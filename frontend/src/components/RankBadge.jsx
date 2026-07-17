import { motion } from "framer-motion";
import { Shield } from "lucide-react";

/** Animated hunter rank badge (size: px of the emblem square) */
export default function RankBadge({ rank, size = 56, showTitle = false }) {
  const short = rank.key === "NATIONAL" ? "N" : rank.key;
  return (
    <div className="flex items-center gap-3">
      <motion.div
        className="relative flex items-center justify-center rounded-2xl border-2"
        style={{
          width: size,
          height: size,
          borderColor: `${rank.color}66`,
          background: `${rank.color}12`,
          boxShadow: `0 0 20px ${rank.aura}, inset 0 0 16px ${rank.aura}`,
        }}
        animate={{ scale: [1, 1.04, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <Shield size={size * 0.44} className="absolute opacity-25" style={{ color: rank.color }} />
        <span
          className="font-display font-black relative"
          style={{ color: rank.color, fontSize: size * 0.4, textShadow: `0 0 14px ${rank.aura}` }}
        >
          {short}
        </span>
        {/* orbiting spark */}
        <motion.span
          className="absolute w-1.5 h-1.5 rounded-full"
          style={{ background: rank.color, boxShadow: `0 0 8px ${rank.color}` }}
          animate={{ rotate: 360 }}
          transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
        >
          <span
            className="absolute w-1.5 h-1.5 rounded-full"
            style={{ background: rank.color, transform: `translateX(${size / 2 + 4}px)` }}
          />
        </motion.span>
      </motion.div>
      {showTitle && (
        <div>
          <p className="font-display font-bold text-sm" style={{ color: rank.color, textShadow: `0 0 12px ${rank.aura}` }}>
            {rank.title}
          </p>
          <p className="text-[10px] tracking-[0.25em] text-slate-500 font-semibold">HUNTER LICENSE</p>
        </div>
      )}
    </div>
  );
}
