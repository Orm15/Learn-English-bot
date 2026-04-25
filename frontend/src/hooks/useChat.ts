'use client'
import { useCallback, useRef } from 'react'
import { useChatStore } from '@/lib/store/chatStore'
import { useSettingsStore } from '@/lib/store/settingsStore'
import type { Correction, Message } from '@/types'

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8000'

// Strip the ---CORRECTIONS--- block — tolerates spaces/variations in the delimiter
const displayText = (raw: string) =>
  raw.replace(/\s*-{2,}\s*CORRECTIONS\s*-{2,}[\s\S]*/i, '').trim()

export function useChat() {
  const { messages, addMessage, updateLastMessage, patchLastMessage, setLoading } = useChatStore()
  const { level, topic, providerConfig, autoPlay, ttsSpeed } = useSettingsStore()
  // Stable ref so the send closure always sees the latest messages
  const messagesRef = useRef(messages)
  messagesRef.current = messages

  const send = useCallback(
    async (content: string) => {
      const trimmed = content.trim()
      if (!trimmed) return

      const userMsg: Message = {
        id: crypto.randomUUID(),
        role: 'user',
        content: trimmed,
        timestamp: Date.now(),
      }
      addMessage(userMsg)
      addMessage({ id: crypto.randomUUID(), role: 'assistant', content: '', timestamp: Date.now() })
      setLoading(true)

      // Snapshot of history before this turn (excludes the empty assistant placeholder)
      const history = [...messagesRef.current, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }))

      try {
        const res = await fetch(`${BACKEND}/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: history, provider_config: providerConfig, level, topic }),
        })

        if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`)

        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let buf = ''
        let fullRaw = ''
        let corrections: Correction[] = []

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buf += decoder.decode(value, { stream: true })
          const lines = buf.split('\n')
          buf = lines.pop() ?? ''

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue
            const payload = line.slice(6).trim()
            if (payload === '[DONE]') break
            try {
              const evt = JSON.parse(payload)
              if (evt.type === 'token') {
                fullRaw += evt.text
                updateLastMessage(displayText(fullRaw))
              } else if (evt.type === 'corrections') {
                corrections = (evt.data ?? []) as Correction[]
              }
            } catch {
              // malformed SSE line — skip
            }
          }
        }

        patchLastMessage({ corrections: corrections.length ? corrections : undefined })

        if (autoPlay && fullRaw.trim()) {
          try {
            const ttsRes = await fetch(`${BACKEND}/voice/synthesize`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ text: displayText(fullRaw) }),
            })
            if (ttsRes.ok) {
              const blob = await ttsRes.blob()
              const url = URL.createObjectURL(blob)
              const audio = new Audio(url)
              audio.playbackRate = ttsSpeed
              audio.play()
              audio.onended = () => URL.revokeObjectURL(url)
            }
          } catch {
            // TTS failure is non-fatal
          }
        }
      } catch {
        updateLastMessage('⚠️ Could not reach the backend. Make sure the service is running.')
      } finally {
        setLoading(false)
      }
    },
    [addMessage, updateLastMessage, patchLastMessage, setLoading, providerConfig, level, topic, autoPlay, ttsSpeed],
  )

  return { send }
}
