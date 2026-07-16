import type { Metadata, Viewport } from 'next'
import { Providers } from '@/components/Providers'
import './globals.css'

export const metadata: Metadata = {
  title: 'TaskMaster - Task Management Dashboard',
  description: 'Modern task manager — organize, prioritize, and complete your work',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-50 transition-colors duration-300">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
