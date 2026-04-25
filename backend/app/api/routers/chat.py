import asyncio
import json
from typing import AsyncGenerator

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from app.adapters.llm import get_llm_adapter
from app.adapters.llm.ollama import OllamaAdapter
from app.domain.models import ChatRequest, Correction, Message, ProviderConfig
from app.services.correction_parser import parse_corrections

router = APIRouter(tags=["chat"])

# Used for Ollama structured output — no ---CORRECTIONS--- block needed
_PROMPT_STRUCTURED = """\
You are a strict English language coach. Your PRIMARY job is to correct the student — conversation is secondary.

Student's CEFR level: {level}
Current topic: {topic}

RULES:
1. Keep your reply brief (2-3 sentences max).
2. Correct EVERYTHING wrong: grammar, verb tenses, articles, prepositions, word choice, sentence structure, and poorly constructed ideas.
3. Do NOT ignore small errors. Every error must appear in corrections.
4. Do NOT soften corrections. Be direct and precise.
5. Adapt vocabulary in your reply to the CEFR level, but never lower your correction standards.

Fill the response fields:
- reply: your brief conversational response only — no corrections here
- corrections: list every error found. If no errors, return an empty array [].\
"""

# Used for non-Ollama providers (text-based streaming)
_PROMPT_TEXT = """\
You are a strict English language coach. Your PRIMARY job is to correct the student — conversation is secondary.

Student's CEFR level: {level}
Current topic: {topic}

RULES:
1. Reply briefly (2-3 sentences max) to keep the conversation going.
2. Then ALWAYS add the corrections block below — no exceptions.
3. Correct EVERYTHING you find wrong: grammar, verb tenses, articles, prepositions, word choice, sentence structure, and unclear or poorly constructed ideas.
4. Do NOT ignore small errors because the message is "understandable". Every error must be listed.
5. Do NOT soften corrections. Be direct and precise.
6. If the student's idea is unclear or poorly expressed even if grammatically correct, point it out.
7. Adapt vocabulary in your reply to the CEFR level, but never lower your correction standards.

At the END of every response, add this exact block:

---CORRECTIONS---
[If truly no errors: ✓ No errors this time!]
[For each error found:]
❌ Wrong: "[exact phrase from student]"
✅ Right: "[correct version]"
💡 Why: [precise explanation, 1 sentence]
---END---\
"""


@router.post("/chat")
async def chat(request: ChatRequest) -> StreamingResponse:
    adapter = get_llm_adapter(request.provider_config)
    use_structured = isinstance(adapter, OllamaAdapter)

    prompt = _PROMPT_STRUCTURED if use_structured else _PROMPT_TEXT
    system_content = prompt.format(
        level=request.level.value,
        topic=request.topic,
    )
    messages = [
        Message(role="system", content=system_content),
        *request.messages,
    ]

    async def event_stream() -> AsyncGenerator[str, None]:
        if use_structured:
            try:
                result = await adapter.chat_structured(messages, request.provider_config)  # type: ignore[attr-defined]
            except Exception as exc:
                yield f"data: {json.dumps({'type': 'error', 'message': str(exc)})}\n\n"
                return

            reply = result.get("reply", "")
            raw = result.get("corrections", [])
            corrections = [
                Correction(**c)
                for c in raw
                if isinstance(c, dict) and all(k in c for k in ("wrong", "right", "why"))
            ]

            # Fake-stream reply word by word for natural feel
            words = reply.split(" ")
            for i, word in enumerate(words):
                token = word + (" " if i < len(words) - 1 else "")
                yield f"data: {json.dumps({'type': 'token', 'text': token})}\n\n"
                await asyncio.sleep(0.018)

        else:
            full_response = ""
            try:
                async for token in adapter.chat_stream(messages, request.provider_config):
                    full_response += token
                    yield f"data: {json.dumps({'type': 'token', 'text': token})}\n\n"
            except Exception as exc:
                yield f"data: {json.dumps({'type': 'error', 'message': str(exc)})}\n\n"
                return

            _, corrections = parse_corrections(full_response)

        yield f"data: {json.dumps({'type': 'corrections', 'data': [c.model_dump() for c in corrections]})}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")


@router.post("/chat/test")
async def test_provider(config: ProviderConfig) -> dict:
    """Quick connectivity check — gets one token from the provider."""
    adapter = get_llm_adapter(config)
    try:
        async with asyncio.timeout(10):
            async for _ in adapter.chat_stream(
                [Message(role="user", content="Reply with one word: ok")],
                config,
            ):
                return {"ok": True}
        return {"ok": True}
    except Exception as exc:
        raise HTTPException(status_code=503, detail=str(exc))
