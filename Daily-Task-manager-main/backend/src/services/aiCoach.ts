import { User } from '../models/User';
import { Task } from '../models/Task';
import { TimerSession } from '../models/TimerSession';
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

interface CoachInsight {
  type: 'strength' | 'opportunity' | 'warning' | 'suggestion';
  title: string;
  description: string;
  actionable: boolean;
  recommendation?: string;
}

class AICoachService {
  /**
   * Analyze user productivity patterns and generate insights
   */
  async generateInsights(userId: string): Promise<CoachInsight[]> {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    // Fetch user data
    const tasks = await Task.find({ userId }).limit(100);
    const timerSessions = await TimerSession.find({ userId }).limit(100);

    // Calculate metrics
    const metrics = this.calculateMetrics(tasks, timerSessions, user);

    // Use OpenAI to generate insights
    const prompt = this.buildPrompt(metrics, user);
    const insights = await this.callOpenAI(prompt);

    return insights;
  }

  private calculateMetrics(tasks: any[], sessions: any[], user: any) {
    const completedTasks = tasks.filter(t => t.status === 'completed');
    const completionRate = completedTasks.length / tasks.length;

    // Time analysis
    const totalMinutes = sessions.reduce((sum, s) => sum + s.duration, 0) / 60;
    const avgSessionLength = sessions.length > 0 ? totalMinutes / sessions.length : 0;

    // Priority analysis
    const highPriorityRate = completedTasks.filter(
      t => t.priority === 'high' || t.priority === 'critical'
    ).length / completedTasks.length;

    // Category analysis
    const categoryCounts = this.analyzeCategoryPerformance(tasks);

    // Streak analysis
    const streakStatus = user.gamification.streak;
    const maxStreak = user.gamification.maxStreak;

    // Time patterns
    const hourlyPattern = this.analyzeHourlyPatterns(sessions);

    return {
      completionRate,
      totalMinutes,
      avgSessionLength,
      highPriorityRate,
      categoryCounts,
      streakStatus,
      maxStreak,
      hourlyPattern,
      totalTasks: tasks.length,
      totalSessions: sessions.length,
      level: user.gamification.level,
      totalXP: user.gamification.totalXP
    };
  }

  private buildPrompt(metrics: any, user: any): string {
    return `
      You are an AI productivity coach analyzing a user's productivity data. 
      Provide 3-4 actionable insights based on this data:
      
      User Level: ${metrics.level}
      Total XP: ${metrics.totalXP}
      Completion Rate: ${(metrics.completionRate * 100).toFixed(1)}%
      Current Streak: ${metrics.streakStatus} days
      Max Streak: ${metrics.maxStreak} days
      
      Time Stats:
      - Total focus time: ${metrics.totalMinutes.toFixed(0)} minutes
      - Average session: ${metrics.avgSessionLength.toFixed(1)} minutes
      - Total sessions: ${metrics.totalSessions}
      
      Task Stats:
      - Total tasks: ${metrics.totalTasks}
      - High priority completion: ${(metrics.highPriorityRate * 100).toFixed(1)}%
      
      Most productive hours: ${metrics.hourlyPattern}
      
      Generate insights that are:
      1. Specific and data-driven
      2. Actionable with clear recommendations
      3. Encouraging and motivational
      
      Format as JSON:
      {
        "insights": [
          {
            "type": "strength|opportunity|warning|suggestion",
            "title": "Brief title",
            "description": "Detailed explanation",
            "recommendation": "Specific action to take"
          }
        ]
      }
    `;
  }

  private async callOpenAI(prompt: string): Promise<CoachInsight[]> {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      });

      const content = response.choices[0].message.content;
      const parsed = JSON.parse(content!);

      return parsed.insights.map((insight: any) => ({
        type: insight.type,
        title: insight.title,
        description: insight.description,
        actionable: true,
        recommendation: insight.recommendation
      }));
    } catch (error) {
      console.error('OpenAI API error:', error);
      // Return fallback insights
      return this.getFallbackInsights();
    }
  }

  private analyzeCategoryPerformance(tasks: any[]) {
    const categories: Record<string, { total: number; completed: number }> = {};

    tasks.forEach(task => {
      if (!categories[task.category]) {
        categories[task.category] = { total: 0, completed: 0 };
      }
      categories[task.category].total++;
      if (task.status === 'completed') {
        categories[task.category].completed++;
      }
    });

    return Object.entries(categories).map(([cat, stats]) => ({
      category: cat,
      rate: stats.completed / stats.total
    }));
  }

  private analyzeHourlyPatterns(sessions: any[]): string {
    if (sessions.length === 0) return 'No data available';

    const hourCounts: Record<number, number> = {};

    sessions.forEach(session => {
      const hour = new Date(session.startedAt).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    const maxHour = Object.entries(hourCounts).sort(([, a], [, b]) => b - a)[0];
    return maxHour ? `${maxHour[0]}:00 (${maxHour[1]} sessions)` : 'Unknown';
  }

  private getFallbackInsights(): CoachInsight[] {
    return [
      {
        type: 'suggestion',
        title: 'Start tracking time',
        description: 'Use the timer to track your work sessions and get better insights',
        actionable: true,
        recommendation: 'Click the timer button when starting a task'
      },
      {
        type: 'suggestion',
        title: 'Complete more high-priority tasks',
        description: 'Focus on what matters most to improve your impact',
        actionable: true,
        recommendation: 'Filter tasks by High/Critical priority and complete them first'
      },
      {
        type: 'strength',
        title: 'Keep building your streak',
        description: 'Consistency is key to productivity',
        actionable: false
      }
    ];
  }
}

export const aiCoachService = new AICoachService();
