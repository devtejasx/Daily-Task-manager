import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DIFFICULTIES } from "../data/missions";

const DAY_LABELS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

export default function Calendar({ missions }) {
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayISO = new Date().toISOString().slice(0, 10);

  const cells = [
    ...Array.from({ length: firstDay }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const missionsOn = (day) => {
    const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return missions.filter((m) => m.dueDate === iso);
  };

  return (
    <div className="space-y-5">
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <div>
          <h1 className="font-display font-black text-2xl text-slate-100 text-glow-arcane">
            GATE CALENDAR
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">Scheduled portal openings.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCursor(new Date(year, month - 1, 1))}
            className="p-2 rounded-lg glass text-slate-300 hover:text-cyan-300 transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft size={17} />
          </button>
          <span className="font-display font-bold text-sm tracking-[0.2em] text-cyan-300 min-w-32 text-center">
            {cursor.toLocaleDateString(undefined, { month: "long", year: "numeric" }).toUpperCase()}
          </span>
          <button
            onClick={() => setCursor(new Date(year, month + 1, 1))}
            className="p-2 rounded-lg glass text-slate-300 hover:text-cyan-300 transition-colors"
            aria-label="Next month"
          >
            <ChevronRight size={17} />
          </button>
        </div>
      </motion.div>

      <motion.div
        className="glass neon-border rounded-2xl p-3 sm:p-5"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2 mb-2">
          {DAY_LABELS.map((d) => (
            <div key={d} className="text-center text-[9px] sm:text-[10px] font-bold tracking-[0.2em] text-violet-300/70 py-1">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {cells.map((day, i) => {
            if (day === null) return <div key={`e${i}`} />;
            const dayMissions = missionsOn(day);
            const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const isToday = iso === todayISO;
            return (
              <motion.div
                key={iso}
                className={`relative min-h-14 sm:min-h-20 rounded-xl p-1.5 sm:p-2 border transition-colors ${
                  isToday
                    ? "border-cyan-400/60 bg-cyan-400/10 shadow-[0_0_16px_rgba(6,182,212,0.3)]"
                    : "border-white/5 bg-white/[0.02] hover:bg-violet-500/10 hover:border-violet-400/30"
                }`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15 + i * 0.008 }}
              >
                <span className={`text-[10px] sm:text-xs font-bold ${isToday ? "text-cyan-300" : "text-slate-400"}`}>
                  {day}
                </span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {dayMissions.slice(0, 3).map((m) => (
                    <span
                      key={m.id}
                      title={m.title}
                      className="w-1.5 h-1.5 rounded-full"
                      style={{
                        background: DIFFICULTIES[m.difficulty].color,
                        boxShadow: `0 0 6px ${DIFFICULTIES[m.difficulty].color}`,
                        opacity: m.status === "completed" ? 0.4 : 1,
                      }}
                    />
                  ))}
                  {dayMissions.length > 3 && (
                    <span className="text-[8px] text-slate-500 font-bold">+{dayMissions.length - 3}</span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
