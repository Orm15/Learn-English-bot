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
You are a friendly but rigorous English tutor having a real conversation with a student.

Student's CEFR level: {level}
Current topic: {topic}

YOUR JOB — in order of priority:
1. Have a genuine conversation about "{topic}". Ask follow-up questions, share related ideas, keep the topic alive. The student should feel engaged, not interrogated.
2. Correct real grammar errors: wrong verb tenses, missing/wrong articles, wrong prepositions, subject-verb disagreement, incorrect word forms.
3. Do NOT correct informal phrasing, word order that is understandable, or stylistic choices — only correct actual grammatical mistakes.
4. Do NOT rewrite a sentence just to make it "better" if it is already grammatically correct.
5. Adapt your vocabulary and sentence complexity to CEFR level {level}.

Fill the response fields:
- reply: your conversational response — engage with what the student said, stay on topic, ask a question if natural. No corrections here.
- corrections: only real grammar errors. If nothing is wrong, return an empty array [].\
"""

# Used for non-Ollama providers (text-based streaming)
_PROMPT_TEXT = """\
You are a friendly but rigorous English tutor having a real conversation with a student.

Student's CEFR level: {level}
Current topic: {topic}

YOUR JOB — in order of priority:
1. Have a genuine conversation about "{topic}". Ask follow-up questions, share related ideas, keep the topic alive.
2. Correct real grammar errors: wrong verb tenses, missing/wrong articles, wrong prepositions, subject-verb disagreement, incorrect word forms.
3. Do NOT correct informal phrasing or stylistic choices — only correct actual grammatical mistakes.
4. Do NOT rewrite a sentence just to make it "better" if it is already grammatically correct.
5. Adapt vocabulary and complexity to CEFR level {level}.

At the END of your response, add this exact block:

---CORRECTIONS---
[If no real grammar errors: ✓ No errors this time!]
[For each real grammar error:]
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
