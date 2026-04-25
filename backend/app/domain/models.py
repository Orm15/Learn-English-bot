from enum import Enum
from typing import Literal, Optional

from pydantic import BaseModel


class CEFRLevel(str, Enum):
    A1 = "A1"
    A2 = "A2"
    B1 = "B1"
    B2 = "B2"
    C1 = "C1"
    C2 = "C2"


class LLMProvider(str, Enum):
    OLLAMA = "ollama"
    OPENAI = "openai"
    ANTHROPIC = "anthropic"
    CUSTOM = "custom"


class ProviderConfig(BaseModel):
    provider: LLMProvider
    base_url: str
    model: str
    api_key: Optional[str] = None


class Message(BaseModel):
    role: Literal["user", "assistant", "system"]
    content: str


class Correction(BaseModel):
    wrong: str
    right: str
    why: str


class ChatRequest(BaseModel):
    messages: list[Message]
    provider_config: ProviderConfig
    level: CEFRLevel
    topic: str
