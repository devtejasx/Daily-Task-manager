import express, { Request, Response } from 'express'
import { auth } from '../middleware/auth'
import { VoiceService } from '../services/VoiceService'
import { TaskService } from '../services/TaskService'
import multer from 'multer'

const router = express.Router()
const voiceService = new VoiceService()
const taskService = new TaskService()
const upload = multer({ storage: multer.memoryStorage() })

/**
 * POST /api/voice/transcribe
 * Transcribe audio file to text
 */
router.post('/transcribe', auth, upload.single('audio'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' })
    }

    const text = await voiceService.transcribeAudio(req.file.buffer, req.file.mimetype)

    // Validate transcription
    const validation = voiceService.validateTranscription(text)

    res.json({
      success: true,
      data: {
        text,
        confidence: validation.confidence,
        valid: validation.valid,
      },
    })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message })
  }
})

/**
 * POST /api/voice/create-task
 * Create task from voice input
 */
router.post('/create-task', auth, upload.single('audio'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' })
    }

    // Transcribe audio
    const text = await voiceService.transcribeAudio(req.file.buffer, req.file.mimetype)

    // Validate transcription
    const validation = voiceService.validateTranscription(text)
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: 'Voice input could not be clearly understood',
        issues: validation.issues,
      })
    }

    // Parse natural language to task details
    const taskData = await voiceService.parseNaturalLanguageTask(text)

    // Create task
    const task = await taskService.createTask(req.userId as string, taskData)

    res.status(201).json({
      success: true,
      data: task,
      transcription: text,
      message: 'Task created from voice input',
    })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message })
  }
})

/**
 * POST /api/voice/text-to-speech
 * Convert text to speech
 */
router.post('/text-to-speech', auth, async (req: Request, res: Response) => {
  try {
    const { text, voice } = req.body

    if (!text) {
      return res.status(400).json({ error: 'Text is required' })
    }

    const audioBuffer = await voiceService.textToSpeech(text, voice || 'alloy')

    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Disposition': 'attachment; filename="speech.mp3"',
    })

    res.send(audioBuffer)
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message })
  }
})

/**
 * POST /api/voice/parse-natural-language
 * Parse natural language text to task
 */
router.post('/parse-natural-language', auth, async (req: Request, res: Response) => {
  try {
    const { text } = req.body

    if (!text) {
      return res.status(400).json({ error: 'Text is required' })
    }

    const taskData = await voiceService.parseNaturalLanguageTask(text)

    res.json({
      success: true,
      data: taskData,
    })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message })
  }
})

export default router
