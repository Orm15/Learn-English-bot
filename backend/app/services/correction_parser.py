import re

from app.domain.models import Correction

_BLOCK_RE = re.compile(r"-{2,}\s*CORRECTIONS\s*-{2,}\s*(.*?)\s*-{2,}\s*END\s*-{2,}", re.DOTALL | re.IGNORECASE)
_ITEM_RE = re.compile(
    r'❌ Wrong: "(?P<wrong>.+?)"\s+'
    r'✅ Right: "(?P<right>.+?)"\s+'
    r'💡 Why: (?P<why>.+?)(?=❌|\Z)',
    re.DOTALL,
)


def parse_corrections(text: str) -> tuple[str, list[Correction]]:
    match = _BLOCK_RE.search(text)
    if not match:
        return text.strip(), []

    clean = text[: match.start()].strip()
    block = match.group(1)

    corrections = [
        Correction(
            wrong=m["wrong"].strip(),
            right=m["right"].strip(),
            why=m["why"].strip(),
        )
        for m in _ITEM_RE.finditer(block)
    ]
    return clean, corrections
