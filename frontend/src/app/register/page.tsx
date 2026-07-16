'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { CheckSquare, Lock, Mail, User } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { Loader } from '@/components/common/Loader'

const inputClass =
  'w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 py-2.5 pl-10 pr-4 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 outline-none transition focus:border-primary focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-primary/20'

const labelClass = 'mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300'

export default function RegisterPage() {
  const router = useRouter()
  const register = useAuthStore((s) => s.register)

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim() || !form.password) {
      toast.error('Please fill in all fields')
      return
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    if (form.password !== form.confirm) {
      toast.error('Passwords do not match')
      return
    }
    setLoading(true)
    try {
      await register(form.name.trim(), form.email.trim(), form.password)
      toast.success('Account created — welcome!')
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950 px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        {/* Brand */}
        <div className="mb-8 flex flex-col items-center">
          <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/25">
            <CheckSquare size={24} aria-hidden="true" />
          </span>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Get started</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Create your TaskMaster account
          </p>
        </div>

        <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 sm:p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className={labelClass}>
                Full Name
              </label>
              <div className="relative">
                <User size={16} aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  value={form.name}
                  onChange={set('name')}
                  placeholder="Your name"
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className={labelClass}>
                Email
              </label>
              <div className="relative">
                <Mail size={16} aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={set('email')}
                  placeholder="you@example.com"
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className={labelClass}>
                Password
              </label>
              <div className="relative">
                <Lock size={16} aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  value={form.password}
                  onChange={set('password')}
                  placeholder="At least 6 characters"
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirm" className={labelClass}>
                Confirm Password
              </label>
              <div className="relative">
                <Lock size={16} aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  id="confirm"
                  type="password"
                  autoComplete="new-password"
                  value={form.confirm}
                  onChange={set('confirm')}
                  placeholder="Re-enter your password"
                  className={inputClass}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-dark active:scale-[0.99] disabled:opacity-60"
            >
              {loading && <Loader size={15} />}
              Create Account
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </motion.div>
    </main>
  )
}
