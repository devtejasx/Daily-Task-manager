'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import {
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Zap,
  Loader,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ScheduleSuggestion {
  taskId: string;
  suggestedDate: Date;
  reasoning: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedDuration?: number;
  priority: string;
}

interface DistributionAnalysis {
  byCategory: Record<string, number>;
  byPriority: Record<string, number>;
  byDate: Record<string, number>;
}

export const SmartScheduler: React.FC = () => {
  const [suggestions, setSuggestions] = useState<ScheduleSuggestion[]>([]);
  const [optimizations, setOptimizations] = useState<string[]>([]);
  const [distribution, setDistribution] = useState<DistributionAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'suggestions' | 'optimizations' | 'distribution'>(
    'suggestions'
  );
  const [selectedSuggestions, setSelectedSuggestions] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchScheduleData();
  }, []);

  const fetchScheduleData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [suggestionsRes, optimizationsRes, distributionRes] = await Promise.all([
        api.get('/scheduler/suggestions'),
        api.get('/scheduler/optimizations'),
        api.get('/scheduler/distribution')
      ]);

      if (suggestionsRes.success) {
        setSuggestions(
          suggestionsRes.data.suggestions.map((s: any) => ({
            ...s,
            suggestedDate: new Date(s.suggestedDate)
          }))
        );
      }

      if (optimizationsRes.success) {
        setOptimizations(optimizationsRes.data.recommendations);
      }

      if (distributionRes.success) {
        setDistribution(distributionRes.data);
      }
    } catch (err) {
      console.error('Failed to fetch schedule data:', err);
      setError('Failed to load schedule data');
    } finally {
      setLoading(false);
    }
  };

  const handleApplySuggestions = async () => {
    try {
      setApplying(true);
      const suggestionsToApply = suggestions.filter((s) =>
        selectedSuggestions.size === 0 || selectedSuggestions.has(s.taskId)
      );

      const response = await api.post('/scheduler/apply', {
        suggestions: suggestionsToApply
      });

      if (response.success) {
        setSelectedSuggestions(new Set());
        await fetchScheduleData();
      }
    } catch (err) {
      console.error('Failed to apply suggestions:', err);
      setError('Failed to apply suggestions');
    } finally {
      setApplying(false);
    }
  };

  const handleAutoSchedule = async () => {
    try {
      setApplying(true);
      const response = await api.post('/scheduler/auto-schedule', {});

      if (response.success) {
        await fetchScheduleData();
      }
    } catch (err) {
      console.error('Failed to auto-schedule:', err);
      setError('Failed to auto-schedule tasks');
    } finally {
      setApplying(false);
    }
  };

  const toggleSuggestion = (taskId: string) => {
    const newSelected = new Set(selectedSuggestions);
    if (newSelected.has(taskId)) {
      newSelected.delete(taskId);
    } else {
      newSelected.add(taskId);
    }
    setSelectedSuggestions(newSelected);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'hard':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical':
        return 'text-red-600';
      case 'High':
        return 'text-orange-600';
      case 'Medium':
        return 'text-yellow-600';
      default:
        return 'text-green-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="animate-spin text-blue-600" size={32} />
        <span className="ml-4 text-gray-600">Loading your schedule...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Calendar className="text-blue-600" size={28} />
          <h2 className="text-3xl font-bold text-gray-900">Smart Scheduler</h2>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleAutoSchedule}
          disabled={applying || suggestions.length === 0}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition flex items-center gap-2"
        >
          <Zap size={18} />
          Auto-Schedule All
        </motion.button>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3"
        >
          <AlertCircle className="text-red-600 mt-0.5" size={20} />
          <p className="text-red-700">{error}</p>
        </motion.div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {(['suggestions', 'optimizations', 'distribution'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 font-medium transition capitalize ${
              activeTab === tab
                ? 'text-blue-600 border-b-2 border-blue-600 -mb-px'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab === 'suggestions' && `Suggestions (${suggestions.length})`}
            {tab === 'optimizations' && `Tips (${optimizations.length})`}
            {tab === 'distribution' && 'Distribution'}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Suggestions Tab */}
        {activeTab === 'suggestions' && (
          <motion.div
            key="suggestions"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {suggestions.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <CheckCircle className="mx-auto text-green-600 mb-2" size={32} />
                <p className="text-gray-600">All tasks are already scheduled!</p>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {suggestions.map((suggestion) => (
                    <motion.div
                      key={suggestion.taskId}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition"
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={selectedSuggestions.has(suggestion.taskId)}
                          onChange={() => toggleSuggestion(suggestion.taskId)}
                          className="w-5 h-5 rounded border-gray-300 mt-1 cursor-pointer"
                        />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h3 className="font-semibold text-gray-900 truncate">Task #{suggestion.taskId.slice(0, 8)}</h3>
                            <div className="flex gap-2 flex-shrink-0">
                              <span className={`text-xs font-semibold px-2 py-1 rounded ${getDifficultyColor(suggestion.difficulty)}`}>
                                {suggestion.difficulty}
                              </span>
                              <span className={`text-xs font-semibold px-2 py-1 rounded bg-gray-100 ${getPriorityColor(suggestion.priority)}`}>
                                {suggestion.priority}
                              </span>
                            </div>
                          </div>

                          <p className="text-sm text-gray-600 mb-3">{suggestion.reasoning}</p>

                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Calendar size={16} />
                              {suggestion.suggestedDate.toLocaleDateString()}
                            </div>
                            {suggestion.estimatedDuration && (
                              <div className="flex items-center gap-1">
                                <Clock size={16} />
                                {suggestion.estimatedDuration} min
                              </div>
                            )}
                          </div>
                        </div>

                        <ChevronRight className="text-gray-400 flex-shrink-0 mt-1" size={20} />
                      </div>
                    </motion.div>
                  ))}
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleApplySuggestions}
                  disabled={applying || selectedSuggestions.size === 0}
                  className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition font-semibold"
                >
                  {applying ? 'Applying...' : `Apply Selected (${selectedSuggestions.size})`}
                </motion.button>
              </>
            )}
          </motion.div>
        )}

        {/* Optimizations Tab */}
        {activeTab === 'optimizations' && (
          <motion.div
            key="optimizations"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-3"
          >
            {optimizations.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <Zap className="mx-auto text-blue-600 mb-2" size={32} />
                <p className="text-gray-600">You're already optimized! Keep up the great work.</p>
              </div>
            ) : (
              optimizations.map((optimization, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-blue-50 rounded-lg border border-blue-200 p-4 flex items-start gap-3"
                >
                  <TrendingUp className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
                  <p className="text-blue-900">{optimization}</p>
                </motion.div>
              ))
            )}
          </motion.div>
        )}

        {/* Distribution Tab */}
        {activeTab === 'distribution' && distribution && (
          <motion.div
            key="distribution"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            {/* By Priority */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-4">By Priority</h3>
              <div className="space-y-2">
                {Object.entries(distribution.byPriority).map(([priority, count]) => (
                  <div key={priority} className="flex justify-between items-center">
                    <span className={`text-sm font-medium ${getPriorityColor(priority)}`}>
                      {priority}
                    </span>
                    <span className="text-lg font-bold text-gray-900">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* By Category */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-4">By Category</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {Object.entries(distribution.byCategory).map(([category, count]) => (
                  <div key={category} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 truncate">{category}</span>
                    <span className="text-lg font-bold text-gray-900">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Dates */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Upcoming Dates</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {Object.entries(distribution.byDate)
                  .slice(0, 5)
                  .map(([date, count]) => (
                    <div key={date} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{date}</span>
                      <span className="text-lg font-bold text-gray-900">{count}</span>
                    </div>
                  ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
