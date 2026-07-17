import { AnimatePresence, motion } from "framer-motion";
import { Swords, X } from "lucide-react";
import { useEffect } from "react";
import AuthForm from "./AuthForm";

/**
 * Auth presented as a modal so signed-out guests can be prompted without
 * leaving the page they're exploring. `onSuccess` fires after Firebase
 * confirms sign-in; `onClose` dismisses without authenticating.
 */
export default function LoginModal({ open, onClose, onSuccess }) {
  // close on Escape
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[95] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            className="glass neon-border relative w-full max-w-md rounded-3xl p-8 sm:p-9"
            initial={{ opacity: 0, y: 24, scale: 0.96, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-200 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex flex-col items-center mb-6">
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-500 shadow-[0_0_30px_rgba(124,58,237,0.5)] mb-3">
                <Swords size={26} className="text-white" />
              </div>
              <h2 className="text-lg font-bold tracking-widest text-glow-arcane text-white">
                LOGIN TO ACCESS YOUR COMMAND CENTER
              </h2>
            </div>

            <AuthForm onSuccess={onSuccess} heading=" " />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
