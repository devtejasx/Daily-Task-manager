import React, { useState } from 'react'
import { VoiceRecorder } from '@/components/VoiceRecorder'
import { AISuggestions } from '@/components/AISuggestions'
import Navbar from '@/components/Navbar'
import TaskCard from '@/components/TaskCard'
import { useAuth } from '@/hooks/useAuth'
import { motion } from 'framer-motion'
import { Plus, Lightbulb, Mic } from 'lucide-react'

const AIEnhancedPage: React.FC = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'voice' | 'suggestions'>('voice')
  const [createdTasks, setCreatedTasks] = useState<any[]>([])
  const [showSuccess, setShowSuccess] = useState(false)

  const handleTaskCreated = (task: any) => {
    setCreatedTasks((prev) => [task, ...prev])
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  const handleSuggestionAccepted = (suggestion: any) => {
    setCreatedTasks((prev) => [suggestion, ...prev])
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  if (!user) {
    return <div className="text-white text-center py-20">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950 to-gray-950">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">AI-Powered Task Management</h1>
          <p className="text-gray-400">Use voice input or AI suggestions to create tasks faster</p>
        </motion.div>

        {/* Success Notification */}
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg text-green-200 text-sm flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Task created successfully!
          </motion.div>
        )}

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Voice & Suggestions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs */}
            <div className="flex gap-2 border-b border-purple-500/20">
              <button
                onClick={() => setActiveTab('voice')}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition ${
                  activeTab === 'voice'
                    ? 'border-purple-400 text-purple-300'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                <Mic className="w-5 h-5" />
                Voice Input
              </button>
              <button
                onClick={() => setActiveTab('suggestions')}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition ${
                  activeTab === 'suggestions'
                    ? 'border-purple-400 text-purple-300'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                <Lightbulb className="w-5 h-5" />
                AI Suggestions
              </button>
            </div>

            {/* Tab Content */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-900/50 rounded-xl border border-purple-500/10 p-6">
              {activeTab === 'voice' && (
                <motion.div
                  key="voice"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <VoiceRecorder
                    onTaskCreated={handleTaskCreated}
                    onTranscription={(text) => console.log('Transcribed:', text)}
                  />

                  {/* Voice Tips */}
                  <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg text-sm text-blue-200">
                    <h4 className="font-semibold mb-2">💡 Voice Tips:</h4>
                    <ul className="space-y-1 text-xs">
                      <li>• Say the task clearly: "Finish project report by Friday"</li>
                      <li>• Include priority: "Schedule meeting with John, high priority"</li>
                      <li>• Add due dates: "Read chapter 5 tomorrow morning"</li>
                      <li>• Specify category: "Buy groceries, shopping category"</li>
                    </ul>
                  </div>
                </motion.div>
              )}

              {activeTab === 'suggestions' && (
                <motion.div
                  key="suggestions"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <AISuggestions
                    userId={user.id}
                    onTaskSelect={handleSuggestionAccepted}
                    showPatternAnalysis={true}
                  />
                </motion.div>
              )}
            </div>
          </div>

          {/* Right Column - Recent Tasks */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <h3 className="text-xl font-bold text-white mb-4">Recent Tasks</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {createdTasks.length > 0 ? (
                  createdTasks.map((task) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg"
                    >
                      <p className="text-white font-medium text-sm truncate">{task.title}</p>
                      {task.priority && (
                        <p className="text-xs text-purple-300 mt-1">
                          Priority: <span className="capitalize">{task.priority}</span>
                        </p>
                      )}
                    </motion.div>
                  ))
                ) : (
                  <p className="text-gray-400 text-sm text-center py-8">No tasks created yet</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-12 grid md:grid-cols-3 gap-4"
        >
          <div className="p-4 bg-gradient-to-br from-purple-900/20 to-purple-900/5 border border-purple-500/20 rounded-lg">
            <Mic className="w-8 h-8 text-purple-400 mb-2" />
            <h4 className="text-white font-semibold mb-2">Natural Voice Input</h4>
            <p className="text-gray-400 text-sm">
              Simply speak to create tasks. AI understands context, dates, and priorities.
            </p>
          </div>

          <div className="p-4 bg-gradient-to-br from-blue-900/20 to-blue-900/5 border border-blue-500/20 rounded-lg">
            <Lightbulb className="w-8 h-8 text-blue-400 mb-2" />
            <h4 className="text-white font-semibold mb-2">Smart Suggestions</h4>
            <p className="text-gray-400 text-sm">
              Get AI-powered task recommendations based on your habits and patterns.
            </p>
          </div>

          <div className="p-4 bg-gradient-to-br from-yellow-900/20 to-yellow-900/5 border border-yellow-500/20 rounded-lg">
            <Lightbulb className="w-8 h-8 text-yellow-400 mb-2" />
            <h4 className="text-white font-semibold mb-2">Pattern Analysis</h4>
            <p className="text-gray-400 text-sm">
              Analyze your productivity patterns and get insights for better task management.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default AIEnhancedPage
