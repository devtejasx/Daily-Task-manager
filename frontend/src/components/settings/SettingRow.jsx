import { motion } from "framer-motion";

/** The pill switch used throughout the settings page. */
export function Toggle({ on, onChange, label, disabled = false }) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!on)}
      role="switch"
      aria-checked={on}
      aria-label={label}
      disabled={disabled}
      className={`relative w-11 h-6 rounded-full transition-colors duration-300 shrink-0
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70
        ${disabled ? "opacity-40 cursor-not-allowed" : ""}
        ${
          on
            ? "bg-gradient-to-r from-violet-600 to-cyan-500 shadow-[0_0_14px_rgba(6,182,212,0.5)]"
            : "bg-white/10"
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

/** Icon + title + description on the left, a control on the right. */
export default function SettingRow({ icon: Icon, title, desc, accent = "#06b6d4", children }) {
  return (
    <div className="flex items-center justify-between gap-4 p-5">
      <div className="flex items-center gap-4 min-w-0">
        <div
          className="p-2.5 rounded-xl border shrink-0"
          style={{ borderColor: `${accent}40`, background: `${accent}15` }}
        >
          <Icon size={19} style={{ color: accent }} aria-hidden />
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-sm text-slate-200">{title}</p>
          <p className="text-xs text-slate-500">{desc}</p>
        </div>
      </div>
      {children}
    </div>
  );
}
