import io
import re

import numpy as np
import soundfile as sf
from kokoro import KPipeline

_CORRECTIONS_RE = re.compile(r"---CORRECTIONS---.*?---END---", re.DOTALL)
SAMPLE_RATE = 24000


class KokoroService:
    def __init__(self) -> None:
        self.pipeline = KPipeline(lang_code="a")

    def synthesize(self, text: str) -> bytes:
        clean = _CORRECTIONS_RE.sub("", text).strip()
        if not clean:
            return b""

        chunks: list[np.ndarray] = []
        for _, _, audio in self.pipeline(clean, voice="af_heart", speed=1.0):
            chunks.append(audio)

        if not chunks:
            return b""

        buf = io.BytesIO()
        sf.write(buf, np.concatenate(chunks), SAMPLE_RATE, format="WAV")
        return buf.getvalue()
