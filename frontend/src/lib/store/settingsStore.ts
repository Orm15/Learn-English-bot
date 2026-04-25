'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CEFRLevel, LLMProvider, ProviderConfig, Topic } from '@/types'

interface SettingsStore {
  level: CEFRLevel
  topic: Topic
  provider: LLMProvider
  providerConfig: ProviderConfig
  autoPlay: boolean
  ttsSpeed: number
  setLevel: (l: CEFRLevel) => void
  setTopic: (t: Topic) => void
  setProviderConfig: (c: Partial<ProviderConfig>) => void
  setAutoPlay: (v: boolean) => void
  setTtsSpeed: (v: number) => void
}

const DEFAULT_CONFIG: ProviderConfig = {
  provider: 'ollama',
  base_url: 'http://localhost:11434',
  model: 'qwen2.5:7b',
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      level: 'B1',
      topic: 'Daily Life',
      provider: 'ollama',
      providerConfig: DEFAULT_CONFIG,
      autoPlay: true,
      ttsSpeed: 1.0,
      setLevel: (level) => set({ level }),
      setTopic: (topic) => set({ topic }),
      setProviderConfig: (c) =>
        set((s) => ({ providerConfig: { ...s.providerConfig, ...c } })),
      setAutoPlay: (autoPlay) => set({ autoPlay }),
      setTtsSpeed: (ttsSpeed) => set({ ttsSpeed }),
    }),
    { name: 'speakup-settings' }
  )
)
