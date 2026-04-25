from abc import ABC, abstractmethod


class VoicePort(ABC):
    @abstractmethod
    async def transcribe(self, audio_bytes: bytes) -> str:
        ...

    @abstractmethod
    async def synthesize(self, text: str) -> bytes:
        ...
