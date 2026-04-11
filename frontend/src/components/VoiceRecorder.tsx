import React, { useEffect, useRef, useState } from 'react'
import { Mic, Square, Send, Loader } from 'lucide-react'
import { motion } from 'framer-motion'

interface VoiceRecorderProps {
  onTaskCreated?: (task: any) => void
  onTranscription?: (text: string) => void
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onTaskCreated,
  onTranscription,
}) => {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const dataArrayRef = useRef<Uint8Array | null>(null)

  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [soundLevel, setSoundLevel] = useState(0)
  const [transcription, setTranscription] = useState('')
  const [error, setError] = useState('')
  const [taskData, setTaskData] = useState<any>(null)

  // Request microphone access
  const startRecording = async () => {
    try {
      setError('')
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      // Setup audio context for visualization
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext ||
          (window as any).webkitAudioContext)()
      }

      const audioContext = audioContextRef.current
      const source = audioContext.createMediaStreamSource(stream)
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 256
      source.connect(analyser)

      analyserRef.current = analyser
      dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount)

      // Setup media recorder
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        chunksRef.current.push(e.data)
      }

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop())
        await handleRecordingComplete()
      }

      mediaRecorder.start()
      setIsRecording(true)

      // Update sound level visualization
      const updateLevel = () => {
        if (analyserRef.current && dataArrayRef.current) {
          analyserRef.current.getByteFrequencyData(dataArrayRef.current)
          const average =
            dataArrayRef.current.reduce((a, b) => a + b) / dataArrayRef.current.length
          setSoundLevel(Math.min(100, (average / 255) * 100))

          if (isRecording) {
            requestAnimationFrame(updateLevel)
          }
        }
      }

      updateLevel()
    } catch (err: any) {
      setError(err.message || 'Failed to access microphone')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const handleRecordingComplete = async () => {
    const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' })

    setIsProcessing(true)

    try {
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.webm')

      // First approach: try to create task directly
      const response = await fetch('/api/voice/create-task', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to process voice input')
      }

      const result = await response.json()

      if (result.success) {
        setTranscription(result.transcription)
        setTaskData(result.data)
        onTranscription?.(result.transcription)
        onTaskCreated?.(result.data)

        // Clear after 2 seconds
        setTimeout(() => {
          setTranscription('')
          setTaskData(null)
        }, 2000)
      } else {
        setError(result.error || 'Failed to process audio')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to process audio')
    } finally {
      setIsProcessing(false)
      chunksRef.current = []
    }
  }

  return (
    <div className="voice-recorder">
      <style>{`
        @keyframes recording-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        .recording-pulse {
          animation: recording-pulse 1s infinite;
        }
      `}</style>

      <div className="flex flex-col items-center gap-4 p-6 bg-gradient-to-b from-purple-900/20 to-purple-900/5 rounded-xl border border-purple-500/20">
        {/* Microphone Button */}
        <motion.button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all ${
            isRecording
              ? 'bg-red-500 hover:bg-red-600 recording-pulse'
              : 'bg-purple-600 hover:bg-purple-700'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isProcessing ? (
            <Loader className="w-8 h-8 text-white animate-spin" />
          ) : isRecording ? (
            <Square className="w-8 h-8 text-white" />
          ) : (
            <Mic className="w-8 h-8 text-white" />
          )}
        </motion.button>

        {/* Sound Level Indicator */}
        {isRecording && (
          <div className="flex gap-1 h-8 items-center">
            {Array.from({ length: 10 }).map((_, i) => (
              <motion.div
                key={i}
                className="w-1 bg-purple-400 rounded"
                animate={{
                  height: soundLevel > i * 10 ? 24 : 8,
                }}
                transition={{ duration: 0.1 }}
              />
            ))}
          </div>
        )}

        {/* Status Text */}
        <p className="text-sm text-gray-400">
          {isProcessing
            ? 'Processing voice input...'
            : isRecording
              ? 'Listening... Click to stop'
              : 'Click to record task'}
        </p>

        {/* Transcription Display */}
        {transcription && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 bg-green-500/20 border border-green-500/50 rounded text-green-200 text-sm text-center max-w-xs"
          >
            <p className="font-semibold mb-1">Transcription:</p>
            <p className="text-xs">{transcription}</p>
            {taskData && (
              <div className="mt-2 text-xs text-green-100">
                <p>✓ Task created: {taskData.title}</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded text-red-200 text-sm text-center max-w-xs"
          >
            {error}
          </motion.div>
        )}
      </div>
    </div>
  )
}
