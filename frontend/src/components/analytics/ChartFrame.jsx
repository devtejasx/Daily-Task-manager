import { motion } from "framer-motion";

/** Shared tooltip styling so every Recharts surface matches the glass panels. */
export const tooltipStyle = {
  contentStyle: {
    background: "rgba(11,17,32,0.94)",
    border: "1px solid rgba(124,58,237,0.35)",
    borderRadius: "12px",
    boxShadow: "0 0 24px rgba(124,58,237,0.25)",
    fontSize: "12px",
  },
  labelStyle: { color: "#e2e8f0", fontWeight: 700, letterSpacing: "0.05em" },
  itemStyle: { color: "#94a3b8" },
  cursor: { fill: "rgba(124,58,237,0.08)" },
};

export const axisStyle = {
  stroke: "rgba(148,163,184,0.25)",
  tick: { fill: "#64748b", fontSize: 10, fontWeight: 600 },
  tickLine: false,
  axisLine: false,
};

/** Glass panel with the standard heading treatment used across the app. */
export default function ChartFrame({ title, icon: Icon, subtitle, children, delay = 0, className = "" }) {
  return (
    <motion.section
      className={`glass holo-scan rounded-2xl p-5 ${className}`}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="flex items-center gap-2 mb-1">
        {Icon && (
          <Icon
            size={15}
            className="text-cyan-300"
            style={{ filter: "drop-shadow(0 0 5px rgba(6,182,212,0.7))" }}
            aria-hidden
          />
        )}
        <h2 className="font-display font-bold text-[11px] tracking-[0.25em] text-slate-300">
          {title}
        </h2>
      </div>
      {subtitle && <p className="text-[11px] text-slate-500 mb-3">{subtitle}</p>}
      {children}
    </motion.section>
  );
}
