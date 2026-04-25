from app.domain.models import LLMProvider, ProviderConfig
from app.ports.llm_port import LLMPort


def get_llm_adapter(config: ProviderConfig) -> LLMPort:
    match config.provider:
        case LLMProvider.OLLAMA:
            from app.adapters.llm.ollama import OllamaAdapter
            return OllamaAdapter()
        case LLMProvider.OPENAI:
            from app.adapters.llm.openai import OpenAIAdapter
            return OpenAIAdapter()
        case LLMProvider.ANTHROPIC:
            from app.adapters.llm.anthropic import AnthropicAdapter
            return AnthropicAdapter()
        case _:
            from app.adapters.llm.custom import CustomAdapter
            return CustomAdapter()
