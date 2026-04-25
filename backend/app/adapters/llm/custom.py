import json
from typing import AsyncGenerator

import httpx

from app.domain.models import Message, ProviderConfig
from app.ports.llm_port import LLMPort


class CustomAdapter(LLMPort):
    async def chat_stream(
        self, messages: list[Message], config: ProviderConfig
    ) -> AsyncGenerator[str, None]:
        url = f"{config.base_url.rstrip('/')}/v1/chat/completions"
        headers: dict[str, str] = {}
        if config.api_key:
            headers["Authorization"] = f"Bearer {config.api_key}"

        payload = {
            "model": config.model,
            "messages": [{"role": m.role, "content": m.content} for m in messages],
            "stream": True,
        }
        async with httpx.AsyncClient(timeout=120) as client:
            async with client.stream("POST", url, json=payload, headers=headers) as resp:
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
