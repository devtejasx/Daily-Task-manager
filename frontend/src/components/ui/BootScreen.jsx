import { motion } from "framer-motion";
import { Hexagon, WifiOff, RotateCcw } from "lucide-react";
import { PageSkeleton, Skeleton } from "./Skeleton";

/** The rotating hexagon sigil used while the system connects. */
function Sigil() {
  return (
    <div className="relative w-12 h-12" aria-hidden>
      <motion.span
        className="absolute inset-0 rounded-full border-2 border-cyan-400/50 border-t-transparent"
        animate={{ rotate: 360 }}
        transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}
      />
      <motion.span
        className="absolute inset-0 flex items-center justify-center"
        animate={{ scale: [1, 1.12, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
      >
        <Hexagon
          size={22}
          className="text-violet-400"
          style={{ filter: "drop-shadow(0 0 10px rgba(124,58,237,0.9))" }}
        />
      </motion.span>
    </div>
  );
}

/**
 * Boot / sync screen.
 *
 * Instead of a blank void it renders the app's own chrome with skeletons
 * in place of the data, so the layout is already settled when the save
 * lands. On failure it turns into a friendly retry panel.
 */
export default function BootScreen({ label, error = false, onRetry, detail }) {
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 bg-[#05070f] text-center">
        <div className="p-3 rounded-2xl border border-red-400/30 bg-red-500/10">
          <WifiOff size={24} className="text-red-300" aria-hidden />
        </div>
        <div>
          <p className="font-display font-black text-lg tracking-[0.2em] text-slate-100">
            {label || "CLOUD SYNC FAILED"}
          </p>
          <p className="text-sm text-slate-500 mt-2 max-w-sm">
            {detail ||
              "The system couldn't reach your hunter record. Check your connection — your data is safe in the cloud."}
          </p>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 text-xs font-bold tracking-wider text-cyan-300 border border-cyan-400/30 bg-cyan-400/10 rounded-xl px-4 py-2.5
              hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-shadow
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70"
          >
            <RotateCcw size={14} aria-hidden /> TRY AGAIN
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05070f]">
      {/* sidebar shell */}
      <div className="hidden lg:block fixed top-0 left-0 h-full w-[92px] xl:w-60 glass border-r border-violet-500/15 p-3">
        <div className="h-20 flex items-center px-2">
          <Skeleton className="w-8 h-8" rounded="rounded-xl" />
        </div>
        <div className="space-y-2 mt-4">
          {Array.from({ length: 7 }, (_, i) => (
            <Skeleton key={i} className="h-10 w-full" rounded="rounded-xl" />
          ))}
        </div>
      </div>

      <div className="lg:pl-[92px] xl:pl-60">
        {/* top bar shell */}
        <div className="glass border-b border-violet-500/15 px-4 sm:px-6 py-3 flex items-center gap-4">
          <Skeleton className="w-9 h-9" rounded="rounded-full" />
          <Skeleton className="h-9 flex-1 max-w-md" rounded="rounded-xl" />
          <Skeleton className="h-9 w-24 ml-auto" rounded="rounded-xl" />
        </div>

        <main className="px-4 sm:px-6 lg:px-8 py-6 max-w-6xl w-full mx-auto">
          <div className="flex flex-col items-center gap-3 py-6">
            <Sigil />
            <motion.p
              className="text-[10px] tracking-[0.35em] text-slate-500 font-semibold"
              animate={{ opacity: [0.45, 1, 0.45] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              role="status"
            >
              {label}
            </motion.p>
          </div>
          <PageSkeleton cards={2} />
        </main>
      </div>
    </div>
  );
}
