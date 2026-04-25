import json
from typing import AsyncGenerator

import httpx

from app.domain.models import Message, ProviderConfig
from app.ports.llm_port import LLMPort

_STRUCTURED_SCHEMA = {
    "type": "object",
    "properties": {
        "reply": {"type": "string"},
        "corrections": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "wrong": {"type": "string"},
                    "right": {"type": "string"},
                    "why":   {"type": "string"},
                },
                "required": ["wrong", "right", "why"],
            },
        },
    },
    "required": ["reply", "corrections"],
}


class OllamaAdapter(LLMPort):
    async def chat_stream(
        self, messages: list[Message], config: ProviderConfig
    ) -> AsyncGenerator[str, None]:
        url = f"{config.base_url.rstrip('/')}/v1/chat/completions"
        payload = {
            "model": config.model,
            "messages": [{"role": m.role, "content": m.content} for m in messages],
            "stream": True,
        }
        async with httpx.AsyncClient(timeout=120) as client:
            async with client.stream("POST", url, json=payload) as resp:
                resp.raise_for_status()
                async for line in resp.aiter_lines():
                    if not line.startswith("data: "):
                        continue
                    data = line[6:]
                    if data == "[DONE]":
                        return
                    try:
                        chunk = json.loads(data)
                        delta = chunk["choices"][0]["delta"].get("content") or ""
                        if delta:
                            yield delta
                    except (json.JSONDecodeError, KeyError, IndexError):
                        continue

    async def chat_structured(
        self, messages: list[Message], config: ProviderConfig
    ) -> dict:
        """Non-streaming request using Ollama native JSON Schema format."""
        url = f"{config.base_url.rstrip('/')}/api/chat"
        payload = {
            "model": config.model,
            "messages": [{"role": m.role, "content": m.content} for m in messages],
            "format": _STRUCTURED_SCHEMA,
            "stream": False,
        }
        async with httpx.AsyncClient(timeout=120) as client:
            resp = await client.post(url, json=payload)
            resp.raise_for_status()
            content = resp.json()["message"]["content"]
            return json.loads(content)
