import { motion } from "framer-motion";
import { Eye, LogIn, X } from "lucide-react";

/**
 * The demo-mode ribbon.
 *
 * A visitor exploring the showcase is holding someone else's save, and the
 * app must never let that be ambiguous — every action they take is real on
 * screen and discarded on exit. States that plainly, and keeps the two ways
 * out (start your own climb / leave) one tap away.
 */
export default function DemoBanner({ onExit, onSignUp }) {
  return (
    <motion.div
      role="status"
      className="sticky top-0 z-40 flex items-center gap-3 flex-wrap px-4 py-2
                 border-b border-amber-400/30 bg-amber-400/10 backdrop-blur-md"
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.span
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
        className="shrink-0"
      >
        <Eye size={15} className="text-amber-300" aria-hidden />
      </motion.span>

      <p className="text-[11px] sm:text-xs font-bold tracking-wider text-amber-200 min-w-0">
        DEMO MODE — you&apos;re exploring a veteran hunter&apos;s record.
        <span className="hidden sm:inline text-amber-200/70 font-semibold">
          {" "}
          Clear a mission, watch the XP land. Nothing here is saved.
        </span>
      </p>

      <div className="flex items-center gap-2 ml-auto shrink-0">
        <button
          onClick={onSignUp}
          className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider
                     text-slate-950 bg-amber-300 hover:bg-amber-200 rounded-lg px-3 py-1.5
                     transition-colors focus-visible:outline-none focus-visible:ring-2
                     focus-visible:ring-cyan-300"
        >
          <LogIn size={13} aria-hidden /> START MY OWN CLIMB
        </button>
        <button
          onClick={onExit}
          aria-label="Leave demo mode"
          className="p-1.5 rounded-lg text-amber-200/70 hover:text-white hover:bg-white/10
                     transition-colors focus-visible:outline-none focus-visible:ring-2
                     focus-visible:ring-cyan-300"
        >
          <X size={15} aria-hidden />
        </button>
      </div>
    </motion.div>
  );
}
