'use client'
import { useSettingsStore } from '@/lib/store/settingsStore'
import type { Topic } from '@/types'

const TOPICS: { label: Topic; emoji: string }[] = [
  { label: 'Daily Life',       emoji: '🌍' },
  { label: 'Work & Business',  emoji: '💼' },
  { label: 'Travel',           emoji: '✈️' },
  { label: 'Movies & Series',  emoji: '🎬' },
  { label: 'Food & Cooking',   emoji: '🍕' },
  { label: 'Health & Fitness', emoji: '💪' },
  { label: 'Current Events',   emoji: '📰' },
  { label: 'Free Conversation', emoji: '🎯' },
]

export function TopicSelector() {
  const { topic, setTopic } = useSettingsStore()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
      {TOPICS.map(({ label, emoji }) => {
        const active = topic === label
        return (
          <button
            key={label}
            onClick={() => setTopic(label)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '9px',
              padding: '7px 9px',
              borderRadius: '6px',
              border: 'none',
              borderLeft: `2px solid ${active ? 'var(--color-accent)' : 'transparent'}`,
              background: active ? 'var(--color-accent-dim)' : 'transparent',
              color: active ? 'var(--color-text)' : 'var(--color-text2)',
              fontFamily: 'var(--font-display)',
              fontSize: '12px',
              fontWeight: active ? 600 : 400,
              textAlign: 'left',
              transition: 'all 0.12s ease',
              width: '100%',
            }}
          >
            <span style={{ fontSize: '13px', lineHeight: 1 }}>{emoji}</span>
            <span>{label}</span>
          </button>
        )
      })}
    </div>
  )
}
