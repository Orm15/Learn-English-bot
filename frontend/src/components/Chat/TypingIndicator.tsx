export function TypingIndicator() {
  return (
    <div style={{ display: 'flex', gap: '11px', marginBottom: '18px' }}>
      {/* Avatar */}
      <div style={{
        width: '30px', height: '30px', borderRadius: '8px', flexShrink: 0,
        background: 'var(--color-accent-dim)',
        border: '1px solid rgba(57 224 122 / 0.22)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
          stroke="var(--color-accent)" strokeWidth="2.2" strokeLinecap="round">
          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
          <line x1="12" x2="12" y1="19" y2="22"/>
        </svg>
      </div>

      {/* Dots */}
      <div style={{
        padding: '13px 16px',
        borderRadius: '4px 16px 16px 16px',
        background: 'var(--color-s2)',
        border: '1px solid var(--color-border)',
        display: 'flex', alignItems: 'center', gap: '5px',
      }}>
        {([0, 160, 320] as number[]).map((delay) => (
          <span
            key={delay}
            style={{
              display: 'block',
              width: '6px', height: '6px', borderRadius: '50%',
              background: 'var(--color-text3)',
              animation: `typing-bounce 1.3s ease-in-out ${delay}ms infinite`,
            }}
          />
        ))}
      </div>
    </div>
  )
}
