import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRegisterSW } from "virtual:pwa-register/react";
import { Download, RefreshCw, X, WifiOff } from "lucide-react";

/** Small glass banner shared by the update / install / offline states. */
function Banner({ icon: Icon, title, desc, actionLabel, onAction, onDismiss, color }) {
  return (
    <motion.div
      className="glass neon-border rounded-2xl px-4 py-3 flex items-center gap-3 w-[min(24rem,calc(100vw-2rem))]"
      style={{ borderColor: `${color}55`, boxShadow: `0 0 24px ${color}33` }}
      initial={{ opacity: 0, y: 24, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 16, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300, damping: 26 }}
      role="status"
    >
      <div
        className="p-2 rounded-lg shrink-0"
        style={{ background: `${color}18`, boxShadow: `0 0 12px ${color}44` }}
      >
        <Icon size={16} style={{ color }} aria-hidden />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-display font-bold text-[11px] tracking-[0.18em]" style={{ color }}>
          {title}
        </p>
        <p className="text-xs text-slate-400">{desc}</p>
      </div>
      {onAction && (
        <button
          type="button"
          onClick={onAction}
          className="shrink-0 text-[10px] font-bold tracking-wider rounded-lg px-2.5 py-1.5 border transition-colors
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70"
          style={{ color, borderColor: `${color}55`, background: `${color}14` }}
        >
          {actionLabel}
        </button>
      )}
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className="shrink-0 p-1.5 rounded-lg text-slate-500 hover:text-slate-200 transition-colors
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70"
        >
          <X size={14} aria-hidden />
        </button>
      )}
    </motion.div>
  );
}

/**
 * PWA surface: install invitation, update prompt and an offline indicator.
 *
 * The service worker is registered with `prompt`, not `autoUpdate` — swapping
 * the app out from under someone mid-mission is worse than a stale tab, so a
 * new version waits for a deliberate reload.
 */
export default function PWAPrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({ onRegisterError: (err) => console.error("SW registration failed:", err) });

  const [installEvent, setInstallEvent] = useState(null);
  const [offline, setOffline] = useState(() => typeof navigator !== "undefined" && !navigator.onLine);
  const [dismissedInstall, setDismissedInstall] = useState(
    () => localStorage.getItem("arise-install-dismissed") === "1"
  );

  useEffect(() => {
    const onPrompt = (e) => {
      e.preventDefault(); // keep the browser's own bar hidden; we ask in-theme
      setInstallEvent(e);
    };
    const onInstalled = () => setInstallEvent(null);
    const goOffline = () => setOffline(true);
    const goOnline = () => setOffline(false);

    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", goOnline);
    };
  }, []);

  const install = async () => {
    if (!installEvent) return;
    installEvent.prompt();
    await installEvent.userChoice;
    setInstallEvent(null);
  };

  const dismissInstall = () => {
    localStorage.setItem("arise-install-dismissed", "1");
    setDismissedInstall(true);
  };

  return (
    <div className="fixed bottom-24 lg:bottom-6 left-1/2 -translate-x-1/2 z-[60] flex flex-col gap-2 items-center pointer-events-none [&>*]:pointer-events-auto">
      <AnimatePresence>
        {offline && (
          <Banner
            key="offline"
            icon={WifiOff}
            color="#f59e0b"
            title="OFFLINE MODE"
            desc="Changes are kept locally and sync when you reconnect."
          />
        )}
        {needRefresh && (
          <Banner
            key="update"
            icon={RefreshCw}
            color="#06b6d4"
            title="NEW VERSION READY"
            desc="Reload when you're between missions."
            actionLabel="RELOAD"
            onAction={() => updateServiceWorker(true)}
            onDismiss={() => setNeedRefresh(false)}
          />
        )}
        {installEvent && !dismissedInstall && (
          <Banner
            key="install"
            icon={Download}
            color="#7c3aed"
            title="INSTALL ARISE"
            desc="Add the command center to your home screen."
            actionLabel="INSTALL"
            onAction={install}
            onDismiss={dismissInstall}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
