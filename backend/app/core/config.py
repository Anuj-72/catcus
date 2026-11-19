from functools import lru_cache
from pathlib import Path
from typing import Literal

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=BACKEND_DIR / ".env", extra="ignore")

    database_url: str
    test_database_url: str | None = None

    # Pool ceiling per process is pool_size + max_overflow.
    db_pool_size: int = Field(default=10, ge=1)
    db_max_overflow: int = Field(default=20, ge=0)
    db_pool_timeout: float = Field(default=30.0, gt=0)
    db_pool_recycle: int = Field(default=1800, ge=0)
    db_pool_use_lifo: bool = True
    db_connect_timeout: int = Field(default=5, ge=1)

    # HS256 signing. JWT_SECRET must match the root .env.local.
    jwt_secret: str = Field(min_length=32)
    jwt_algorithm: Literal["HS256"] = "HS256"
    jwt_issuer: str = "catcus-api"
    jwt_audience: str = "catcus-web"
    access_token_ttl: int = Field(default=3600, gt=0)
    remember_token_ttl: int = Field(default=2592000, gt=0)


@lru_cache
def get_settings() -> Settings:
    return Settings()