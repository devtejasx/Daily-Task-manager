import { motion } from "framer-motion";

export default function XPBar({ progress, className = "", height = 8 }) {
  return (
    <div
      className={`relative w-full rounded-full bg-white/5 border border-white/10 overflow-hidden ${className}`}
      style={{ height }}
    >
      <motion.div
        className="absolute inset-y-0 left-0 rounded-full xp-shimmer overflow-hidden"
        style={{
          background:
            "linear-gradient(90deg, #7c3aed, #3b82f6 55%, #06b6d4)",
          boxShadow:
            "0 0 12px rgba(124,58,237,0.7), 0 0 24px rgba(6,182,212,0.35)",
        }}
        initial={{ width: 0 }}
        animate={{ width: `${Math.max(2, progress * 100)}%` }}
        transition={{ type: "spring", stiffness: 60, damping: 18 }}
      />
    </div>
  );
}
