const BARS = [0.35, 0.65, 1, 0.75, 0.5, 0.85, 0.45]

export function VoiceVisualizer({ active }: { active: boolean }) {
  if (!active) return null

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '3px',
      height: '22px', paddingLeft: '2px',
    }}>
      {BARS.map((_, i) => (
        <span
          key={i}
          style={{
            display: 'block',
            width: '3px',
            height: '100%',
            borderRadius: '2px',
            background: 'var(--color-accent)',
            transformOrigin: 'center',
            animation: `bar-pulse 0.75s ease-in-out ${i * 75}ms infinite`,
          }}
        />
      ))}
    </div>
  )
}
