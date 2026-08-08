import { motion } from "framer-motion";
import { iconByName } from "../game/icons";
import { humanDay } from "../utils/date";

/**
 * The hunter's journey, in the handful of days something changed.
 *
 * Deliberately not a log. Cleared missions live in the history feed;
 * this shows only rank promotions, titles and the loudest achievements,
 * because a timeline that lists everything is a timeline nobody reads
 * twice.
 */
export default function ProgressionTimeline({ moments = [], next = null }) {
  if (moments.length === 0) {
    return (
      <div className="rounded-xl border border-white/8 bg-white/[0.03] p-5 text-center">
        <p className="font-display font-bold text-sm tracking-wide text-slate-200">
          YOUR STORY BEGINS TODAY
        </p>
        <p className="text-sm text-slate-500 mt-1.5">
          Clear a mission and the first moment is written here. Nothing on this
          page is ever removed.
        </p>
      </div>
    );
  }

  return (
    <ol className="relative space-y-4 pl-6" aria-label="Progression timeline">
      {/* the spine */}
      <span
        className="absolute left-[7px] top-2 bottom-2 w-px bg-gradient-to-b from-cyan-400/40 via-violet-400/30 to-transparent"
        aria-hidden
      />

      {moments.map((moment, i) => {
        const Icon = iconByName(moment.icon);
        return (
          <motion.li
            key={moment.id}
            className="relative"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: Math.min(0.4, i * 0.05), duration: 0.45 }}
          >
            <span
              className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full border-2 bg-[#0b1120]"
              style={{ borderColor: moment.color, boxShadow: `0 0 8px ${moment.color}66` }}
              aria-hidden
            />
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="font-display font-bold text-[10px] tracking-[0.2em] text-slate-500">
                DAY {moment.day}
              </span>
              <span className="text-[10px] text-slate-600">{humanDay(moment.at)}</span>
            </div>
            <p
              className="font-display font-bold text-sm mt-0.5 inline-flex items-center gap-2"
              style={{ color: moment.color }}
            >
              <Icon size={14} aria-hidden />
              {moment.label}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">{moment.detail}</p>
          </motion.li>
        );
      })}

      {/* The timeline ends on the future, not the past. */}
      {next && (
        <motion.li
          className="relative"
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.45, duration: 0.45 }}
        >
          <span
            className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full border-2 border-dashed bg-[#0b1120]"
            style={{ borderColor: `${next.color}77` }}
            aria-hidden
          />
          <span className="font-display font-bold text-[10px] tracking-[0.2em] text-slate-500">
            NEXT
          </span>
          <p className="font-display font-bold text-sm mt-0.5" style={{ color: next.color }}>
            {next.label}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">{next.detail}</p>
        </motion.li>
      )}
    </ol>
  );
}
