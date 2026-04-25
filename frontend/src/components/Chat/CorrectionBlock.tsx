import type { Correction } from '@/types'

interface Props {
  corrections: Correction[]
}

export function CorrectionBlock({ corrections }: Props) {
  return (
    <div style={{
      borderRadius: '8px',
      border: '1px solid rgba(217 119 6 / 0.22)',
      background: 'var(--color-amber-dim)',
      overflow: 'hidden',
      marginTop: '8px',
    }}>
      {/* Header */}
      <div style={{
        padding: '7px 13px',
        borderBottom: '1px solid rgba(217 119 6 / 0.12)',
        display: 'flex',
        alignItems: 'center',
        gap: '7px',
      }}>
        <div style={{
          width: '5px', height: '5px', borderRadius: '50%',
          background: 'var(--color-amber)',
        }} />
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '10px',
          color: 'var(--color-amber)',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          fontWeight: 600,
        }}>
          {corrections.length} correction{corrections.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Items */}
      <div>
        {corrections.map((c, i) => (
          <div
            key={i}
            style={{
              padding: '10px 13px',
              borderBottom:
                i < corrections.length - 1
                  ? '1px solid rgba(255 255 255 / 0.04)'
                  : 'none',
              display: 'flex',
              flexDirection: 'column',
              gap: '5px',
            }}
          >
            <Row icon="❌">
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                color: 'var(--color-wrong)',
                textDecoration: 'line-through',
                opacity: 0.8,
              }}>
                &quot;{c.wrong}&quot;
              </span>
            </Row>
            <Row icon="✅">
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                color: 'var(--color-accent)',
                fontWeight: 600,
              }}>
                &quot;{c.right}&quot;
              </span>
            </Row>
            <Row icon="💡">
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                color: 'var(--color-text2)',
                lineHeight: 1.5,
              }}>
                {c.why}
              </span>
            </Row>
          </div>
        ))}
      </div>
    </div>
  )
}

function Row({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: '7px' }}>
      <span style={{ fontSize: '11px', lineHeight: 1, flexShrink: 0 }}>{icon}</span>
      {children}
    </div>
  )
}
