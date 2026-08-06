/* =========================================================
   Loading skeletons

   Shaped like the real content so the page doesn't jump when data
   lands. The shimmer is a single CSS animation (.skeleton), which
   [data-animations="off"] and prefers-reduced-motion both flatten.
   ========================================================= */

/** One shimmering block. */
export function Skeleton({ className = "", rounded = "rounded-lg" }) {
  return <div className={`skeleton ${rounded} ${className}`} aria-hidden />;
}

/** Placeholder for a StatCard. */
export function StatCardSkeleton() {
  return (
    <div className="glass rounded-2xl p-4 sm:p-5">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-7 w-16 mt-3" />
    </div>
  );
}

/** Placeholder for a MissionCard. */
export function MissionCardSkeleton() {
  return (
    <div className="glass rounded-2xl p-4 sm:p-5 flex gap-4">
      <Skeleton className="w-9 h-9 shrink-0" rounded="rounded-xl" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-full" />
        <div className="flex gap-2 pt-1">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-14" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
    </div>
  );
}

/** Full-page placeholder used while a lazily-loaded route is fetched. */
export function PageSkeleton({ cards = 4 }) {
  return (
    <div className="space-y-5" role="status" aria-label="Loading">
      <div>
        <Skeleton className="h-7 w-56" />
        <Skeleton className="h-3 w-72 mt-2" />
      </div>
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        {Array.from({ length: 4 }, (_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {Array.from({ length: cards }, (_, i) => (
          <MissionCardSkeleton key={i} />
        ))}
      </div>
      <span className="sr-only">Loading the command center…</span>
    </div>
  );
}

export default Skeleton;
