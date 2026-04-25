from fastapi import APIRouter, Request, UploadFile, File
from fastapi.responses import JSONResponse

router = APIRouter(tags=["voice"])


@router.post("/transcribe")
async def transcribe(request: Request, audio: UploadFile = File(...)) -> dict:
    audio_bytes = await audio.read()
    text = request.app.state.whisper.transcribe(audio_bytes)
    return {"text": text}
