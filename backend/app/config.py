from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    ollama_base_url: str = "http://host.docker.internal:11434"
    voice_url: str = "http://voice:8001"
    default_model: str = "llama3.2"

    model_config = {"env_file": ".env"}


settings = Settings()
