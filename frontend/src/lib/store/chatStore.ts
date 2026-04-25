'use client'
import { create } from 'zustand'
import type { Message } from '@/types'

interface ChatStore {
  messages: Message[]
  isRecording: boolean
  isLoading: boolean
  currentTranscript: string
  addMessage: (msg: Message) => void
  updateLastMessage: (content: string) => void
  patchLastMessage: (patch: Partial<Message>) => void
  setRecording: (v: boolean) => void
  setLoading: (v: boolean) => void
  setTranscript: (v: string) => void
  clearChat: () => void
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  isRecording: false,
  isLoading: false,
  currentTranscript: '',
  addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
  updateLastMessage: (content) =>
    set((s) => {
      const msgs = [...s.messages]
      if (msgs.length) msgs[msgs.length - 1] = { ...msgs[msgs.length - 1], content }
      return { messages: msgs }
    }),
  patchLastMessage: (patch) =>
    set((s) => {
      const msgs = [...s.messages]
      if (msgs.length) msgs[msgs.length - 1] = { ...msgs[msgs.length - 1], ...patch }
      return { messages: msgs }
    }),
  setRecording: (v) => set({ isRecording: v }),
  setLoading: (v) => set({ isLoading: v }),
  setTranscript: (v) => set({ currentTranscript: v }),
  clearChat: () => set({ messages: [] }),
}))
