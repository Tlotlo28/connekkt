"""
Settings — loads environment variables from .env into a typed Settings object.
We use Pydantic BaseSettings so we get validation + autocomplete for free.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str

    # JWT
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 10080  # 7 days

    # App
    APP_NAME: str = "Connekkt"
    APP_ENV: str = "development"

    # Tells Pydantic where to load env vars from
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


# A single Settings instance the whole app imports
settings = Settings()