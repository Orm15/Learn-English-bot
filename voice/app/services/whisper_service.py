import os
import tempfile

from faster_whisper import WhisperModel


class WhisperService:
    def __init__(self) -> None:
        self.model = WhisperModel("base.en", device="cpu", compute_type="int8")

    def transcribe(self, audio_bytes: bytes) -> str:
        # Write to temp file so ffmpeg can decode any browser format (WebM/OGG/Opus)
        with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as f:
            f.write(audio_bytes)
            tmp = f.name
        try:
            segments, _ = self.model.transcribe(tmp, beam_size=5)
            return " ".join(s.text for s in segments).strip()
        finally:
            os.unlink(tmp)
