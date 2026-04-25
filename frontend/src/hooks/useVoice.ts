'use client'
import { useRef, useCallback } from 'react'
import { useChatStore } from '@/lib/store/chatStore'

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8000'

interface UseVoiceCallbacks {
  onTranscribed: (text: string) => void
  onTranscribing?: (v: boolean) => void
  onError?: (msg: string) => void
}

export function useVoice({ onTranscribed, onTranscribing, onError }: UseVoiceCallbacks) {
  const mediaRef  = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const { setRecording } = useChatStore()

  const start = useCallback(async () => {
    try {
      const stream   = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      chunksRef.current = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop())
        onTranscribing?.(true)
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const form = new FormData()
        form.append('audio', blob, 'audio.webm')
        try {
          const res = await fetch(`${BACKEND}/voice/transcribe`, { method: 'POST', body: form })
          if (!res.ok) {
            const body = await res.text()
            onError?.(`Transcription failed (${res.status}): ${body}`)
            return
          }
          const { text } = await res.json()
          if (text?.trim()) onTranscribed(text.trim())
          else onError?.('No speech detected.')
        } catch {
          onError?.('Could not reach the voice service.')
        } finally {
          onTranscribing?.(false)
        }
      }

      mediaRef.current = recorder
      recorder.start()
      setRecording(true)
    } catch {
      onError?.('Microphone access denied.')
    }
  }, [onTranscribed, onTranscribing, onError, setRecording])

  const stop = useCallback(() => {
    if (mediaRef.current?.state === 'recording') {
      mediaRef.current.stop()
    }
    mediaRef.current = null
    setRecording(false)
  }, [setRecording])

  return { start, stop }
}
