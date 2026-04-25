import httpx

from app.config import settings
from app.ports.voice_port import VoicePort


class VoiceProxyAdapter(VoicePort):
    async def transcribe(self, audio_bytes: bytes) -> str:
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(
                f"{settings.voice_url}/transcribe",
                files={"audio": ("audio.webm", audio_bytes, "audio/webm")},
            )
            resp.raise_for_status()
            return resp.json()["text"]

    async def synthesize(self, text: str) -> bytes:
        async with httpx.AsyncClient(timeout=60) as client:
            resp = await client.post(
                f"{settings.voice_url}/synthesize",
                json={"text": text},
            )
            resp.raise_for_status()
            return resp.content
