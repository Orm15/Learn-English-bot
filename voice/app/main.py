from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import health, transcribe, synthesize
from app.services.whisper_service import WhisperService
from app.services.kokoro_service import KokoroService


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.whisper = WhisperService()
    app.state.kokoro = KokoroService()
    yield


app = FastAPI(title="SpeakUp Voice Service", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(transcribe.router)
app.include_router(synthesize.router)
