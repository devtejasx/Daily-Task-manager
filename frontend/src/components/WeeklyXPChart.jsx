import { useState } from "react";
import { motion } from "framer-motion";

/**
 * Single-series XP-per-day bar chart (last 7 days).
 * One hue, no legend (title names the series), per-bar hover tooltip,
 * rounded data-ends anchored to the baseline, recessive grid.
 */
export default function WeeklyXPChart({ series }) {
  const [hover, setHover] = useState(null);
  const W = 320;
  const H = 150;
  const PAD = { top: 18, right: 8, bottom: 22, left: 8 };
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;
  const max = Math.max(300, ...series.map((d) => d.xp));
  const barW = Math.min(26, (plotW / series.length) * 0.6);
  const step = plotW / series.length;

  const dayLabel = (iso) =>
    new Date(iso + "T12:00:00").toLocaleDateString(undefined, { weekday: "short" }).slice(0, 2);

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="XP earned per day, last 7 days">
        {/* recessive gridlines */}
        {[0.5, 1].map((f) => (
          <line
            key={f}
            x1={PAD.left}
            x2={W - PAD.right}
            y1={PAD.top + plotH * (1 - f)}
            y2={PAD.top + plotH * (1 - f)}
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="1"
          />
        ))}
        {/* baseline */}
        <line
          x1={PAD.left}
          x2={W - PAD.right}
          y1={PAD.top + plotH}
          y2={PAD.top + plotH}
          stroke="rgba(255,255,255,0.14)"
          strokeWidth="1"
        />

        {series.map((d, i) => {
          const h = max === 0 ? 0 : (d.xp / max) * plotH;
          const x = PAD.left + step * i + (step - barW) / 2;
          const y = PAD.top + plotH - h;
          const isHover = hover === i;
          return (
            <g key={d.day}>
              {/* generous hit target */}
              <rect
                x={PAD.left + step * i}
                y={PAD.top}
                width={step}
                height={plotH}
                fill="transparent"
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
              />
              {d.xp > 0 && (
                <motion.rect
                  x={x}
                  width={barW}
                  rx={4}
                  fill={isHover ? "#67e8f9" : "#06b6d4"}
                  style={{ filter: isHover ? "drop-shadow(0 0 6px rgba(6,182,212,0.8))" : "none", pointerEvents: "none" }}
                  initial={{ y: PAD.top + plotH, height: 0 }}
                  animate={{ y, height: Math.max(4, h) }}
                  transition={{ type: "spring", stiffness: 120, damping: 18, delay: i * 0.05 }}
                />
              )}
              {d.xp === 0 && (
                <rect x={x} y={PAD.top + plotH - 2} width={barW} height={2} rx={1} fill="rgba(255,255,255,0.12)" style={{ pointerEvents: "none" }} />
              )}
              {/* day label — ink, not series color */}
              <text
                x={PAD.left + step * i + step / 2}
                y={H - 6}
                textAnchor="middle"
                fontSize="9"
                fill={isHover ? "#e2e8f0" : "#64748b"}
                fontWeight="600"
              >
                {dayLabel(d.day)}
              </text>
            </g>
          );
        })}
      </svg>

      {/* tooltip */}
      {hover !== null && (
        <div
          className="absolute -top-1 pointer-events-none glass rounded-lg px-2.5 py-1.5 text-center border border-cyan-400/30"
          style={{
            left: `${((PAD.left + step * hover + step / 2) / W) * 100}%`,
            transform: "translateX(-50%)",
            boxShadow: "0 0 16px rgba(6,182,212,0.25)",
          }}
        >
          <p className="text-[10px] font-bold text-slate-200 whitespace-nowrap">
            {new Date(series[hover].day + "T12:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric" })}
          </p>
          <p className="text-[11px] font-display font-bold text-cyan-300 whitespace-nowrap">
            {series[hover].xp.toLocaleString()} XP
          </p>
        </div>
      )}
    </div>
  );
}
