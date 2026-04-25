'use client'
import { useSettingsStore } from '@/lib/store/settingsStore'
import type { CEFRLevel } from '@/types'

const LEVELS: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

export function LevelSelector() {
  const { level, setLevel } = useSettingsStore()

  return (
    <div style={{ display: 'flex', gap: '5px' }}>
      {LEVELS.map((l) => {
        const active = level === l
        return (
          <button
            key={l}
            onClick={() => setLevel(l)}
            style={{
              flex: 1,
              padding: '6px 0',
              borderRadius: '6px',
              border: `1px solid ${active ? 'var(--color-accent)' : 'var(--color-border)'}`,
              background: active ? 'var(--color-accent-dim)' : 'transparent',
              color: active ? 'var(--color-accent)' : 'var(--color-text3)',
              fontFamily: 'var(--font-display)',
              fontWeight: active ? 700 : 500,
              fontSize: '11px',
              letterSpacing: '0.02em',
              transition: 'all 0.15s ease',
            }}
          >
            {l}
          </button>
        )
      })}
    </div>
  )
}
