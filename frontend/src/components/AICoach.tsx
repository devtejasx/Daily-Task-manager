import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Lightbulb, TrendingUp, AlertCircle, Check } from 'lucide-react';
import { motion } from 'framer-motion';

interface Insight {
  type: 'strength' | 'opportunity' | 'warning' | 'suggestion';
  title: string;
  description: string;
  actionable: boolean;
  recommendation?: string;
}

export const AICoach: React.FC = () => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      const response = await api.get('/ai-coach/insights');

      if (response.success) {
        setInsights(response.data.insights);
      }
    } catch (err) {
      setError('Failed to load insights');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'strength':
        return <Check className="text-green-500" size={20} />;
      case 'opportunity':
        return <TrendingUp className="text-blue-500" size={20} />;
      case 'warning':
        return <AlertCircle className="text-yellow-500" size={20} />;
      case 'suggestion':
        return <Lightbulb className="text-purple-500" size={20} />;
      default:
        return <Lightbulb size={20} />;
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading your personalized insights...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-6">
        <Lightbulb className="text-purple-600" size={24} />
        <h2 className="text-2xl font-bold text-gray-900">Your AI Productivity Coach</h2>
      </div>

      {error && (
        <div className="text-red-600 text-center py-4">{error}</div>
      )}

      <div className="space-y-3">
        {insights.map((insight, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-lg transition"
          >
            <div className="flex items-start gap-3">
              {getIcon(insight.type)}

              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{insight.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{insight.description}</p>

                {insight.recommendation && (
                  <div className="mt-3 p-3 bg-blue-50 rounded border-l-4 border-blue-500">
                    <p className="text-sm font-medium text-blue-900">
                      💡 {insight.recommendation}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <button
        onClick={fetchInsights}
        className="w-full mt-4 px-4 py-2 text-sm font-medium text-purple-600 border border-purple-300 rounded-lg hover:bg-purple-50 transition"
      >
        Refresh Insights
      </button>
    </div>
  );
};
