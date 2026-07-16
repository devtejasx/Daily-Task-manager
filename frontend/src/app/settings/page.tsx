'use client'

import { FormEvent, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Bell, Moon, Sun, User } from 'lucide-react'
import { AppShell } from '@/layouts/AppShell'
import { useAuthStore } from '@/store/authStore'
import { useSettingsStore } from '@/store/settingsStore'
import { NotificationSettings } from '@/types/task-manager'

const inputClass =
  'w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3.5 py-2.5 text-sm text-gray-900 dark:text-gray-100 outline-none transition focus:border-primary focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-primary/20'

const cardClass =
  'rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm'

/** Accessible toggle switch. */
function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (value: boolean) => void
  label: string
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
        checked ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-[22px]' : 'translate-x-0.5'
        }`}
      />
    </button>
  )
}

const NOTIFICATION_OPTIONS: { key: keyof NotificationSettings; label: string; hint: string }[] = [
  { key: 'email', label: 'Email notifications', hint: 'Get updates about your tasks by email' },
  { key: 'push', label: 'Push notifications', hint: 'Browser push alerts for reminders' },
  { key: 'taskReminders', label: 'Task reminders', hint: 'Remind me before a task is due' },
  { key: 'weeklySummary', label: 'Weekly summary', hint: 'A productivity recap every Monday' },
]

export default function SettingsPage() {
  const { user, updateProfile } = useAuthStore()
  const { theme, setTheme, notifications, setNotification } = useSettingsStore()

  const [profile, setProfile] = useState({ name: '', email: '' })

  // Seed the form once the persisted user is available
  useEffect(() => {
    if (user) setProfile({ name: user.name, email: user.email })
  }, [user])

  const handleProfileSave = (e: FormEvent) => {
    e.preventDefault()
    if (!profile.name.trim() || !profile.email.trim()) {
      toast.error('Name and email are required')
      return
    }
    updateProfile({ name: profile.name.trim(), email: profile.email.trim() })
    toast.success('Profile updated')
  }

  return (
    <AppShell>
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Manage your profile and preferences.
        </p>
      </header>

      <div className="grid max-w-3xl gap-6">
        {/* Profile */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          aria-labelledby="profile-heading"
          className={cardClass}
        >
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-primary dark:bg-blue-500/10 dark:text-blue-400">
              <User size={19} aria-hidden="true" />
            </span>
            <div>
              <h2 id="profile-heading" className="font-semibold text-gray-900 dark:text-white">
                Profile Information
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                How you appear across TaskMaster
              </p>
            </div>
          </div>

          <form onSubmit={handleProfileSave} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="profile-name"
                  className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Full Name
                </label>
                <input
                  id="profile-name"
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                  className={inputClass}
                />
              </div>
              <div>
                <label
                  htmlFor="profile-email"
                  className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Email
                </label>
                <input
                  id="profile-email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                  className={inputClass}
                />
              </div>
            </div>
            <button
              type="submit"
              className="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-primary-dark active:scale-[0.98]"
            >
              Save Changes
            </button>
          </form>
        </motion.section>

        {/* Theme */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.07 }}
          aria-labelledby="theme-heading"
          className={cardClass}
        >
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-500 dark:bg-violet-500/10 dark:text-violet-400">
              {theme === 'light' ? <Sun size={19} aria-hidden="true" /> : <Moon size={19} aria-hidden="true" />}
            </span>
            <div>
              <h2 id="theme-heading" className="font-semibold text-gray-900 dark:text-white">
                Appearance
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Choose your theme</p>
            </div>
          </div>

          <div role="radiogroup" aria-label="Theme" className="grid grid-cols-2 gap-3 max-w-sm">
            {(['light', 'dark'] as const).map((t) => (
              <button
                key={t}
                role="radio"
                aria-checked={theme === t}
                onClick={() => setTheme(t)}
                className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium capitalize transition ${
                  theme === t
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                {t === 'light' ? <Sun size={16} /> : <Moon size={16} />}
                {t}
              </button>
            ))}
          </div>
        </motion.section>

        {/* Notifications */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14 }}
          aria-labelledby="notifications-heading"
          className={cardClass}
        >
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-500 dark:bg-amber-500/10 dark:text-amber-400">
              <Bell size={19} aria-hidden="true" />
            </span>
            <div>
              <h2 id="notifications-heading" className="font-semibold text-gray-900 dark:text-white">
                Notification Settings
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Decide what you want to hear about
              </p>
            </div>
          </div>

          <ul className="divide-y divide-gray-50 dark:divide-gray-800">
            {NOTIFICATION_OPTIONS.map(({ key, label, hint }) => (
              <li key={key} className="flex items-center justify-between gap-4 py-3.5">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{hint}</p>
                </div>
                <Toggle
                  checked={notifications[key]}
                  onChange={(v) => setNotification(key, v)}
                  label={label}
                />
              </li>
            ))}
          </ul>
        </motion.section>
      </div>
    </AppShell>
  )
}
