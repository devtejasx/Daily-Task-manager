import { Task } from '../models/Task';
import { User } from '../models/User';
import { TimerSession } from '../models/TimerSession';

export interface ScheduleSuggestion {
  taskId: string;
  suggestedDate: Date;
  reasoning: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedDuration?: number;
  priority: string;
}

class SmartSchedulerService {
  /**
   * Analyze user's tasks and suggest optimal schedule
   */
  async generateSchedule(userId: string): Promise<ScheduleSuggestion[]> {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    const tasks = await Task.find({
      userId,
      status: { $ne: 'completed' },
      dueDate: null // Unscheduled tasks
    });

    if (tasks.length === 0) {
      return [];
    }

    const suggestions: ScheduleSuggestion[] = [];

    // Sort by priority
    const sortedTasks = tasks.sort((a, b) => {
      const priorityMap = { Critical: 4, High: 3, Medium: 2, Low: 1 };
      return (
        priorityMap[b.priority as keyof typeof priorityMap] -
        priorityMap[a.priority as keyof typeof priorityMap]
      );
    });

    // Calculate workload per day
    const currentWorkload = await this.calculateWorkload(userId);

    // Get user's peak productivity hours
    const peakHours = await this.getUserPeakHours(userId);

    // Distribute tasks
    let currentDate = new Date();
    currentDate.setHours(9, 0, 0, 0); // Start at 9 AM

    let tasksPerDay = 0;
    const maxTasksPerDay = 5;

    for (const task of sortedTasks) {
      // Check if current day is overloaded
      if (tasksPerDay >= maxTasksPerDay) {
        currentDate = new Date(
          currentDate.getTime() + 24 * 60 * 60 * 1000
        );
        currentDate.setHours(9, 0, 0, 0);
        tasksPerDay = 0;
      }

      // Skip weekends if user preference
      if (user.preferences?.skipWeekends) {
        while ([0, 6].includes(currentDate.getDay())) {
          currentDate = new Date(
            currentDate.getTime() + 24 * 60 * 60 * 1000
          );
        }
      }

      const difficulty = this.assessDifficulty(task);
      const reasoning = this.generateReasoning(task, difficulty, peakHours);
      const estimatedDuration = task.estimatedDuration || 30;

      suggestions.push({
        taskId: task._id.toString(),
        suggestedDate: currentDate,
        reasoning,
        difficulty,
        estimatedDuration,
        priority: task.priority
      });

      tasksPerDay++;

      // Adjust time based on estimated duration
      const durationInMinutes = estimatedDuration;
      currentDate = new Date(
        currentDate.getTime() + durationInMinutes * 60 * 1000
      );

      // If we've gone past work hours (6 PM), move to next day
      if (currentDate.getHours() >= 18) {
        currentDate = new Date(
          currentDate.getTime() + (24 * 60 * 60 * 1000)
        );
        currentDate.setHours(9, 0, 0, 0);
        tasksPerDay = 0;
      }
    }

    return suggestions;
  }

  /**
   * Apply schedule suggestions to tasks
   */
  async applySuggestions(
    userId: string,
    suggestions: ScheduleSuggestion[]
  ): Promise<number> {
    let applied = 0;

    for (const suggestion of suggestions) {
      try {
        const task = await Task.findById(suggestion.taskId);
        if (task && task.userId.toString() === userId) {
          task.dueDate = suggestion.suggestedDate;
          await task.save();
          applied++;
        }
      } catch (error) {
        console.error(`Failed to apply suggestion for task ${suggestion.taskId}:`, error);
      }
    }

    return applied;
  }

  /**
   * Auto-schedule all unscheduled tasks
   */
  async autoScheduleAll(userId: string): Promise<number> {
    const suggestions = await this.generateSchedule(userId);
    return this.applySuggestions(userId, suggestions);
  }

  /**
   * Get optimization recommendations
   */
  async getOptimizations(userId: string): Promise<string[]> {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    const tasks = await Task.find({ userId }).limit(100);
    const sessions = await TimerSession.find({ userId }).limit(100);

    const recommendations: string[] = [];

    // Check task completion rate
    const completedCount = tasks.filter(t => t.status === 'completed').length;
    const completionRate = tasks.length > 0 ? completedCount / tasks.length : 0;

    if (completionRate < 0.5) {
      recommendations.push(
        'Consider breaking down larger tasks into smaller subtasks for better focus'
      );
    }

    // Check average session length
    const totalDuration = sessions.reduce((sum, s) => sum + s.duration, 0);
    const avgSessionMinutes = sessions.length > 0 ? totalDuration / sessions.length / 60 : 0;

    if (avgSessionMinutes < 15) {
      recommendations.push(
        'Your sessions are quite short. Try using the Pomodoro timer (25 min) for deeper focus'
      );
    }

    if (avgSessionMinutes > 120) {
      recommendations.push(
        'You have very long sessions. Consider taking breaks with our break timer feature'
      );
    }

    // Check priority distribution
    const highPriorityCount = tasks.filter(
      t => t.priority === 'High' || t.priority === 'Critical'
    ).length;

    if (highPriorityCount > tasks.length * 0.5) {
      recommendations.push(
        'Most of your tasks are high priority. Consider re-evaluating priorities to focus better'
      );
    }

    // Check focus mode usage
    const focusSessions = sessions.filter(s => s.focusMode).length;
    if (focusSessions === 0) {
      recommendations.push('Enable Focus Mode to minimize distractions during important tasks');
    }

    // Check time tracking
    if (sessions.length < 5) {
      recommendations.push('Start using the timer to track your productivity patterns');
    }

    return recommendations;
  }

  /**
   * Get task distribution analysis
   */
  async getDistributionAnalysis(userId: string): Promise<{
    byCategory: Record<string, number>;
    byPriority: Record<string, number>;
    byDate: Record<string, number>;
  }> {
    const tasks = await Task.find({ userId });

    const analysis = {
      byCategory: {} as Record<string, number>,
      byPriority: {} as Record<string, number>,
      byDate: {} as Record<string, number>
    };

    tasks.forEach(task => {
      // By category
      analysis.byCategory[task.category] = (analysis.byCategory[task.category] || 0) + 1;

      // By priority
      analysis.byPriority[task.priority] = (analysis.byPriority[task.priority] || 0) + 1;

      // By date
      if (task.dueDate) {
        const dateKey = task.dueDate.toISOString().split('T')[0];
        analysis.byDate[dateKey] = (analysis.byDate[dateKey] || 0) + 1;
      }
    });

    return analysis;
  }

  /**
   * Suggest optimal task order for a given day
   */
  async suggestDayOrder(userId: string, date: Date): Promise<ScheduleSuggestion[]> {
    const tasks = await Task.find({
      userId,
      dueDate: {
        $gte: new Date(date.setHours(0, 0, 0, 0)),
        $lt: new Date(date.setHours(23, 59, 59, 999))
      }
    });

    if (tasks.length === 0) {
      return [];
    }

    const peakHours = await this.getUserPeakHours(userId);

    // Sort by: priority > difficulty > estimated time
    const sorted = tasks.sort((a, b) => {
      const priorityMap = { Critical: 4, High: 3, Medium: 2, Low: 1 };
      const difficultyMap = { hard: 3, medium: 2, easy: 1 };

      const priorityDiff =
        (priorityMap[b.priority as keyof typeof priorityMap] || 0) -
        (priorityMap[a.priority as keyof typeof priorityMap] || 0);

      if (priorityDiff !== 0) return priorityDiff;

      const aDifficulty = this.assessDifficulty(a);
      const bDifficulty = this.assessDifficulty(b);

      const diffDiff =
        (difficultyMap[bDifficulty as keyof typeof difficultyMap] || 0) -
        (difficultyMap[aDifficulty as keyof typeof difficultyMap] || 0);

      return diffDiff;
    });

    let currentTime = new Date(date);
    currentTime.setHours(9, 0, 0, 0);

    return sorted.map((task, index) => {
      const suggestion: ScheduleSuggestion = {
        taskId: task._id.toString(),
        suggestedDate: new Date(currentTime),
        reasoning: `Task ${index + 1} of ${sorted.length}. ${this.generateReasoning(
          task,
          this.assessDifficulty(task),
          peakHours
        )}`,
        difficulty: this.assessDifficulty(task),
        estimatedDuration: task.estimatedDuration || 30,
        priority: task.priority
      };

      currentTime = new Date(
        currentTime.getTime() + (task.estimatedDuration || 30) * 60 * 1000
      );

      return suggestion;
    });
  }

  /**
   * Calculate workload for each day
   */
  private async calculateWorkload(
    userId: string
  ): Promise<Record<string, number>> {
    const tasks = await Task.find({
      userId,
      dueDate: { $exists: true },
      status: { $ne: 'completed' }
    });

    const workload: Record<string, number> = {};

    tasks.forEach(task => {
      if (task.dueDate) {
        const dateKey = task.dueDate.toISOString().split('T')[0];
        workload[dateKey] = (workload[dateKey] || 0) + 1;
      }
    });

    return workload;
  }

  /**
   * Get user's peak productivity hours
   */
  private async getUserPeakHours(userId: string): Promise<number[]> {
    try {
      const sessions = await TimerSession.find({
        userId,
        endedAt: { $exists: true }
      }).limit(50);

      if (sessions.length === 0) {
        return [9, 10, 11]; // Default morning hours
      }

      const hourCounts: Record<number, number> = {};

      sessions.forEach(session => {
        const hour = new Date(session.startedAt).getHours();
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      });

      // Get top 3 hours
      const topHours = Object.entries(hourCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([hour]) => parseInt(hour, 10));

      return topHours.length > 0 ? topHours : [9, 10, 11];
    } catch (error) {
      console.error('Error calculating peak hours:', error);
      return [9, 10, 11]; // Fallback
    }
  }

  /**
   * Assess task difficulty
   */
  private assessDifficulty(task: any): 'easy' | 'medium' | 'hard' {
    let score = 0;

    // Priority score
    const priorityMap = { Critical: 3, High: 2, Medium: 1, Low: 0 };
    score += (priorityMap[task.priority as keyof typeof priorityMap] || 0);

    // Subtask count
    if (task.subtasks && task.subtasks.length > 0) {
      score += Math.min(task.subtasks.length / 5, 2); // Max 2 points
    }

    // Estimated duration
    if (task.estimatedDuration) {
      score += Math.min(task.estimatedDuration / 60, 2); // Max 2 points
    }

    // Difficulty field
    if (task.difficulty === 'Hard') {
      score += 1;
    }

    if (score >= 5) return 'hard';
    if (score >= 2) return 'medium';
    return 'easy';
  }

  /**
   * Generate reasoning for scheduling
   */
  private generateReasoning(
    task: any,
    difficulty: string,
    peakHours: number[]
  ): string {
    const reasons: string[] = [];

    if (task.priority === 'Critical') {
      reasons.push('Critical priority - schedule early');
    } else if (task.priority === 'High') {
      reasons.push('High priority - prioritize');
    }

    if (difficulty === 'hard') {
      reasons.push('Complex task - schedule during peak hours');
    } else if (difficulty === 'easy') {
      reasons.push('Quick win - good for momentum');
    }

    if (task.subtasks && task.subtasks.length > 3) {
      reasons.push(`${task.subtasks.length} subtasks to complete`);
    }

    return reasons.join('. ') || 'Balanced task';
  }
}

export const smartSchedulerService = new SmartSchedulerService();
