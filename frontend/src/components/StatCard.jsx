import { motion } from "framer-motion";
import { useCountUp } from "../hooks/useCountUp";

export default function StatCard({ icon: Icon, label, value, suffix = "", accent = "#7c3aed", delay = 0 }) {
  const count = useCountUp(value);
  return (
    <motion.div
      className="glass holo-scan rounded-2xl p-4 sm:p-5 relative overflow-hidden group"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.25 } }}
    >
      {/* accent corner glow */}
      <div
        className="absolute -top-10 -right-10 w-28 h-28 rounded-full opacity-30 group-hover:opacity-60 transition-opacity duration-500 blur-2xl"
        style={{ background: accent }}
      />
      <div className="flex items-start justify-between relative">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400 font-semibold">
            {label}
          </p>
          <p
            className="font-display text-2xl sm:text-3xl font-bold mt-2"
            style={{ color: accent, textShadow: `0 0 16px ${accent}66` }}
          >
            {count.toLocaleString()}
            {suffix}
          </p>
        </div>
        <div
          className="p-2.5 rounded-xl border animate-float-slow"
          style={{
            borderColor: `${accent}44`,
            background: `${accent}14`,
            boxShadow: `0 0 14px ${accent}33`,
          }}
        >
          <Icon size={20} style={{ color: accent }} />
        </div>
      </div>
    </motion.div>
  );
}
