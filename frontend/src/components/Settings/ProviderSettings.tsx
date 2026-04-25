'use client'
import { useState } from 'react'
import { useSettingsStore } from '@/lib/store/settingsStore'
import type { LLMProvider } from '@/types'

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8000'

const PROVIDERS: { id: LLMProvider; label: string }[] = [
  { id: 'ollama',    label: 'Ollama'    },
  { id: 'openai',    label: 'OpenAI'    },
  { id: 'anthropic', label: 'Anthropic' },
  { id: 'custom',    label: 'Custom'    },
]

const DEFAULTS: Record<LLMProvider, { base_url: string; model: string }> = {
  ollama:    { base_url: 'http://localhost:11434', model: 'qwen2.5:7b'              },
  openai:    { base_url: 'https://api.openai.com/v1', model: 'gpt-4o-mini'         },
  anthropic: { base_url: 'https://api.anthropic.com', model: 'claude-haiku-4-5-20251001' },
  custom:    { base_url: 'http://localhost:8080', model: 'my-model'                 },
}

type TestStatus = 'idle' | 'testing' | 'ok' | 'error'

export function ProviderSettings() {
  const { providerConfig, setProviderConfig } = useSettingsStore()
  const [status, setStatus] = useState<TestStatus>('idle')

  const provider = providerConfig.provider
  const needsKey = provider === 'openai' || provider === 'anthropic' || provider === 'custom'
  const showUrl  = provider === 'ollama' || provider === 'custom'

  const switchProvider = (p: LLMProvider) => {
    setProviderConfig({ provider: p, ...DEFAULTS[p], api_key: '' })
  }

  const test = async () => {
    setStatus('testing')
    try {
      const res = await fetch(`${BACKEND}/chat/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(providerConfig),
      })
      setStatus(res.ok ? 'ok' : 'error')
    } catch {
      setStatus('error')
    }
    setTimeout(() => setStatus('idle'), 3500)
  }

  const field = (label: string, value: string, onChange: (v: string) => void, opts?: { type?: string; placeholder?: string }) => (
    <label style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-text3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        {label}
      </span>
      <input
        type={opts?.type ?? 'text'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={opts?.placeholder}
        style={{
          background: 'var(--color-s0)', border: '1px solid var(--color-border)',
          borderRadius: '7px', padding: '8px 11px',
          color: 'var(--color-text)', fontFamily: 'var(--font-mono)', fontSize: '12px',
          outline: 'none', transition: 'border-color 0.15s',
        }}
        onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(57 224 122 / 0.4)')}
        onBlur={(e)  => (e.currentTarget.style.borderColor = 'var(--color-border)')}
      />
    </label>
  )

  const testLabel = status === 'testing' ? 'Testing…'
    : status === 'ok'      ? '✓ Connected'
    : status === 'error'   ? '✗ Unreachable'
    : 'Test connection'

  const testColor = status === 'ok' ? 'var(--color-accent)'
    : status === 'error'   ? 'var(--color-wrong)'
    : 'var(--color-text3)'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

      {/* Provider tabs */}
      <div>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-text3)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '8px' }}>
          Provider
        </span>
        <div style={{ display: 'flex', gap: '5px' }}>
          {PROVIDERS.map(({ id, label }) => {
            const active = provider === id
            return (
              <button
                key={id}
                onClick={() => switchProvider(id)}
                style={{
                  flex: 1, padding: '7px 4px', borderRadius: '7px', fontSize: '11px',
                  fontFamily: 'var(--font-display)', fontWeight: active ? 700 : 500,
                  border: `1px solid ${active ? 'var(--color-accent)' : 'var(--color-border)'}`,
                  background: active ? 'var(--color-accent-dim)' : 'transparent',
                  color: active ? 'var(--color-accent)' : 'var(--color-text3)',
                  transition: 'all 0.15s ease',
                }}
              >
                {label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Fields */}
      {showUrl && field('Base URL', providerConfig.base_url, (v) => setProviderConfig({ base_url: v }), { placeholder: 'http://localhost:11434' })}
      {field('Model', providerConfig.model, (v) => setProviderConfig({ model: v }), { placeholder: 'model name' })}
      {needsKey && field('API Key', providerConfig.api_key ?? '', (v) => setProviderConfig({ api_key: v }), { type: 'password', placeholder: '••••••••••••' })}

      {/* Test */}
      <button
        onClick={test}
        disabled={status === 'testing'}
        style={{
          alignSelf: 'flex-start', padding: '7px 16px', borderRadius: '7px',
          border: '1px solid var(--color-border)', background: 'transparent',
          fontFamily: 'var(--font-mono)', fontSize: '11px', color: testColor,
          letterSpacing: '0.03em', transition: 'color 0.2s ease',
        }}
      >
        {testLabel}
      </button>
    </div>
  )
}
