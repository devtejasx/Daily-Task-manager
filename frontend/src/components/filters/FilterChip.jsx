/**
 * A single toggleable filter pill. Colour comes from the facet's own palette
 * (priority red, difficulty blue, ...) so the bar reads like the cards do.
 */
export default function FilterChip({ label, active, color = "#06b6d4", onClick, title }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      title={title || label}
      className={`text-[10px] font-bold tracking-[0.12em] uppercase px-2.5 py-1 rounded-full border transition-all
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70
        ${active ? "" : "opacity-45 hover:opacity-90"}`}
      style={{
        color,
        borderColor: `${color}${active ? "88" : "33"}`,
        background: `${color}${active ? "1f" : "08"}`,
        boxShadow: active ? `0 0 12px ${color}44` : "none",
      }}
    >
      {label}
    </button>
  );
}
