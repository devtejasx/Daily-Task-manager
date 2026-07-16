'use client'

/** Skeleton placeholder matching TaskCard's layout, shown while tasks load. */
export function SkeletonCard() {
  return (
    <div
      aria-hidden="true"
      className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm"
    >
      <div className="animate-pulse space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-4 w-2/5 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-5 w-16 rounded-full bg-gray-200 dark:bg-gray-700" />
        </div>
        <div className="h-3 w-4/5 rounded bg-gray-100 dark:bg-gray-800" />
        <div className="h-3 w-3/5 rounded bg-gray-100 dark:bg-gray-800" />
        <div className="flex gap-2 pt-1">
          <div className="h-5 w-14 rounded-full bg-gray-100 dark:bg-gray-800" />
          <div className="h-5 w-14 rounded-full bg-gray-100 dark:bg-gray-800" />
        </div>
      </div>
    </div>
  )
}

/** Grid of skeleton cards. */
export function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}
