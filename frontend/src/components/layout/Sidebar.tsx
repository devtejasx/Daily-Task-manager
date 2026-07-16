'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle2,
  CheckSquare,
  Clock,
  LayoutDashboard,
  ListTodo,
  Settings,
  Star,
  X,
} from 'lucide-react'
import { useTaskStore } from '@/store/taskStore'

interface SidebarProps {
  /** Mobile drawer state (desktop sidebar is always visible). */
  mobileOpen: boolean
  onMobileClose: () => void
}

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/tasks', label: 'All Tasks', icon: ListTodo },
  { href: '/completed', label: 'Completed', icon: CheckCircle2 },
  { href: '/pending', label: 'Pending', icon: Clock },
  { href: '/important', label: 'Important', icon: Star },
  { href: '/settings', label: 'Settings', icon: Settings },
] as const

export function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname()
  const tasks = useTaskStore((s) => s.tasks)

  const counts: Record<string, number | undefined> = {
    '/tasks': tasks.length || undefined,
    '/completed': tasks.filter((t) => t.status === 'Completed').length || undefined,
    '/pending': tasks.filter((t) => t.status === 'Pending').length || undefined,
    '/important': tasks.filter((t) => t.important).length || undefined,
  }

  const nav = (
    <nav aria-label="Main navigation" className="flex h-full flex-col">
      {/* Brand */}
      <div className="flex h-16 items-center gap-2.5 px-5">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white shadow-sm">
          <CheckSquare size={18} aria-hidden="true" />
        </span>
        <span className="text-lg font-bold text-gray-900 dark:text-white">TaskMaster</span>
        <button
          onClick={onMobileClose}
          aria-label="Close menu"
          className="ml-auto rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 lg:hidden"
        >
          <X size={18} />
        </button>
      </div>

      {/* Links */}
      <ul className="mt-2 flex-1 space-y-1 px-3">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <li key={href}>
              <Link
                href={href}
                onClick={onMobileClose}
                aria-current={active ? 'page' : undefined}
                className={`group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
                  active
                    ? 'bg-primary/10 text-primary'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="sidebar-active"
                    className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-primary"
                  />
                )}
                <Icon size={18} aria-hidden="true" />
                {label}
                {counts[href] !== undefined && (
                  <span
                    className={`ml-auto rounded-full px-2 py-0.5 text-xs font-semibold ${
                      active
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {counts[href]}
                  </span>
                )}
              </Link>
            </li>
          )
        })}
      </ul>

      <p className="px-5 py-4 text-xs text-gray-400 dark:text-gray-600">
        © 2026 TaskMaster
      </p>
    </nav>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 lg:block">
        {nav}
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onMobileClose}
              className="fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-sm lg:hidden"
              aria-hidden="true"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', duration: 0.4, bounce: 0.1 }}
              className="fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-gray-900 shadow-xl lg:hidden"
            >
              {nav}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
