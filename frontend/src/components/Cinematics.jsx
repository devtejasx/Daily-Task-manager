import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Award, ShieldCheck, Hourglass, Flame, Sunrise, X, RefreshCw } from "lucide-react";
import { HUNTER_RANKS } from "../game/constants";
import { iconByName } from "../game/icons";
import ParticleBurst from "./ParticleBurst";
import { EnergyOverlay, PortalEffect } from "./CinematicLayers";

/* ================= shared bits ================= */

function Lightning({ color = "#a78bfa" }) {
  const bolts = [
    "M400,0 L380,120 L420,140 L370,300 L410,320 L360,520",
    "M180,0 L200,150 L160,180 L210,360 L180,400 L220,560",
    "M620,0 L590,140 L640,170 L580,340 L630,380 L590,540",
  ];
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice">
      {bolts.map((d, i) => (
        <motion.path
          key={i}
          d={d}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 8px ${color})` }}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: [0, 1, 1], opacity: [0, 1, 0] }}
          transition={{ duration: 0.7, delay: 0.15 + i * 0.18, ease: "easeOut" }}
        />
      ))}
    </svg>
  );
}

function FloatingRunes({ color = "#a78bfa", count = 10 }) {
  const glyphs = "◈◇△▽☰☲✦✧◁▷";
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: count }, (_, i) => (
        <motion.span
          key={i}
          className="absolute font-display text-xl"
          style={{
            left: `${8 + (i * 89) % 84}%`,
            color,
            textShadow: `0 0 12px ${color}`,
          }}
          initial={{ top: "110%", opacity: 0, rotate: 0 }}
          animate={{ top: "-10%", opacity: [0, 0.9, 0], rotate: 180 }}
          transition={{ duration: 3 + (i % 3), delay: i * 0.25, ease: "linear", repeat: Infinity }}
        >
          {glyphs[i % glyphs.length]}
        </motion.span>
      ))}
    </div>
  );
}

function CinematicShell({ children, onClose, autoCloseMs = 5200 }) {
  useEffect(() => {
    const t = setTimeout(onClose, autoCloseMs);
    const esc = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", esc);
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", esc);
    };
  }, [onClose, autoCloseMs]);

  return (
    <motion.div
      className="fixed inset-0 z-[70] flex items-center justify-center overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.45 } }}
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/85 backdrop-blur-md" />
      <EnergyOverlay intensity={0.55} />
      {children}
      <button
        onClick={onClose}
        className="absolute top-5 right-5 p-2 rounded-lg text-slate-400 hover:text-white bg-white/5 z-10"
        aria-label="Dismiss"
      >
        <X size={18} />
      </button>
    </motion.div>
  );
}

/* ================= LEVEL UP ================= */

export function LevelUpOverlay({ level, onClose }) {
  return (
    <CinematicShell onClose={onClose}>
      {/* expanding energy waves */}
      {[0, 0.25, 0.5].map((d, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border-2 border-violet-500/60"
          style={{ boxShadow: "0 0 60px rgba(124,58,237,0.5)" }}
          initial={{ width: 0, height: 0, opacity: 1 }}
          animate={{ width: "180vmax", height: "180vmax", opacity: 0 }}
          transition={{ duration: 1.8, delay: d, ease: [0.16, 1, 0.3, 1] }}
        />
      ))}

      <PortalEffect className="left-1/2 top-1/2 h-[30rem] w-[30rem] -translate-x-1/2 -translate-y-1/2 opacity-80" intensity={1.05} />
      <Lightning />
      <FloatingRunes />

      <div className="relative text-center px-6">
        <ParticleBurst color="#a78bfa" count={26} />
        {/* hunter aura */}
        <motion.div
          className="absolute inset-x-0 -inset-y-10 rounded-full blur-3xl -z-10"
          style={{ background: "radial-gradient(circle, rgba(124,58,237,0.5), transparent 70%)" }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.9, 0.5] }}
          transition={{ duration: 1.6, repeat: Infinity }}
        />
        <motion.p
          className="font-display text-xs tracking-[0.6em] text-cyan-300"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          THE SYSTEM ACKNOWLEDGES YOUR GROWTH
        </motion.p>
        <motion.h1
          className="font-display font-black text-5xl sm:text-7xl text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-blue-300 to-cyan-300 mt-4"
          style={{ filter: "drop-shadow(0 0 30px rgba(124,58,237,0.9))" }}
          initial={{ scale: 3, opacity: 0, filter: "blur(20px)" }}
          animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
          transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          LEVEL UP
        </motion.h1>
        {/* animated badge */}
        <motion.div
          className="mt-6 inline-flex items-center justify-center relative"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 160, damping: 14, delay: 0.8 }}
        >
          <span
            className="font-display font-black text-3xl px-8 py-4 rounded-2xl border-2 border-violet-400/60 bg-violet-500/10 text-violet-200"
            style={{ boxShadow: "0 0 40px rgba(124,58,237,0.7), inset 0 0 30px rgba(124,58,237,0.2)" }}
          >
            LV. {level}
          </span>
        </motion.div>
        <motion.p
          className="text-slate-400 text-sm mt-6 tracking-widest"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
        >
          Mission rewards have grown stronger.
        </motion.p>
      </div>
    </CinematicShell>
  );
}

/* ================= RANK PROMOTION ================= */

export function PromotionOverlay({ rankKey, onClose }) {
  const rank = HUNTER_RANKS.find((r) => r.key === rankKey) ?? HUNTER_RANKS[0];
  return (
    <CinematicShell onClose={onClose} autoCloseMs={6000}>
      <PortalEffect className="left-1/2 top-1/2 h-[36rem] w-[36rem] -translate-x-1/2 -translate-y-1/2 opacity-95" color={rank.color} accent={rank.color} intensity={1.1} />
      <motion.div
        className="absolute w-72 h-72 rounded-full border"
        style={{ borderColor: `${rank.color}77`, boxShadow: `0 0 80px ${rank.aura}, inset 0 0 60px ${rank.aura}` }}
        animate={{ rotate: -360 }}
        transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
      />

      {/* energy burst */}
      {[0, 0.3].map((d, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border-2"
          style={{ borderColor: `${rank.color}88`, boxShadow: `0 0 60px ${rank.aura}` }}
          initial={{ width: 0, height: 0, opacity: 1 }}
          animate={{ width: "170vmax", height: "170vmax", opacity: 0 }}
          transition={{ duration: 2, delay: 0.5 + d, ease: [0.16, 1, 0.3, 1] }}
        />
      ))}

      <FloatingRunes color={rank.color} count={14} />

      <div className="relative text-center px-6">
        <ParticleBurst color={rank.color} count={30} />
        <motion.p
          className="font-display text-xs tracking-[0.6em] text-slate-300"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          RANK PROMOTION AUTHORIZED
        </motion.p>
        <motion.h1
          className="font-display font-black text-4xl sm:text-6xl mt-4"
          style={{ color: rank.color, textShadow: `0 0 40px ${rank.aura}, 0 0 90px ${rank.aura}` }}
          initial={{ scale: 2.6, opacity: 0, filter: "blur(18px)" }}
          animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          {rank.title}
        </motion.h1>

        {/* badge unlock */}
        <motion.div
          className="mt-8 inline-flex"
          initial={{ scale: 0, y: 60, rotate: -30 }}
          animate={{ scale: 1, y: 0, rotate: 0 }}
          transition={{ type: "spring", stiffness: 150, damping: 13, delay: 1.1 }}
        >
          <div
            className="relative w-24 h-24 flex items-center justify-center rounded-3xl border-2"
            style={{
              borderColor: `${rank.color}88`,
              background: `${rank.color}14`,
              boxShadow: `0 0 50px ${rank.aura}, inset 0 0 30px ${rank.aura}`,
            }}
          >
            <Award size={40} style={{ color: rank.color }} />
            <motion.span
              className="absolute inset-0 rounded-3xl border-2"
              style={{ borderColor: rank.color }}
              animate={{ scale: [1, 1.35], opacity: [0.8, 0] }}
              transition={{ duration: 1.4, repeat: Infinity }}
            />
          </div>
        </motion.div>

        <motion.p
          className="text-slate-400 text-sm mt-6 max-w-sm mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.7 }}
        >
          {rank.blurb}
        </motion.p>
      </div>
    </CinematicShell>
  );
}

/* ================= THE RESOLVE SCREENS =================
 *
 * A missed day is a moment of maximum vulnerability for the hunter's
 * motivation, so it is the moment the product must be warmest. None of
 * these screens uses red, shake, breakage or the word "failed". Each one
 * names what the hunter still has and what happens next.
 * ====================================================== */

/** Shared frame: calm colour, a steady rune, a fact and a next step. */
function ResolveShell({ color, glyph, title, lead, detail, footer, onClose }) {
  return (
    <CinematicShell onClose={onClose} autoCloseMs={6000}>
      <motion.div
        className="absolute inset-0"
        style={{ background: `radial-gradient(ellipse at center, ${color}33, transparent 65%)` }}
        animate={{ opacity: [0.5, 0.85, 0.5] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
      />
      <FloatingRunes color={color} count={8} />

      <div className="relative text-center px-6">
        <motion.div
          className="relative mx-auto w-28 h-28 mb-6 flex items-center justify-center"
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* an intact rune, breathing rather than cracking */}
          <motion.svg
            viewBox="0 0 100 100"
            className="absolute inset-0 w-full h-full"
            style={{ filter: `drop-shadow(0 0 16px ${color})` }}
            animate={{ rotate: 360 }}
            transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
          >
            <circle cx="50" cy="50" r="42" fill="none" stroke={color} strokeWidth="1.5" strokeDasharray="6 10" opacity="0.7" />
          </motion.svg>
          <motion.div
            style={{ color }}
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          >
            {glyph}
          </motion.div>
        </motion.div>

        <motion.h1
          className="font-display font-black text-3xl sm:text-5xl"
          style={{ color, textShadow: `0 0 36px ${color}` }}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        >
          {title}
        </motion.h1>

        <motion.p
          className="text-slate-200 text-sm sm:text-base mt-4 tracking-wide"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {lead}
        </motion.p>

        {detail && (
          <motion.p
            className="text-slate-400 text-sm mt-1.5 tracking-wide"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            {detail}
          </motion.p>
        )}

        <motion.div
          className="mt-6 inline-flex items-center gap-2 text-xs font-bold tracking-[0.22em] rounded-lg px-4 py-2"
          style={{ color, borderColor: `${color}66`, background: `${color}1a`, borderWidth: 1 }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
        >
          {footer}
        </motion.div>
      </div>
    </CinematicShell>
  );
}

/** A banked shield absorbed the missed day. The climb never wavered. */
export function ShieldHeldOverlay({ streak, remaining, onClose }) {
  return (
    <ResolveShell
      color="#38bdf8"
      glyph={<ShieldCheck size={46} />}
      title="SHIELD HELD"
      lead={`Your ${streak}-day climb is untouched.`}
      detail="The Resolve you banked absorbed the missed day — exactly what you earned it for."
      footer={
        <>
          <ShieldCheck size={14} />
          {remaining} SHIELD{remaining === 1 ? "" : "S"} REMAINING
        </>
      }
      onClose={onClose}
    />
  );
}

/** No shield left — the streak is held open for one day. */
export function StreakPreservedOverlay({ streak, onClose }) {
  return (
    <ResolveShell
      color="#a78bfa"
      glyph={<Hourglass size={44} />}
      title="STREAK PRESERVED"
      lead={`Your ${streak} days are being held for you.`}
      detail="Clear today's daily quest and the whole climb comes back, plus a bonus for returning."
      footer={
        <>
          <Hourglass size={14} />
          ONE DAY TO RECLAIM IT
        </>
      }
      onClose={onClose}
    />
  );
}

/** The comeback landed. This is the loudest, warmest screen in the set. */
export function StreakRecoveredOverlay({ streak, onClose }) {
  return (
    <ResolveShell
      color="#10b981"
      glyph={<Flame size={46} />}
      title="STREAK RECOVERED"
      lead={`All ${streak} days are yours again.`}
      detail="You came back on the day it counted. That is the whole skill."
      footer={
        <>
          <Flame size={14} />
          THE CLIMB CONTINUES
        </>
      }
      onClose={onClose}
    />
  );
}

/** The streak finally settled. Nothing was taken; a new climb opens. */
export function NewClimbOverlay({ previous, onClose }) {
  return (
    <ResolveShell
      color="#f59e0b"
      glyph={<Sunrise size={46} />}
      title="A NEW CLIMB BEGINS"
      lead={`That run reached ${previous} days — it stays on your record.`}
      detail="Every level, every point of XP and every title you earned is still yours. Only the counter starts again."
      footer={
        <>
          <Sunrise size={14} />
          DAY ONE, AGAIN
        </>
      }
      onClose={onClose}
    />
  );
}

/* ================= NEW DAY BANNER ================= */

export function NewDayBanner({ onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4200);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <motion.div
      className="fixed top-20 inset-x-0 z-[60] flex justify-center px-4 pointer-events-none"
      initial={{ opacity: 0, y: -40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ type: "spring", stiffness: 200, damping: 22 }}
    >
      <div className="glass neon-border rounded-2xl px-6 py-4 flex items-center gap-4 pointer-events-auto shadow-[0_0_40px_rgba(6,182,212,0.25)]">
        <Sunrise size={22} className="text-cyan-300" style={{ filter: "drop-shadow(0 0 8px rgba(6,182,212,0.8))" }} />
        <div>
          <p className="font-display font-bold text-sm tracking-[0.2em] text-slate-100">
            NEW DAILY MISSIONS AVAILABLE
          </p>
          <p className="text-xs text-slate-400 mt-0.5">
            A new day begins. Select 4 missions as today's required quest.
          </p>
        </div>
        <button onClick={onClose} className="p-1.5 text-slate-500 hover:text-white" aria-label="Dismiss">
          <X size={15} />
        </button>
      </div>
    </motion.div>
  );
}

/* ================= TOASTS (mission clear / daily / achievements) ================= */

export function ToastStack({ toasts, onDismiss }) {
  return (
    <div className="fixed bottom-24 lg:bottom-6 left-1/2 -translate-x-1/2 lg:left-auto lg:translate-x-0 lg:right-24 z-[55] flex flex-col gap-2 w-[min(22rem,90vw)]">
      <AnimatePresence>
        {toasts.slice(-4).map((t) => {
          const Icon = iconByName(t.icon);
          return (
            <motion.div
              key={t.id}
              layout
              className="glass rounded-xl px-4 py-3 flex items-center gap-3 border cursor-pointer"
              style={{ borderColor: `${t.color}44`, boxShadow: `0 0 24px ${t.color}33` }}
              initial={{ opacity: 0, x: 60, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 26 }}
              onClick={() => onDismiss(t.id)}
              role={t.kind === "error" ? "alert" : "status"}
            >
              <div
                className="p-2 rounded-lg shrink-0"
                style={{ background: `${t.color}18`, boxShadow: `0 0 12px ${t.color}44` }}
              >
                <Icon size={17} style={{ color: t.color }} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-display font-bold text-[11px] tracking-[0.18em]" style={{ color: t.color }}>
                  {t.kind === "achievement" ? "ACHIEVEMENT UNLOCKED" : t.title}
                </p>
                <p className={`text-xs text-slate-300 ${t.action ? "" : "truncate"}`}>
                  {t.kind === "achievement" ? `${t.title} — ${t.desc}` : t.desc}
                </p>
              </div>
              {/* recoverable failures carry their own fix-it action */}
              {t.action && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    t.action.run?.();
                    onDismiss(t.id);
                  }}
                  className="shrink-0 inline-flex items-center gap-1 text-[10px] font-bold tracking-wider rounded-lg px-2.5 py-1.5 border transition-colors
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70"
                  style={{ color: t.color, borderColor: `${t.color}55`, background: `${t.color}14` }}
                >
                  <RefreshCw size={11} aria-hidden />
                  {t.action.label}
                </button>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

/* auto-expire toasts — errors linger, since they carry an action to take */
export function useToastAutoDismiss(toasts, onDismiss, ms = 4500) {
  useEffect(() => {
    if (toasts.length === 0) return;
    const timers = toasts
      .filter((t) => t.kind !== "error" && !t.sticky)
      .map((t) => setTimeout(() => onDismiss(t.id), ms));
    return () => timers.forEach(clearTimeout);
  }, [toasts, onDismiss, ms]);
}
