import { forwardRef, memo, useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";
import { Zap, Check, Swords, Flag, GripVertical } from "lucide-react";
import { DIFFICULTIES } from "../data/missions";
import { PRIORITIES } from "../game/constants";
import { isOverdue } from "../utils/date";
import ParticleBurst from "./ParticleBurst";
import MissionActions from "./mission/MissionActions";
import RecurrenceBadge from "./mission/RecurrenceBadge";
import DeadlineMeta from "./mission/DeadlineMeta";

const MissionCard = forwardRef(function MissionCard(
  {
    mission,
    onComplete,
    onDelete,
    isDaily = false,
    dailyFull = false,
    onToggleDaily,
    onSkipOccurrence,
    onToggleRecurrencePaused,
    enterDelay = 0,
    dragHandleProps = null,
    isDragging = false,
  },
  ref
) {
  const diff = DIFFICULTIES[mission.difficulty];
  const priority = PRIORITIES[mission.priority] ?? null;
  const completed = mission.status === "completed";
  const overdue = isOverdue(mission);
  const [bursting, setBursting] = useState(false);
  const [sweeping, setSweeping] = useState(false);
  const [xpFloat, setXpFloat] = useState(false);
  const completeTimerRef = useRef(null);
  const resetTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      clearTimeout(completeTimerRef.current);
      clearTimeout(resetTimerRef.current);
    };
  }, []);

  /* ---- 3D tilt ---- */
  const cardRef = useRef(null);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rX = useSpring(useTransform(my, [0, 1], [5, -5]), { stiffness: 200, damping: 20 });
  const rY = useSpring(useTransform(mx, [0, 1], [-5, 5]), { stiffness: 200, damping: 20 });

  const handleMove = (e) => {
    const rect = cardRef.current.getBoundingClientRect();
    mx.set((e.clientX - rect.left) / rect.width);
    my.set((e.clientY - rect.top) / rect.height);
  };
  const handleLeave = () => {
    mx.set(0.5);
    my.set(0.5);
  };

  const handleComplete = () => {
    if (completed) return;
    clearTimeout(completeTimerRef.current);
    clearTimeout(resetTimerRef.current);
    setBursting(true);
    setSweeping(true);
    setXpFloat(true);
    completeTimerRef.current = setTimeout(() => onComplete(mission.id), 620);
    resetTimerRef.current = setTimeout(() => {
      setBursting(false);
      setSweeping(false);
      setXpFloat(false);
    }, 1800);
  };

  return (
    <motion.div
      /* layout animations would fight dnd-kit's transform mid-drag */
      layout={!isDragging}
      ref={(node) => {
        cardRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      }}
      onMouseMove={isDragging ? undefined : handleMove}
      onMouseLeave={handleLeave}
      style={
        isDragging
          ? { transformPerspective: 900 }
          : { rotateX: rX, rotateY: rY, transformPerspective: 900 }
      }
      className="group relative"
      initial={{ opacity: 0, y: 46, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{
        opacity: 0,
        scale: 0.7,
        filter: "blur(10px) brightness(2.2)",
        transition: { duration: 0.5, ease: "easeIn" },
      }}
      transition={{ delay: enterDelay, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -5 }}
    >
      <div
        className={`glass holo-scan neon-border rounded-2xl p-4 sm:p-5 relative overflow-hidden transition-shadow duration-300
          group-hover:shadow-[0_18px_50px_-12px_rgba(124,58,237,0.45),0_0_30px_rgba(6,182,212,0.15)]
          ${completed ? "opacity-75" : ""}
          ${overdue ? "is-overdue" : ""}`}
      >
        {/* overdue rail — a red pulse down the leading edge */}
        {overdue && (
          <span
            className="absolute left-0 inset-y-0 w-[3px] bg-gradient-to-b from-red-500 via-rose-400 to-red-500 animate-pulse"
            aria-hidden
          />
        )}
        {/* energy sweep when completing */}
        <AnimatePresence>
          {sweeping && (
            <motion.div
              className="absolute inset-0 z-10 pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle at 12% 50%, rgba(124,58,237,0.55), rgba(6,182,212,0.25) 45%, transparent 75%)",
              }}
              initial={{ opacity: 0, scale: 0.4, originX: 0.1, originY: 0.5 }}
              animate={{ opacity: [0, 1, 0], scale: 2.2 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            />
          )}
        </AnimatePresence>

        {/* floating +XP */}
        <AnimatePresence>
          {xpFloat && (
            <motion.span
              className="absolute left-1/2 top-1/3 z-20 font-display font-black text-lg text-amber-300 pointer-events-none"
              style={{ textShadow: "0 0 14px rgba(245,158,11,0.9), 0 0 30px rgba(124,58,237,0.6)" }}
              initial={{ opacity: 0, y: 0, x: "-50%", scale: 0.6 }}
              animate={{ opacity: [0, 1, 1, 0], y: -46, scale: 1.1 }}
              transition={{ duration: 1.1, ease: "easeOut" }}
            >
              +{mission.xp} XP
            </motion.span>
          )}
        </AnimatePresence>

        {/* daily quest marker */}
        {isDaily && !completed && (
          <span
            className="absolute top-0 left-0 px-2 py-0.5 rounded-br-lg rounded-tl-2xl text-[8px] font-black tracking-[0.2em] text-violet-100 bg-gradient-to-r from-violet-600/80 to-blue-600/60 z-10"
            style={{ boxShadow: "0 0 12px rgba(124,58,237,0.5)" }}
          >
            DAILY
          </span>
        )}

        {/* drag handle — only rendered inside a sortable list */}
        {dragHandleProps && (
          <button
            type="button"
            {...dragHandleProps}
            aria-label={`Reorder mission: ${mission.title}. Press space, then use the arrow keys.`}
            title="Drag to reorder · Space + arrows with a keyboard"
            className="absolute top-1.5 right-1.5 z-20 p-1.5 rounded-lg text-slate-600 hover:text-cyan-300 hover:bg-cyan-400/10
              cursor-grab active:cursor-grabbing touch-none transition-colors
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70
              opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
          >
            <GripVertical size={14} aria-hidden />
          </button>
        )}

        <div className="flex items-start gap-3 sm:gap-4 relative">
          {/* rune checkbox */}
          <button
            onClick={handleComplete}
            aria-label={completed ? "Mission completed" : "Complete mission"}
            className={`relative mt-0.5 shrink-0 w-9 h-9 rounded-xl border flex items-center justify-center transition-all duration-300
              ${
                completed
                  ? "border-emerald-400/60 bg-emerald-400/10 shadow-[0_0_16px_rgba(16,185,129,0.5)]"
                  : "border-violet-400/40 bg-violet-500/5 hover:border-cyan-300/70 hover:shadow-[0_0_18px_rgba(6,182,212,0.45)] hover:scale-110"
              }`}
          >
            {completed ? (
              <Check size={17} className="text-emerald-300" />
            ) : (
              <span className="text-violet-300/80 text-sm group-hover:text-cyan-200 transition-colors">
                ◈
              </span>
            )}
            {bursting && <ParticleBurst color={diff.color} />}
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <h3
                className={`font-display font-bold text-sm sm:text-[15px] tracking-wide leading-snug ${
                  completed ? "line-through text-slate-400" : "text-slate-100"
                }`}
              >
                {mission.title}
              </h3>
              {/* difficulty badge */}
              <span
                className="shrink-0 inline-flex items-center gap-1 font-display text-[10px] font-bold px-2 py-1 rounded-md border tracking-widest"
                style={{
                  color: diff.color,
                  borderColor: `${diff.color}55`,
                  background: `${diff.color}12`,
                  boxShadow: `0 0 12px ${diff.glow}`,
                }}
              >
                <Swords size={10} />
                {mission.difficulty}
              </span>
            </div>

            <p className="text-[13px] text-slate-400 mt-1.5 leading-relaxed line-clamp-2">
              {mission.description}
            </p>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3">
              <DeadlineMeta mission={mission} />
              <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-300/90">
                <Zap size={13} className="fill-amber-300/40" />+{mission.xp} XP
              </span>
              {priority && (
                <span
                  className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.15em] font-bold px-2 py-0.5 rounded-full border"
                  style={{
                    color: priority.color,
                    borderColor: `${priority.color}44`,
                    background: `${priority.color}10`,
                  }}
                >
                  <Flag size={9} />
                  {priority.label}
                </span>
              )}
              <RecurrenceBadge recurrence={mission.recurrence} />
              <span className="text-[10px] uppercase tracking-[0.18em] font-semibold text-violet-300/70 border border-violet-400/25 bg-violet-500/10 px-2 py-0.5 rounded-full">
                {mission.category}
              </span>
              <span
                className={`text-[10px] uppercase tracking-[0.18em] font-semibold px-2 py-0.5 rounded-full border ${
                  completed
                    ? "text-emerald-300 border-emerald-400/30 bg-emerald-400/10"
                    : "text-cyan-300 border-cyan-400/30 bg-cyan-400/10"
                }`}
              >
                {completed ? "Cleared" : "Active"}
              </span>
            </div>
          </div>

          <MissionActions
            mission={mission}
            completed={completed}
            isDaily={isDaily}
            dailyFull={dailyFull}
            onToggleDaily={onToggleDaily}
            onSkipOccurrence={onSkipOccurrence}
            onToggleRecurrencePaused={onToggleRecurrencePaused}
            onDelete={onDelete}
          />
        </div>
      </div>
    </motion.div>
  );
});

// Memoised: the board re-renders on every countdown tick and toast, but a
// card only changes when its own mission or handlers do.
export default memo(MissionCard);
