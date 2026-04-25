'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { LevelSelector }   from '@/components/Sidebar/LevelSelector'
import { TopicSelector }   from '@/components/Sidebar/TopicSelector'
import { SessionStats }    from '@/components/Sidebar/SessionStats'
import { MessageBubble }   from '@/components/Chat/MessageBubble'
import { TypingIndicator } from '@/components/Chat/TypingIndicator'
import { VoiceVisualizer } from '@/components/Chat/VoiceVisualizer'
import { SettingsModal }   from '@/components/Settings/SettingsModal'
import { useChatStore }    from '@/lib/store/chatStore'
import { useSettingsStore } from '@/lib/store/settingsStore'
import { useChat }         from '@/hooks/useChat'
import { useVoice }        from '@/hooks/useVoice'

const TOPIC_EMOJI: Record<string, string> = {
  'Daily Life': '🌍', 'Work & Business': '💼', 'Travel': '✈️',
  'Movies & Series': '🎬', 'Food & Cooking': '🍕',
  'Health & Fitness': '💪', 'Current Events': '📰', 'Free Conversation': '🎯',
}

export default function Home() {
  const [input, setInput]               = useState('')
  const [sidebarOpen, setSidebar]       = useState(false)
  const [settingsOpen, setSettings]     = useState(false)
  const [isTranscribing, setTranscribing] = useState(false)
  const [toast, setToast]               = useState<string | null>(null)
  const messagesEnd = useRef<HTMLDivElement>(null)
  const inputRef    = useRef<HTMLInputElement>(null)
  const toastTimer  = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { messages, isRecording, isLoading } = useChatStore()
  const { level, topic } = useSettingsStore()
  const { send } = useChat()

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 4000)
  }, [])

  // Transcription puts text in the input field — user can edit then press Send
  const handleTranscribed = useCallback((text: string) => {
    setInput(text)
    setTimeout(() => inputRef.current?.focus(), 50)
  }, [])

  const { start: startRecording, stop: stopRecording } = useVoice({
    onTranscribed:  handleTranscribed,
    onTranscribing: setTranscribing,
    onError:        showToast,
  })

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const handleSend = () => {
    if (!input.trim()) return
    send(input)
    setInput('')
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const toggleMic = () => {
    if (isRecording) stopRecording()
    else startRecording()
  }

  const busy = isLoading || isTranscribing

  const inputPlaceholder = isRecording    ? '🔴 Recording… press mic to stop'
    : isTranscribing                      ? '⏳ Transcribing…'
    : 'Type or press mic to speak…'

  const S = {
    root: {
      display: 'flex', height: '100dvh', overflow: 'hidden',
      background: 'var(--color-s0)', color: 'var(--color-text)',
      position: 'relative' as const,
    },
    sidebar: {
      width: '272px', flexShrink: 0,
      display: 'flex', flexDirection: 'column' as const,
      background: 'var(--color-s1)',
      borderRight: '1px solid var(--color-border)',
    },
    main: {
      flex: 1, display: 'flex', flexDirection: 'column' as const,
      overflow: 'hidden', minWidth: 0,
    },
  }

  return (
    <div style={S.root}>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '80px', left: '50%', transform: 'translateX(-50%)',
          background: 'var(--color-s3)', border: '1px solid var(--color-border)',
          borderRadius: '8px', padding: '9px 16px', zIndex: 200,
          fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--color-wrong)',
          letterSpacing: '0.02em', whiteSpace: 'nowrap', animation: 'fade-in 0.2s ease',
          display: 'flex', alignItems: 'center', gap: '8px',
        }}>
          <span>⚠</span> {toast}
          <button onClick={() => setToast(null)} style={{ background: 'none', border: 'none', color: 'var(--color-text3)', padding: '0 0 0 4px', fontSize: '13px' }}>✕</button>
        </div>
      )}

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div className="sp-backdrop" onClick={() => setSidebar(false)} />
      )}

      {/* ═══ SIDEBAR ═══ */}
      <aside style={S.sidebar} className={`sp-sidebar${sidebarOpen ? ' open' : ''}`}>
        <div style={{ padding: '20px 18px 16px', borderBottom: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '7px',
              background: 'var(--color-accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#080808" strokeWidth="2.5" strokeLinecap="round">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                <line x1="12" x2="12" y1="19" y2="22"/>
              </svg>
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '16px', letterSpacing: '-0.03em' }}>
              SpeakUp
            </span>
          </div>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-text3)', marginTop: '5px', letterSpacing: '0.07em', textTransform: 'uppercase' }}>
            English Tutor
          </p>
        </div>

        <div style={{ padding: '16px 18px 12px' }}>
          <Label>Level</Label>
          <LevelSelector />
        </div>

        <div style={{ padding: '0 18px 12px', flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <Label>Topic</Label>
          <div style={{ overflow: 'auto', flex: 1 }}>
            <TopicSelector />
          </div>
        </div>

        <div style={{ padding: '13px 18px', borderTop: '1px solid var(--color-border)' }}>
          <Label>Session</Label>
          <SessionStats messages={messages} />
        </div>
      </aside>

      {/* ═══ MAIN ═══ */}
      <main style={S.main}>

        {/* Header */}
        <header style={{
          height: '54px', padding: '0 22px',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0, background: 'var(--color-s1)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              className="sp-hamburger"
              onClick={() => setSidebar((o) => !o)}
              style={{
                width: '30px', height: '30px', borderRadius: '7px',
                border: '1px solid var(--color-border)', background: 'transparent',
                color: 'var(--color-text3)', alignItems: 'center', justifyContent: 'center',
                marginRight: '2px',
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="3" y1="6"  x2="21" y2="6"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>

            <span style={{ fontSize: '14px' }}>{TOPIC_EMOJI[topic] ?? '💬'}</span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '13px', color: 'var(--color-text2)', fontWeight: 600 }}>{topic}</span>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: '10px',
              color: 'var(--color-accent)', padding: '2px 7px',
              border: '1px solid rgba(57 224 122 / 0.25)', borderRadius: '4px',
              letterSpacing: '0.04em',
            }}>
              {level}
            </span>
          </div>

          <button
            onClick={() => setSettings(true)}
            style={{
              width: '30px', height: '30px', borderRadius: '7px',
              border: '1px solid var(--color-border)', background: 'transparent',
              color: 'var(--color-text3)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </button>
        </header>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 26px' }}>
          {messages.length === 0 ? (
            <Welcome topic={topic} />
          ) : (
            messages.map((m, i) => {
              const isLastEmpty = i === messages.length - 1 && m.role === 'assistant' && !m.content && isLoading
              return isLastEmpty
                ? <TypingIndicator key={m.id} />
                : <MessageBubble key={m.id} message={m} />
            })
          )}
          <div ref={messagesEnd} />
        </div>

        {/* Input bar */}
        <div style={{
          padding: '12px 22px 16px', flexShrink: 0,
          borderTop: '1px solid var(--color-border)',
          background: 'var(--color-s1)',
        }}>
          {/* Status strip */}
          {(isRecording || isTranscribing) && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '7px',
              marginBottom: '8px', padding: '6px 10px',
              background: isRecording ? 'rgba(57 224 122 / 0.06)' : 'rgba(255 255 255 / 0.03)',
              border: `1px solid ${isRecording ? 'rgba(57 224 122 / 0.2)' : 'var(--color-border)'}`,
              borderRadius: '8px', animation: 'fade-in 0.2s ease',
            }}>
              <span style={{
                width: '6px', height: '6px', borderRadius: '50%', flexShrink: 0,
                background: isRecording ? 'var(--color-accent)' : 'var(--color-text3)',
                animation: isRecording ? 'mic-ring 1s ease-out infinite' : 'none',
              }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: isRecording ? 'var(--color-accent)' : 'var(--color-text3)', letterSpacing: '0.04em' }}>
                {isRecording ? 'Recording — press mic again to stop' : 'Transcribing speech…'}
              </span>
            </div>
          )}

          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: 'var(--color-s2)',
            border: `1px solid ${isRecording ? 'rgba(57 224 122 / 0.3)' : 'var(--color-border)'}`,
            borderRadius: '12px',
            padding: '7px 7px 7px 14px',
            transition: 'border-color 0.2s ease',
          }}>
            {isRecording && <VoiceVisualizer active />}

            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={busy}
              placeholder={inputPlaceholder}
              style={{
                flex: 1, background: 'transparent', border: 'none', outline: 'none',
                color: 'var(--color-text)', fontFamily: 'var(--font-serif)', fontSize: '15px',
                opacity: busy && !isTranscribing ? 0.4 : 1,
              }}
            />

            {/* Mic */}
            <button
              onClick={toggleMic}
              disabled={isLoading || isTranscribing}
              title={isRecording ? 'Stop recording' : 'Start recording'}
              style={{
                width: '36px', height: '36px', borderRadius: '8px', flexShrink: 0,
                border: `1px solid ${isRecording ? 'var(--color-accent)' : 'var(--color-border)'}`,
                background: isRecording ? 'var(--color-accent-dim)' : 'transparent',
                color: isRecording ? 'var(--color-accent)' : 'var(--color-text3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s ease',
                animation: isRecording ? 'mic-ring 1.4s ease-out infinite' : 'none',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                <line x1="12" x2="12" y1="19" y2="22"/>
              </svg>
            </button>

            {/* Send */}
            <button
              onClick={handleSend}
              disabled={!input.trim() || busy}
              title="Send message"
              style={{
                width: '36px', height: '36px', borderRadius: '8px', flexShrink: 0,
                border: 'none',
                background: input.trim() && !busy ? 'var(--color-accent)' : 'var(--color-s3)',
                color: input.trim() && !busy ? '#080808' : 'var(--color-text3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s ease',
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m22 2-7 20-4-9-9-4Z"/>
                <path d="M22 2 11 13"/>
              </svg>
            </button>
          </div>

          <p style={{
            fontFamily: 'var(--font-mono)', fontSize: '10px',
            color: 'var(--color-text3)', textAlign: 'center', marginTop: '7px',
            letterSpacing: '0.03em',
          }}>
            mic to speak · enter to send · ⚙ to configure provider
          </p>
        </div>
      </main>

      {settingsOpen && <SettingsModal onClose={() => setSettings(false)} />}
    </div>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-text3)',
      textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px',
    }}>
      {children}
    </p>
  )
}

function Welcome({ topic }: { topic: string }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      height: '100%', gap: '12px', opacity: 0.45,
    }}>
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none"
        stroke="var(--color-accent)" strokeWidth="1.5" strokeLinecap="round">
        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
        <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
        <line x1="12" x2="12" y1="19" y2="22"/>
      </svg>
      <p style={{
        fontFamily: 'var(--font-display)', fontSize: '15px',
        color: 'var(--color-text2)', textAlign: 'center', maxWidth: '280px', lineHeight: 1.5,
      }}>
        Start a conversation about <strong style={{ color: 'var(--color-text)' }}>{topic}</strong>
      </p>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-text3)', letterSpacing: '0.04em' }}>
        type or press the mic button
      </p>
    </div>
  )
}
