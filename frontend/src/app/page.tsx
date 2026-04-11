'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { CheckCircle, Zap, Users, BarChart3 } from 'lucide-react'

export default function Home() {
  const features = [
    {
      icon: CheckCircle,
      title: 'Smart Task Management',
      description: 'Create, organize, and track tasks with intelligent categorization and filtering',
    },
    {
      icon: Zap,
      title: 'Gamification',
      description: 'Earn XP, level up, unlock achievements, and maintain streaks for consistency',
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Share tasks, assign work, and collaborate with your team in real-time',
    },
    {
      icon: BarChart3,
      title: 'Analytics & Insights',
      description: 'Get AI-powered insights about your productivity patterns and suggestions',
    },
  ]

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary/10 via-white to-secondary/10 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Master Your Productivity
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            Advanced task management with gamification, AI insights, and seamless team collaboration
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/register"
              className="px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition transform hover:scale-105 font-medium"
            >
              Get Started Free
            </Link>
            <Link
              href="/login"
              className="px-8 py-3 border border-primary text-primary rounded-lg hover:bg-primary/10 transition font-medium"
            >
              Sign In
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="text-4xl font-bold text-center mb-12"
        >
          Why Choose TaskMaster?
        </motion.h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, i) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-lg transition"
              >
                <Icon className="w-12 h-12 text-primary mb-4" />
                <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-12 text-center text-white"
        >
          <h2 className="text-4xl font-bold mb-4">Ready to boost your productivity?</h2>
          <p className="text-lg mb-8 opacity-90">
            Join thousands of users managing their tasks more effectively
          </p>
          <Link
            href="/register"
            className="inline-block px-8 py-3 bg-white text-primary rounded-lg hover:opacity-90 transition font-bold"
          >
            Start Free Trial
          </Link>
        </motion.div>
      </section>
    </main>
  )
}
