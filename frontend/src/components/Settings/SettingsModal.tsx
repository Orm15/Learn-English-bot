'use client'
import { useState, useEffect } from 'react'
import { ProviderSettings } from './ProviderSettings'
import { VoiceSettings } from './VoiceSettings'

type Tab = 'provider' | 'voice'

interface Props {
  onClose: () => void
}

export function SettingsModal({ onClose }: Props) {
  const [tab, setTab] = useState<Tab>('provider')

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const tabStyle = (t: Tab): React.CSSProperties => ({
    padding: '7px 16px', borderRadius: '6px', fontSize: '12px',
    fontFamily: 'var(--font-display)', fontWeight: tab === t ? 700 : 500,
    border: `1px solid ${tab === t ? 'var(--color-accent)' : 'transparent'}`,
    background: tab === t ? 'var(--color-accent-dim)' : 'transparent',
    color: tab === t ? 'var(--color-accent)' : 'var(--color-text3)',
    transition: 'all 0.15s ease',
  })

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0 0 0 / 0.65)',
        backdropFilter: 'blur(4px)',
        padding: '20px',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        width: '100%', maxWidth: '520px',
        background: 'var(--color-s1)',
        border: '1px solid var(--color-border)',
        borderRadius: '14px',
        overflow: 'hidden',
        animation: 'modal-in 0.2s ease',
      }}>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid var(--color-border)',
        }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 700, color: 'var(--color-text)', letterSpacing: '-0.02em' }}>
            Settings
          </span>
          <button
            onClick={onClose}
            style={{
              width: '26px', height: '26px', borderRadius: '6px',
              border: '1px solid var(--color-border)', background: 'transparent',
              color: 'var(--color-text3)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px', padding: '12px 20px', borderBottom: '1px solid var(--color-border)' }}>
          <button style={tabStyle('provider')} onClick={() => setTab('provider')}>Provider</button>
          <button style={tabStyle('voice')}    onClick={() => setTab('voice')}>Voice</button>
        </div>

        {/* Content */}
        <div style={{ padding: '22px 20px' }}>
          {tab === 'provider' ? <ProviderSettings /> : <VoiceSettings />}
        </div>

      </div>
    </div>
  )
}
