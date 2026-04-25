import io

from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

router = APIRouter(tags=["voice"])


class SynthesizeRequest(BaseModel):
    text: str


@router.post("/synthesize")
async def synthesize(request: Request, body: SynthesizeRequest) -> StreamingResponse:
    audio_bytes = request.app.state.kokoro.synthesize(body.text)
    return StreamingResponse(io.BytesIO(audio_bytes), media_type="audio/wav")
