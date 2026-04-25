import json
from typing import AsyncGenerator

import httpx

from app.domain.models import Message, ProviderConfig
from app.ports.llm_port import LLMPort


class AnthropicAdapter(LLMPort):
    async def chat_stream(
        self, messages: list[Message], config: ProviderConfig
    ) -> AsyncGenerator[str, None]:
        # Anthropic separates system prompt from conversation
        system = next(
            (m.content for m in messages if m.role == "system"), ""
        )
        conversation = [
            {"role": m.role, "content": m.content}
            for m in messages if m.role != "system"
        ]

        headers = {
            "x-api-key": config.api_key or "",
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
        }
        payload = {
            "model": config.model,
            "max_tokens": 1024,
            "system": system,
            "messages": conversation,
            "stream": True,
        }
        async with httpx.AsyncClient(timeout=120) as client:
            async with client.stream(
                "POST",
                "https://api.anthropic.com/v1/messages",
                json=payload,
                headers=headers,
            ) as resp:
                resp.raise_for_status()
                async for line in resp.aiter_lines():
                    if not line.startswith("data: "):
                        continue
                    try:
                        chunk = json.loads(line[6:])
                        if chunk.get("type") == "content_block_delta":
                            text = chunk.get("delta", {}).get("text") or ""
                            if text:
                                yield text
                    except json.JSONDecodeError:
                        continue
