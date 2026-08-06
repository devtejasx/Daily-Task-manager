import { memo, useId, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { DIFFICULTIES, CATEGORIES } from "../../data/missions";
import { PRIORITIES } from "../../game/constants";
import { FLAGS, STATUSES } from "../../utils/filters";
import FilterChip from "./FilterChip";

function Section({ title, children }) {
  return (
    <div>
      <p className="text-[9px] uppercase tracking-[0.28em] font-bold text-violet-300/70 mb-2">
        {title}
      </p>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

/**
 * The mission board's filter rail.
 *
 * Search and the quick flags stay visible; the rest (status, category,
 * priority, difficulty, XP range) live behind "More filters" so the board
 * keeps its breathing room on mobile.
 */
function FilterBar({ filters, activeCount, patch, toggle, reset, resultCount, totalCount }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <motion.section
      className="glass rounded-2xl p-3 sm:p-4 space-y-3"
      aria-label="Mission filters"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08, duration: 0.5 }}
    >
      <div className="flex flex-wrap items-center gap-2">
        {/* search by title */}
        <div className="relative flex-1 min-w-[200px]">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
            aria-hidden
          />
          <input
            type="search"
            value={filters.search}
            onChange={(e) => patch({ search: e.target.value })}
            placeholder="Search by title, briefing or category..."
            aria-label="Search missions"
            className="holo-input w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-200 placeholder:text-slate-500"
          />
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={panelId}
          className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.15em] text-cyan-300 border border-cyan-400/30 bg-cyan-400/10
            rounded-xl px-3 py-2 hover:shadow-[0_0_16px_rgba(6,182,212,0.35)] transition-shadow
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70"
        >
          <SlidersHorizontal size={14} aria-hidden />
          MORE FILTERS
          {activeCount > 0 && (
            <span className="ml-0.5 min-w-5 px-1.5 rounded-full bg-cyan-400/20 border border-cyan-400/40 text-[10px]">
              {activeCount}
            </span>
          )}
          <ChevronDown
            size={13}
            className={`transition-transform ${open ? "rotate-180" : ""}`}
            aria-hidden
          />
        </button>

        {activeCount > 0 && (
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-[0.15em] text-slate-400 hover:text-red-300
              border border-white/10 rounded-xl px-3 py-2 transition-colors
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70"
          >
            <X size={13} aria-hidden /> CLEAR
          </button>
        )}
      </div>

      {/* quick flags — always visible, they are the ones hunters reach for */}
      <div className="flex flex-wrap gap-1.5">
        {FLAGS.map((f) => (
          <FilterChip
            key={f.id}
            label={f.label}
            color={f.color}
            active={filters.flags.includes(f.id)}
            onClick={() => toggle("flags", f.id)}
          />
        ))}
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={panelId}
            key="panel"
            className="overflow-hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="grid sm:grid-cols-2 gap-4 pt-3 border-t border-white/5">
              <Section title="Status">
                {STATUSES.map((s) => (
                  <FilterChip
                    key={s.id}
                    label={s.label}
                    color="#10b981"
                    active={filters.status === s.id}
                    onClick={() => patch({ status: s.id })}
                  />
                ))}
              </Section>

              <Section title="Priority">
                {Object.entries(PRIORITIES).map(([key, p]) => (
                  <FilterChip
                    key={key}
                    label={p.label}
                    color={p.color}
                    active={filters.priorities.includes(key)}
                    onClick={() => toggle("priorities", key)}
                  />
                ))}
              </Section>

              <Section title="Category">
                {CATEGORIES.map((c) => (
                  <FilterChip
                    key={c}
                    label={c}
                    color="#7c3aed"
                    active={filters.categories.includes(c)}
                    onClick={() => toggle("categories", c)}
                  />
                ))}
              </Section>

              <Section title="Difficulty">
                {Object.entries(DIFFICULTIES).map(([key, d]) => (
                  <FilterChip
                    key={key}
                    label={key}
                    title={d.label}
                    color={d.color}
                    active={filters.difficulties.includes(key)}
                    onClick={() => toggle("difficulties", key)}
                  />
                ))}
              </Section>

              <Section title="XP reward">
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    step="50"
                    placeholder="min"
                    aria-label="Minimum XP reward"
                    value={filters.xpMin ?? ""}
                    onChange={(e) =>
                      patch({ xpMin: e.target.value === "" ? null : Number(e.target.value) })
                    }
                    className="holo-input w-24 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-sm text-amber-300 [color-scheme:dark]"
                  />
                  <span className="text-slate-600 text-xs">to</span>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    placeholder="max"
                    aria-label="Maximum XP reward"
                    value={filters.xpMax ?? ""}
                    onChange={(e) =>
                      patch({ xpMax: e.target.value === "" ? null : Number(e.target.value) })
                    }
                    className="holo-input w-24 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-sm text-amber-300 [color-scheme:dark]"
                  />
                </div>
              </Section>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="text-[10px] tracking-[0.2em] font-semibold text-slate-600" aria-live="polite">
        SHOWING {resultCount} OF {totalCount} MISSIONS
      </p>
    </motion.section>
  );
}

export default memo(FilterBar);
