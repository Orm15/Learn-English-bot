export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'

export type LLMProvider = 'ollama' | 'openai' | 'anthropic' | 'custom'

export interface ProviderConfig {
  provider: LLMProvider
  base_url: string
  model: string
  api_key?: string
}

export interface Correction {
  wrong: string
  right: string
  why: string
}

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  corrections?: Correction[]
  timestamp: number
}

export type Topic =
  | 'Daily Life'
  | 'Work & Business'
  | 'Travel'
  | 'Movies & Series'
  | 'Food & Cooking'
  | 'Health & Fitness'
  | 'Current Events'
  | 'Free Conversation'
