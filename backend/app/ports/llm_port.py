from abc import ABC, abstractmethod
from typing import AsyncGenerator

from app.domain.models import Message, ProviderConfig


class LLMPort(ABC):
    @abstractmethod
    async def chat_stream(
        self, messages: list[Message], config: ProviderConfig
    ) -> AsyncGenerator[str, None]:
        ...
