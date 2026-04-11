import axios from 'axios'

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Voice API
export const voiceAPI = {
  transcribeAudio: (audioBuffer: Blob) => {
    const formData = new FormData()
    formData.append('audio', audioBuffer)
    return api.post('/voice/transcribe', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  createTaskFromVoice: (audioBuffer: Blob) => {
    const formData = new FormData()
    formData.append('audio', audioBuffer)
    return api.post('/voice/create-task', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  textToSpeech: (text: string, voice?: string) => {
    return api.post(
      '/voice/text-to-speech',
      { text, voice },
      {
        responseType: 'blob',
      }
    )
  },

  parseNaturalLanguage: (text: string) => {
    return api.post('/voice/parse-natural-language', { text })
  },
}

// AI Suggestions API
export const aiAPI = {
  getSuggestions: (count?: number) => {
    return api.get('/ai/suggestions', { params: { count } })
  },

  getSmartRecommendations: () => {
    return api.get('/ai/smart-recommendations')
  },

  analyzePatterns: () => {
    return api.get('/ai/analyze-patterns')
  },

  suggestPriority: (title: string, description?: string) => {
    return api.post('/ai/suggest-priority', { title, description })
  },
}

export default api
