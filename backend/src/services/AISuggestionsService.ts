import axios from 'axios'
import { Task } from '../models/Task'
import { User } from '../models/User'
import mongoose from 'mongoose'

export interface TaskSuggestion {
  title: string
  description?: string
  category?: string
  priority?: string
  dueDate?: Date
  estimatedTime?: number
  reason: string
  confidence: number
}

export class AISuggestionsService {
  private apiKey = process.env.OPENAI_API_KEY

  /**
   * Generate task suggestions based on user habits
   */
  async generateTaskSuggestions(userId: string, count: number = 5): Promise<TaskSuggestion[]> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured')
    }

    try {
      // Get user's recent tasks and patterns
      const recentTasks = await Task.find({
        userId: new mongoose.Types.ObjectId(userId),
      })
        .sort({ createdAt: -1 })
        .limit(20)

      const categories = recentTasks.map((t) => t.category)
      const priorities = recentTasks.map((t) => t.priority)
      const completedCount = recentTasks.filter((t) => t.status === 'Completed').length

      const taskContext = `
User has completed ${completedCount} out of ${recentTasks.length} recent tasks.
Common categories: ${categories.slice(0, 5).join(', ')}
Common priorities: ${priorities.slice(0, 5).join(', ')}

Recent tasks:
${recentTasks.slice(0, 10).map((t) => `- ${t.title} (Priority: ${t.priority}, Category: ${t.category})`).join('\n')}
`

      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: `You are a productivity assistant that suggests relevant tasks based on user patterns. 
Generate ${count} practical, actionable task suggestions that align with the user's work style and history.
Return a JSON array of objects with: title, description, category, priority, reason, confidence (0-100).
Be specific and actionable.`,
            },
            {
              role: 'user',
              content: taskContext,
            },
          ],
          temperature: 0.7,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
          },
        }
      )

      const suggestionsText = response.data.choices[0].message.content
      const suggestions = JSON.parse(suggestionsText)

      return suggestions
    } catch (error: any) {
      throw new Error(`Task suggestions failed: ${error.message}`)
    }
  }

  /**
   * Get smart task recommendations based on current time and day
   */
  async getSmartRecommendations(userId: string): Promise<TaskSuggestion[]> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured')
    }

    try {
      const user = await User.findById(userId)
      const now = new Date()
      const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' })
      const hour = now.getHours()

      const timeContext = `
Current: ${dayOfWeek} at ${hour}:00
User's current streak: ${user?.streak || 0} days
User's level: ${user?.level || 1}
User's completed tasks today: (check context)
`

      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: `You are a smart productivity coach. Based on the time and user's productivity patterns, 
suggest 3-5 timely tasks that they should focus on right now.
Consider energy levels throughout the day (morning: complex tasks, afternoon: routine tasks, evening: planning).
Return JSON array with: title, description, category, priority, reason, confidence.`,
            },
            {
              role: 'user',
              content: timeContext,
            },
          ],
          temperature: 0.6,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
          },
        }
      )

      const recommendationsText = response.data.choices[0].message.content
      const recommendations = JSON.parse(recommendationsText)

      return recommendations
    } catch (error: any) {
      throw new Error(`Smart recommendations failed: ${error.message}`)
    }
  }

  /**
   * Analyze task completion patterns and provide insights
   */
  async analyzeTaskPatterns(userId: string): Promise<{
    bestTimeToWork: string
    mostProductiveDay: string
    averageCompletionTime: number
    recommendedBreakFrequency: number
    insights: string[]
  }> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured')
    }

    try {
      const tasks = await Task.find({
        userId: new mongoose.Types.ObjectId(userId),
        status: 'Completed',
      }).limit(100)

      // Analyze completion times
      const completionsByHour: Record<number, number> = {}
      const completionsByDay: Record<string, number> = {}

      tasks.forEach((task) => {
        if (task.completedAt) {
          const hour = new Date(task.completedAt).getHours()
          const day = new Date(task.completedAt).toLocaleDateString('en-US', { weekday: 'short' })

          completionsByHour[hour] = (completionsByHour[hour] || 0) + 1
          completionsByDay[day] = (completionsByDay[day] || 0) + 1
        }
      })

      const bestHour = Object.entries(completionsByHour).sort(([, a], [, b]) => b - a)[0]
      const bestDay = Object.entries(completionsByDay).sort(([, a], [, b]) => b - a)[0]

      const analysisContext = `
Total completed tasks: ${tasks.length}
Best productivity hour: ${bestHour?.[0] || 'N/A'}:00
Best productivity day: ${bestDay?.[0] || 'N/A'}
Completion distribution: ${JSON.stringify(completionsByHour)}
`

      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: `Analyze productivity patterns and provide actionable insights.
Return JSON with: bestTimeToWork (string), mostProductiveDay (string), 
averageCompletionTime (minutes), recommendedBreakFrequency (minutes), 
insights (array of 3-5 actionable recommendations).`,
            },
            {
              role: 'user',
              content: analysisContext,
            },
          ],
          temperature: 0.5,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
          },
        }
      )

      const analysisText = response.data.choices[0].message.content
      const analysis = JSON.parse(analysisText)

      return analysis
    } catch (error: any) {
      throw new Error(`Pattern analysis failed: ${error.message}`)
    }
  }

  /**
   * Get AI-powered priority suggestions for a task
   */
  async suggestTaskPriority(taskTitle: string, taskDescription?: string): Promise<{
    suggestedPriority: 'Critical' | 'High' | 'Medium' | 'Low'
    reasoning: string
    urgencyScore: number
    importanceScore: number
  }> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured')
    }

    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: `You are a task prioritization expert. Based on task title and description,
suggest appropriate priority (Critical, High, Medium, Low) with explanations.
Score urgency (1-100) and importance (1-100).
Return JSON: {suggestedPriority, reasoning, urgencyScore, importanceScore}`,
            },
            {
              role: 'user',
              content: `Task: ${taskTitle}\nDescription: ${taskDescription || 'No description provided'}`,
            },
          ],
          temperature: 0.4,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
          },
        }
      )

      const priorityText = response.data.choices[0].message.content
      const priority = JSON.parse(priorityText)

      return priority
    } catch (error: any) {
      throw new Error(`Priority suggestion failed: ${error.message}`)
    }
  }
}
