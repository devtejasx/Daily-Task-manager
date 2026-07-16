'use client'

/** Simple accessible spinner. Use `size` in px. */
export function Loader({ size = 24, label = 'Loading' }: { size?: number; label?: string }) {
  return (
    <span role="status" aria-label={label} className="inline-flex">
      <span
        className="animate-spin rounded-full border-2 border-gray-200 dark:border-gray-700 border-t-primary"
        style={{ width: size, height: size }}
      />
      <span className="sr-only">{label}…</span>
    </span>
  )
}

/** Full-area centered loader for page-level loading states. */
export function PageLoader() {
  return (
    <div className="flex items-center justify-center py-24">
      <Loader size={36} />
    </div>
  )
}
