import axios from 'axios'

export class VoiceService {
  private apiKey = process.env.OPENAI_API_KEY

  /**
   * Transcribe audio file to text using OpenAI Whisper
   */
  async transcribeAudio(audioBuffer: Buffer, mimeType: string = 'audio/webm'): Promise<string> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured')
    }

    try {
      const formData = new FormData()
      const audioBlob = new Blob([audioBuffer], { type: mimeType })
      formData.append('file', audioBlob, 'audio.webm')
      formData.append('model', 'whisper-1')

      const response = await axios.post(
        'https://api.openai.com/v1/audio/transcriptions',
        formData,
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
          },
        }
      )

      return response.data.text
    } catch (error: any) {
      throw new Error(`Transcription failed: ${error.message}`)
    }
  }

  /**
   * Convert text to speech using OpenAI TTS
   */
  async textToSpeech(text: string, voice: string = 'alloy'): Promise<Buffer> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured')
    }

    try {
      const response = await axios.post(
        'https://api.openai.com/v1/audio/speech',
        {
          model: 'tts-1-hd',
          input: text,
          voice,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
          },
          responseType: 'arraybuffer',
        }
      )

      return Buffer.from(response.data)
    } catch (error: any) {
      throw new Error(`Text-to-speech failed: ${error.message}`)
    }
  }

  /**
   * Parse natural language input to extract task details
   */
  async parseNaturalLanguageTask(text: string): Promise<{
    title: string
    description?: string
    dueDate?: Date
    priority?: string
    category?: string
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
              content: `You are a task parsing assistant. Extract task details from natural language input and return a JSON object with:
- title (required): the main task name
- description (optional): task details
- dueDate (optional): ISO format date if mentioned
- priority (optional): Critical, High, Medium, or Low
- category (optional): Work, Personal, Health, Education, Shopping, or Other

Be concise. Return only valid JSON.`,
            },
            {
              role: 'user',
              content: text,
            },
          ],
          temperature: 0.3,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
          },
        }
      )

      const parsedText = response.data.choices[0].message.content
      const parsed = JSON.parse(parsedText)

      if (parsed.dueDate) {
        parsed.dueDate = new Date(parsed.dueDate)
      }

      return parsed
    } catch (error: any) {
      throw new Error(`Natural language parsing failed: ${error.message}`)
    }
  }

  /**
   * Validate transcribed text quality
   */
  validateTranscription(text: string): { valid: boolean; confidence: number; issues: string[] } {
    const issues: string[] = []

    if (!text || text.trim().length === 0) {
      issues.push('Empty transcription')
      return { valid: false, confidence: 0, issues }
    }

    if (text.length < 3) {
      issues.push('Transcription too short')
    }

    // Confidence based on length and structure
    let confidence = Math.min(100, (text.length / 50) * 100)

    return {
      valid: issues.length === 0,
      confidence: Math.round(confidence),
      issues,
    }
  }
}
