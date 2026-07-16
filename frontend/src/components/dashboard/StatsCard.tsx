'use client'

import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  /** Tailwind classes for the icon chip, e.g. "bg-blue-50 text-primary" */
  accent: string
  index?: number
}

/** Dashboard statistic tile with a staggered entrance animation. */
export function StatsCard({ label, value, icon: Icon, accent, index = 0 }: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.07 }}
      whileHover={{ y: -3 }}
      className="flex items-center gap-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm transition-shadow hover:shadow-md"
    >
      <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${accent}`}>
        <Icon size={22} aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      </div>
    </motion.div>
  )
}
