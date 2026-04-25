'use client'
import { useEffect, useState } from 'react'
import type { Message } from '@/types'

interface Props {
  messages: Message[]
}

export function SessionStats({ messages }: Props) {
  const [elapsed, setElapsed] = useState(0)

  const messageCount   = messages.filter((m) => m.role === 'user').length
  const correctionCount = messages.reduce((n, m) => n + (m.corrections?.length ?? 0), 0)

  useEffect(() => {
    const id = setInterval(() => setElapsed((e) => e + 1), 1000)
    return () => clearInterval(id)
  }, [])

  const pad  = (n: number) => String(n).padStart(2, '0')
  const time = `${pad(Math.floor(elapsed / 60))}:${pad(elapsed % 60)}`

  const rows = [
    { label: 'Messages',    value: messageCount    },
    { label: 'Corrections', value: correctionCount },
    { label: 'Time',        value: time            },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
      {rows.map(({ label, value }) => (
        <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            color: 'var(--color-text3)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}>
            {label}
          </span>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '13px',
            color: 'var(--color-text2)',
          }}>
            {value}
          </span>
        </div>
      ))}
    </div>
  )
}
