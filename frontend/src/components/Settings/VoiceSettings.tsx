'use client'
import { useSettingsStore } from '@/lib/store/settingsStore'

export function VoiceSettings() {
  const { autoPlay, ttsSpeed, setAutoPlay, setTtsSpeed } = useSettingsStore()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>

      {/* Auto-play */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '13px', color: 'var(--color-text)', fontWeight: 600, margin: 0 }}>
            Auto-play responses
          </p>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-text3)', margin: '3px 0 0', letterSpacing: '0.02em' }}>
            Speak tutor replies aloud after each message
          </p>
        </div>
        <button
          onClick={() => setAutoPlay(!autoPlay)}
          style={{
            width: '44px', height: '24px', borderRadius: '12px', flexShrink: 0,
            border: 'none', position: 'relative', cursor: 'pointer',
            background: autoPlay ? 'var(--color-accent)' : 'var(--color-s3)',
            transition: 'background 0.2s ease',
          }}
        >
          <span style={{
            position: 'absolute', top: '3px',
            left: autoPlay ? '23px' : '3px',
            width: '18px', height: '18px', borderRadius: '50%',
            background: autoPlay ? '#080808' : 'var(--color-text3)',
            transition: 'left 0.2s ease',
            display: 'block',
          }} />
        </button>
      </div>

      {/* Speed */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '13px', color: 'var(--color-text)', fontWeight: 600 }}>
            Speech speed
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--color-accent)' }}>
            {ttsSpeed.toFixed(1)}×
          </span>
        </div>
        <input
          type="range"
          min={0.5} max={2.0} step={0.1}
          value={ttsSpeed}
          onChange={(e) => setTtsSpeed(parseFloat(e.target.value))}
          style={{ width: '100%', accentColor: 'var(--color-accent)', cursor: 'pointer' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-text3)' }}>0.5×</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-text3)' }}>2.0×</span>
        </div>
      </div>

    </div>
  )
}
