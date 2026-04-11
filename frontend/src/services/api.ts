import axios, { AxiosInstance } from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Add request interceptor for auth token
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    })

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token')
          window.location.href = '/login'
        }
        return Promise.reject(error)
      }
    )
  }

  // Auth endpoints
  async register(email: string, name: string, password: string) {
    return this.client.post('/auth/register', { email, name, password })
  }

  async login(email: string, password: string) {
    return this.client.post('/auth/login', { email, password })
  }

  async getProfile() {
    return this.client.get('/auth/profile')
  }

  async updateProfile(data: any) {
    return this.client.put('/auth/profile', data)
  }

  // Task endpoints
  async createTask(task: any) {
    return this.client.post('/tasks', task)
  }

  async getTasks(filters?: any) {
    return this.client.get('/tasks', { params: filters })
  }

  async getTask(id: string) {
    return this.client.get(`/tasks/${id}`)
  }

  async updateTask(id: string, task: any) {
    return this.client.put(`/tasks/${id}`, task)
  }

  async deleteTask(id: string) {
    return this.client.delete(`/tasks/${id}`)
  }

  async completeTask(id: string) {
    return this.client.post(`/tasks/${id}/complete`)
  }

  async getTodaysTasks() {
    return this.client.get('/tasks/today')
  }

  async searchTasks(query: string) {
    return this.client.get('/tasks/search', { params: { q: query } })
  }

  // Gamification endpoints
  async getGamificationStats() {
    return this.client.get('/gamification/stats')
  }

  async getXPLeaderboard() {
    return this.client.get('/gamification/xp-leaderboard')
  }

  async getStreakLeaderboard() {
    return this.client.get('/gamification/streak-leaderboard')
  }

  async getLevelLeaderboard() {
    return this.client.get('/gamification/level-leaderboard')
  }

  async getUserAchievements() {
    return this.client.get('/gamification/achievements')
  }

  async getAllAchievements() {
    return this.client.get('/gamification/achievements/all')
  }

  async getLevelProgress() {
    return this.client.get('/gamification/next-level-progress')
  }

  async checkStreak() {
    return this.client.post('/gamification/check-streak')
  }

  async getStreakMilestones() {
    return this.client.get('/gamification/streak-milestones')
  }

  // Analytics endpoints
  async getProductivityMetrics() {
    return this.client.get('/analytics/metrics')
  }

  async getDashboardStats() {
    return this.client.get('/analytics/dashboard')
  }

  async getDailyCompletion(days: number = 30) {
    return this.client.get('/analytics/completion', { params: { days } })
  }

  async getCategoryBreakdown() {
    return this.client.get('/analytics/categories')
  }

  async getPriorityBreakdown() {
    return this.client.get('/analytics/priorities')
  }

  // Team endpoints
  async createTeam(name: string, description?: string) {
    return this.client.post('/teams', { name, description })
  }

  async getUserTeams() {
    return this.client.get('/teams')
  }

  async getTeam(teamId: string) {
    return this.client.get(`/teams/${teamId}`)
  }

  async updateTeam(teamId: string, data: any) {
    return this.client.put(`/teams/${teamId}`, data)
  }

  async inviteUserToTeam(teamId: string, email: string) {
    return this.client.post(`/teams/${teamId}/invite`, { email })
  }

  async acceptTeamInvitation(invitationId: string) {
    return this.client.post(`/teams/invitations/${invitationId}/accept`)
  }

  async removeTeamMember(teamId: string, memberId: string) {
    return this.client.delete(`/teams/${teamId}/members/${memberId}`)
  }

  async updateTeamMemberRole(teamId: string, memberId: string, role: string) {
    return this.client.put(`/teams/${teamId}/members/${memberId}/role`, { role })
  }

  async shareTaskWithTeam(teamId: string, taskId: string) {
    return this.client.post(`/teams/${teamId}/share-task/${taskId}`)
  }

  async getTeamActivity(teamId: string) {
    return this.client.get(`/teams/${teamId}/activity`)
  }

  // Habit endpoints
  async createHabit(habitData: any) {
    return this.client.post('/habits', habitData)
  }

  async getUserHabits(includeInactive: boolean = false) {
    return this.client.get('/habits', { params: { includeInactive } })
  }

  async getHabit(habitId: string) {
    return this.client.get(`/habits/${habitId}`)
  }

  async updateHabit(habitId: string, data: any) {
    return this.client.put(`/habits/${habitId}`, data)
  }

  async completeHabit(habitId: string) {
    return this.client.post(`/habits/${habitId}/complete`)
  }

  async deleteHabit(habitId: string) {
    return this.client.delete(`/habits/${habitId}`)
  }

  async getHabitStats() {
    return this.client.get('/habits/stats/summary')
  }

  async getHabitsByCategory(category: string) {
    return this.client.get(`/habits/category/${category}`)
  }

  async getHabitCompletionData(habitId: string, days: number = 30) {
    return this.client.get(`/habits/${habitId}/data`, { params: { days } })
  }

  async checkHabitStreaks() {
    return this.client.post('/habits/check-streaks')
  }
}

