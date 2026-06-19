import React, { useEffect, useState } from 'react'
import { Lightbulb, ThumbsUp, ThumbsDown, Loader, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Suggestion {
  id: string
  title: string
  description?: string
  category?: string
  priority?: string
  confidence?: number
}

interface AISuggestionsProps {
  userId: string
  onTaskSelect?: (suggestion: Suggestion) => void
  showPatternAnalysis?: boolean
}

export const AISuggestions: React.FC<AISuggestionsProps> = ({
  userId,
  onTaskSelect,
  showPatternAnalysis = false,
}) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [smartRecommendations, setSmartRecommendations] = useState<Suggestion[]>([])
  const [patterns, setPatterns] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [dismissedIds, setDismissedIds] = useState(new Set<string>())
  const [activeTab, setActiveTab] = useState<'suggestions' | 'smart' | 'patterns'>('suggestions')

  useEffect(() => {
    loadSuggestions()
  }, [userId])

  const loadSuggestions = async () => {
    setLoading(true)
    setError('')

    try {
      // Load AI suggestions
      const sugResponse = await fetch('/api/ai/suggestions?count=5')
      if (sugResponse.ok) {
        const sugData = await sugResponse.json()
        setSuggestions(sugData.data || [])
      }

      // Load smart recommendations
      const smartResponse = await fetch('/api/ai/smart-recommendations')
      if (smartResponse.ok) {
        const smartData = await smartResponse.json()
        setSmartRecommendations(smartData.data || [])
      }

      // Load pattern analysis if requested
      if (showPatternAnalysis) {
        const patternResponse = await fetch('/api/ai/analyze-patterns')
        if (patternResponse.ok) {
          const patternData = await patternResponse.json()
          setPatterns(patternData.data)
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load suggestions')
    } finally {
      setLoading(false)
    }
  }

  const handleDismiss = (id: string) => {
    const newDismissed = new Set(dismissedIds)
    newDismissed.add(id)
    setDismissedIds(newDismissed)
  }

  const handleAccept = (suggestion: Suggestion) => {
    onTaskSelect?.(suggestion)
    handleDismiss(suggestion.id)
  }

  const getSuggestionColor = (priority?: string) => {
    switch (priority?.toLowerCase()) {
      case 'critical':
        return 'border-red-500 bg-red-500/10'
      case 'high':
        return 'border-orange-500 bg-orange-500/10'
      case 'medium':
        return 'border-yellow-500 bg-yellow-500/10'
      case 'low':
        return 'border-blue-500 bg-blue-500/10'
      default:
        return 'border-purple-500 bg-purple-500/10'
    }
  }

  const getTrustColor = (confidence?: number) => {
    if (!confidence) return 'text-gray-400'
    if (confidence >= 0.8) return 'text-green-400'
    if (confidence >= 0.6) return 'text-yellow-400'
    return 'text-orange-400'
  }

  const displaySuggestions = activeTab === 'suggestions' 
    ? suggestions.filter((s) => !dismissedIds.has(s.id))
    : activeTab === 'smart'
      ? smartRecommendations.filter((s) => !dismissedIds.has(s.id))
      : []

  return (
    <div className="ai-suggestions">
      <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/20 rounded-xl border border-purple-500/20 p-6">
        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <Lightbulb className="w-5 h-5 text-yellow-400" />
          <h3 className="text-lg font-semibold text-white">AI-Powered Suggestions</h3>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-purple-500/20">
          <button
            onClick={() => setActiveTab('suggestions')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
              activeTab === 'suggestions'
                ? 'border-purple-400 text-purple-300'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            Suggestions ({suggestions.length - dismissedIds.size})
          </button>
          <button
            onClick={() => setActiveTab('smart')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
              activeTab === 'smart'
                ? 'border-purple-400 text-purple-300'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            Smart Picks ({smartRecommendations.length - dismissedIds.size})
          </button>
          {showPatternAnalysis && (
            <button
              onClick={() => setActiveTab('patterns')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
                activeTab === 'patterns'
                  ? 'border-purple-400 text-purple-300'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              Patterns
            </button>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-8">
            <Loader className="w-6 h-6 text-purple-400 animate-spin" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-2 p-4 bg-red-500/20 border border-red-500/50 rounded text-red-200 text-sm"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>{error}</div>
          </motion.div>
        )}

        {/* Suggestions Tab */}
        {activeTab === 'suggestions' && !loading && (
          <div className="space-y-3">
            {displaySuggestions.length > 0 ? (
              displaySuggestions.map((suggestion) => (
                <motion.div
                  key={suggestion.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className={`p-4 border rounded-lg ${getSuggestionColor(suggestion.priority)} hover:bg-opacity-20 transition`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="text-white font-medium">{suggestion.title}</h4>
                      {suggestion.description && (
                        <p className="text-sm text-gray-400 mt-1">{suggestion.description}</p>
                      )}
                      <div className="flex gap-2 mt-2 text-xs">
                        {suggestion.category && (
                          <span className="px-2 py-1 bg-purple-500/20 rounded text-purple-300">
                            {suggestion.category}
                          </span>
                        )}
                        {suggestion.priority && (
                          <span className="px-2 py-1 bg-purple-500/20 rounded text-purple-300">
                            {suggestion.priority}
                          </span>
                        )}
                        {suggestion.confidence && (
                          <span className={`px-2 py-1 ${getTrustColor(suggestion.confidence)}`}>
                            {Math.round(suggestion.confidence * 100)}% confidence
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleAccept(suggestion)}
                        className="p-2 rounded bg-green-500/20 hover:bg-green-500/30 text-green-300 transition"
                        title="Add as task"
                      >
                        <ThumbsUp className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDismiss(suggestion.id)}
                        className="p-2 rounded bg-red-500/20 hover:bg-red-500/30 text-red-300 transition"
                        title="Dismiss"
                      >
                        <ThumbsDown className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <p className="text-center text-gray-400 py-8">No suggestions at this time</p>
            )}
          </div>
        )}

        {/* Smart Recommendations Tab */}
        {activeTab === 'smart' && !loading && (
          <div className="space-y-3">
            {displaySuggestions.length > 0 ? (
              displaySuggestions.map((suggestion) => (
                <motion.div
                  key={suggestion.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className={`p-4 border rounded-lg ${getSuggestionColor(suggestion.priority)} hover:bg-opacity-20 transition`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="text-white font-medium">{suggestion.title}</h4>
                      {suggestion.description && (
                        <p className="text-sm text-gray-400 mt-1">{suggestion.description}</p>
                      )}
                      <div className="flex gap-2 mt-2 text-xs">
                        <span className="px-2 py-1 bg-blue-500/20 rounded text-blue-300">
                          📍 Time-optimized
                        </span>
                        {suggestion.priority && (
                          <span className="px-2 py-1 bg-purple-500/20 rounded text-purple-300">
                            {suggestion.priority}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleAccept(suggestion)}
                        className="p-2 rounded bg-green-500/20 hover:bg-green-500/30 text-green-300 transition"
                        title="Add as task"
                      >
                        <ThumbsUp className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDismiss(suggestion.id)}
                        className="p-2 rounded bg-red-500/20 hover:bg-red-500/30 text-red-300 transition"
                        title="Dismiss"
                      >
                        <ThumbsDown className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <p className="text-center text-gray-400 py-8">No recommendations at this time</p>
            )}
          </div>
        )}

        {/* Pattern Analysis Tab */}
        {activeTab === 'patterns' && patterns && !loading && (
          <div className="space-y-4">
            {patterns.insights && patterns.insights.length > 0 ? (
              <>
                <div>
                  <h4 className="text-white font-medium mb-3">Key Insights</h4>
                  <ul className="space-y-2">
                    {patterns.insights.map((insight: string, idx: number) => (
                      <motion.li
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-sm text-gray-300 flex items-start gap-2"
                      >
                        <span className="text-yellow-400 mt-1">→</span>
                        <span>{insight}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>

                {patterns.stats && (
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    {Object.entries(patterns.stats).map(([key, value]: [string, any]) => (
                      <div key={key} className="p-3 bg-purple-500/10 rounded border border-purple-500/20">
                        <p className="text-xs text-gray-400 capitalize">{key.replace(/_/g, ' ')}</p>
                        <p className="text-lg font-semibold text-purple-300">
                          {typeof value === 'number' ? value.toFixed(1) : value}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <p className="text-center text-gray-400 py-8">Not enough data for pattern analysis</p>
            )}
          </div>
        )}

        {/* Refresh Button */}
        {!loading && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={loadSuggestions}
            className="mt-6 w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded transition text-sm font-medium"
          >
            Refresh Suggestions
          </motion.button>
        )}
      </div>
    </div>
  )
}
