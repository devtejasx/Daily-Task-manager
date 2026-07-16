'use client'

import { FormEvent, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, LogOut, Menu, Moon, Search, Settings, Sun, User } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useSettingsStore } from '@/store/settingsStore'
import { useTaskStore } from '@/store/taskStore'

interface TopNavbarProps {
  onMenuClick: () => void
}

/** Initials for the avatar circle, e.g. "Tejas Nagmote" -> "TN". */
function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('')
}

export function TopNavbar({ onMenuClick }: TopNavbarProps) {
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const { theme, toggleTheme } = useSettingsStore()
  const tasks = useTaskStore((s) => s.tasks)

  const [query, setQuery] = useState('')
  const [notifOpen, setNotifOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close dropdowns on outside click
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false)
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const handleSearch = (e: FormEvent) => {
    e.preventDefault()
    const q = query.trim()
    router.push(q ? `/tasks?q=${encodeURIComponent(q)}` : '/tasks')
  }

  // Overdue + due-today pending tasks double as mock notifications
  const today = new Date().toISOString().slice(0, 10)
  const dueSoon = tasks.filter((t) => t.status === 'Pending' && t.dueDate <= today)

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  const dropdownClass =
    'absolute right-0 z-40 mt-2 origin-top-right rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-lg'

  return (
    <header className="sticky top-0 z-20 border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
        {/* Mobile hamburger */}
        <button
          onClick={onMenuClick}
          aria-label="Open menu"
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 lg:hidden"
        >
          <Menu size={20} />
        </button>

        {/* Search */}
        <form onSubmit={handleSearch} role="search" className="relative flex-1 max-w-md">
          <Search
            size={16}
            aria-hidden="true"
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="search"
            aria-label="Search all tasks"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search anything…"
            className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 py-2 pl-10 pr-4 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 outline-none transition focus:border-primary focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-primary/20"
          />
        </form>

        <div className="ml-auto flex items-center gap-1.5">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            className="rounded-xl p-2.5 text-gray-500 dark:text-gray-400 transition hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          {/* Notifications */}
          <div ref={notifRef} className="relative">
            <button
              onClick={() => setNotifOpen((v) => !v)}
              aria-label={`Notifications (${dueSoon.length})`}
              aria-expanded={notifOpen}
              className="relative rounded-xl p-2.5 text-gray-500 dark:text-gray-400 transition hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Bell size={18} />
              {dueSoon.length > 0 && (
                <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {dueSoon.length}
                </span>
              )}
            </button>
            <AnimatePresence>
              {notifOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className={`${dropdownClass} w-80`}
                >
                  <div className="border-b border-gray-100 dark:border-gray-800 px-4 py-3">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                      Notifications
                    </h3>
                  </div>
                  <div className="max-h-72 overflow-y-auto py-1.5">
                    {dueSoon.length === 0 ? (
                      <p className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                        You&apos;re all caught up 🎉
                      </p>
                    ) : (
                      dueSoon.map((t) => (
                        <button
                          key={t.id}
                          onClick={() => {
                            setNotifOpen(false)
                            router.push('/pending')
                          }}
                          className="flex w-full items-start gap-3 px-4 py-2.5 text-left transition hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-red-500" />
                          <span>
                            <span className="block text-sm font-medium text-gray-900 dark:text-white">
                              {t.title}
                            </span>
                            <span className="block text-xs text-gray-500 dark:text-gray-400">
                              {t.dueDate === today ? 'Due today' : 'Overdue'} · {t.category}
                            </span>
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile */}
          <div ref={menuRef} className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Open profile menu"
              aria-expanded={menuOpen}
              className="ml-1 flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
            >
              {user ? initials(user.name) : <User size={16} />}
            </button>
            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className={`${dropdownClass} w-56`}
                >
                  <div className="border-b border-gray-100 dark:border-gray-800 px-4 py-3">
                    <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                      {user?.name}
                    </p>
                    <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                      {user?.email}
                    </p>
                  </div>
                  <div className="py-1.5">
                    <button
                      onClick={() => {
                        setMenuOpen(false)
                        router.push('/settings')
                      }}
                      className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 transition hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <Settings size={15} /> Settings
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-red-500 transition hover:bg-red-50 dark:hover:bg-red-500/10"
                    >
                      <LogOut size={15} /> Log out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  )
}
