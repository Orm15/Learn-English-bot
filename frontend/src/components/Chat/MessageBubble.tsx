import type { Message } from '@/types'
import { CorrectionBlock } from './CorrectionBlock'

export function MessageBubble({ message }: { message: Message }) {
  if (message.role === 'user') {
    return (
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '18px' }}>
        <div style={{
          maxWidth: '68%',
          padding: '11px 16px',
          borderRadius: '16px 16px 4px 16px',
          background: 'rgba(57 224 122 / 0.07)',
          border: '1px solid rgba(57 224 122 / 0.14)',
          color: 'var(--color-text)',
          fontFamily: 'var(--font-serif)',
          fontSize: '15px',
          lineHeight: 1.65,
        }}>
          {message.content}
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', gap: '11px', marginBottom: '18px', maxWidth: '82%' }}>
      {/* Avatar */}
      <div style={{
        width: '30px', height: '30px', borderRadius: '8px', flexShrink: 0,
        background: 'var(--color-accent-dim)',
        border: '1px solid rgba(57 224 122 / 0.22)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginTop: '2px',
      }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
          stroke="var(--color-accent)" strokeWidth="2.2" strokeLinecap="round">
          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
          <line x1="12" x2="12" y1="19" y2="22"/>
        </svg>
      </div>

      {/* Bubble + corrections */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          padding: '11px 16px',
          borderRadius: '4px 16px 16px 16px',
          background: 'var(--color-s2)',
          border: '1px solid var(--color-border)',
          color: 'var(--color-text)',
          fontFamily: 'var(--font-serif)',
          fontSize: '15px',
          lineHeight: 1.7,
        }}>
          {message.content}
        </div>
        {message.corrections && message.corrections.length > 0 && (
          <CorrectionBlock corrections={message.corrections} />
        )}
      </div>
    </div>
  )
}
