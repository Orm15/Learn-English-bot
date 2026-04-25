import io

import httpx
from fastapi import APIRouter, UploadFile, File
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from app.config import settings

router = APIRouter(prefix="/voice", tags=["voice-proxy"])


class SynthesizeRequest(BaseModel):
    text: str


@router.post("/transcribe")
async def transcribe_proxy(audio: UploadFile = File(...)) -> dict:
    audio_bytes = await audio.read()
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(
            f"{settings.voice_url}/transcribe",
            files={
                "audio": (
                    audio.filename or "audio.webm",
                    audio_bytes,
                    audio.content_type or "audio/webm",
                )
            },
        )
        resp.raise_for_status()
        return resp.json()


@router.post("/synthesize")
async def synthesize_proxy(body: SynthesizeRequest) -> StreamingResponse:
    async with httpx.AsyncClient(timeout=60) as client:
        resp = await client.post(
            f"{settings.voice_url}/synthesize",
            json=body.model_dump(),
        )
        resp.raise_for_status()
        return StreamingResponse(io.BytesIO(resp.content), media_type="audio/wav")
