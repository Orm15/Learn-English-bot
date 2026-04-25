# SpeakUp — Conversational English Tutor

A self-hosted conversational English tutor with voice input, streaming AI responses, and automatic grammar corrections. Speak or type in English, and the tutor responds with natural conversation tailored to your CEFR level — while pointing out your mistakes.

![Dark UI with green accent](https://img.shields.io/badge/theme-dark-000?style=flat-square) ![Next.js 14](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js) ![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=flat-square&logo=fastapi) ![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker)

## Features

- **Voice input** — speak into your microphone; faster-whisper transcribes it in real time
- **Streaming responses** — tutor replies token by token via SSE, no waiting for the full response
- **Grammar corrections** — every reply includes an amber card listing your mistakes, what's right, and why
- **TTS playback** — Kokoro synthesizes the tutor's reply and plays it back automatically
- **CEFR levels** — A1 through C2; vocabulary and complexity adapt to your level
- **8 conversation topics** — Daily Life, Travel, Food, Work, Movies, Health, Current Events, Free Conversation
- **Multi-provider LLM** — switch between Ollama (local), OpenAI, Anthropic, or any OpenAI-compatible API from the settings panel
- **Fully self-hosted** — runs entirely on your machine with Docker Compose; no data leaves your network when using Ollama

## Architecture

```
Browser
  │
  ├── GET  :3000        Next.js 14 frontend (Bun build)
  │
  └── POST :8000        FastAPI backend (hexagonal architecture)
        ├── /chat             → streams tokens from LLM
        ├── /chat/test        → connectivity check for configured provider
        ├── /voice/transcribe → proxy → voice:8001 (faster-whisper)
        └── /voice/synthesize → proxy → voice:8001 (Kokoro TTS)

Host machine
  └── Ollama :11434     runs natively (GPU access)
```

The frontend **never** talks directly to the voice service or Ollama — everything is proxied through the backend. API keys are never exposed to the browser.

## Stack

| Layer    | Technology |
|----------|-----------|
| Frontend | Next.js 14 App Router · TypeScript · Zustand · Web Audio API |
| Backend  | Python 3.12 · FastAPI · httpx · Pydantic v2 (hexagonal architecture) |
| Voice    | faster-whisper `base.en` · Kokoro TTS `af_heart` |
| LLM      | Ollama / OpenAI / Anthropic / Custom (OpenAI-compatible) |
| Runtime  | Docker Compose · Bun (frontend build) |

## Requirements

- Docker & Docker Compose
- [Ollama](https://ollama.com) installed and running on the host (for local inference)
- A GPU is recommended for Ollama; CPU works but is slower

Recommended model: `qwen2.5:7b` (~5 GB VRAM, text-only, fast)

## Quick Start

```bash
# 1. Clone the repo
git clone <repo-url>
cd speakup

# 2. Copy environment file
cp .env.example .env

# 3. Pull the default model (runs natively, not in Docker)
OLLAMA_ORIGINS=* ollama serve   # if not already running as a service
ollama pull qwen2.5:7b

# 4. Build and start all services
docker compose up --build
```

Open **http://localhost:3000** in your browser.

> First build takes a few minutes — the voice service downloads the Whisper model (~74 MB) during the build step.

## Environment Variables

| Variable          | Default                           | Description |
|-------------------|-----------------------------------|-------------|
| `OLLAMA_BASE_URL` | `http://host.docker.internal:11434` | Ollama endpoint reachable from the backend container |
| `BACKEND_URL`     | `http://backend:8000`             | Backend URL used internally by the frontend server |
| `VOICE_URL`       | `http://voice:8001`               | Voice service URL used by the backend |
| `DEFAULT_MODEL`   | `qwen2.5:7b`                      | Default Ollama model |

For external LLM providers (OpenAI, Anthropic), configure the API key in the Settings panel — it is sent per-request from the browser to the backend and never stored server-side.

## Settings Panel

Click the **⚙** gear icon in the top-right corner to:

- Switch LLM provider and model
- Set the Ollama base URL or a custom endpoint
- Enter API keys for OpenAI / Anthropic
- Test the connection (sends a single token request to verify the provider responds)
- Toggle TTS auto-play on/off
- Adjust speech playback speed (0.5× – 2.0×)

Settings are persisted in `localStorage` (`speakup-settings`).

## Project Structure

```
speakup/
├── docker-compose.yml
├── .env.example
├── frontend/               # Next.js 14 + TypeScript
│   └── src/
│       ├── app/            # layout, page, globals.css
│       ├── components/
│       │   ├── Chat/       # MessageBubble, CorrectionBlock, TypingIndicator, VoiceVisualizer
│       │   ├── Sidebar/    # LevelSelector, TopicSelector, SessionStats
│       │   └── Settings/   # SettingsModal, ProviderSettings, VoiceSettings
│       ├── hooks/          # useChat (SSE streaming), useVoice (MediaRecorder)
│       ├── lib/store/      # chatStore, settingsStore (Zustand)
│       └── types/
├── backend/                # FastAPI — hexagonal architecture
│   └── app/
│       ├── domain/         # pure models (Message, Correction, ProviderConfig)
│       ├── ports/          # abstract interfaces (LLMPort, VoicePort)
│       ├── adapters/
│       │   ├── llm/        # ollama, openai, anthropic, custom
│       │   └── voice/      # HTTP proxy to voice service
│       ├── services/       # correction_parser
│       └── api/routers/    # health, chat, voice_proxy
└── voice/                  # FastAPI — Whisper STT + Kokoro TTS
    └── app/
        ├── routers/        # transcribe, synthesize
        └── services/       # WhisperService, KokoroService (singleton lifespan)
```

## How Corrections Work

After each user message the LLM appends a structured block:

```
---CORRECTIONS---
❌ Wrong: "I go to store"
✅ Right: "I went to the store"
💡 Why: Use simple past for completed actions; add the article 'the'.
---END---
```

The backend parses this block, strips it from the streamed text, and emits it as a final SSE event. The frontend renders it as an amber card beneath the tutor's reply. The TTS engine never synthesizes the corrections block.

## Supported LLM Providers

| Provider  | Auth         | Default model |
|-----------|--------------|---------------|
| Ollama    | none         | `qwen2.5:7b`  |
| OpenAI    | API key      | `gpt-4o-mini` |
| Anthropic | API key      | `claude-haiku-4-5-20251001` |
| Custom    | optional key | configurable  |

## Health Checks

```bash
curl http://localhost:8000/health   # backend
curl http://localhost:8001/health   # voice service
```

## License

MIT
