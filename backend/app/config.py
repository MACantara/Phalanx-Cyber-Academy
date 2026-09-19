from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=("../.env", ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "Phalanx Cyber Academy API"
    debug: bool = False

    # Neon Postgres — pooled for app traffic, direct for migrations
    database_url: str | None = None
    database_url_unpooled: str | None = None

    # Clerk auth
    clerk_secret_key: str | None = None
    clerk_jwks_url: str | None = None
    clerk_issuer: str | None = None

    # Login security
    max_login_attempts: int = 5
    login_lockout_minutes: int = 15

    # CORS
    cors_allowed_origins: str = "http://localhost:5173"
    cors_allowed_methods: str = "GET,POST,PUT,DELETE,OPTIONS"
    cors_allowed_headers: str = "Authorization,Content-Type,X-Requested-With"


settings = Settings()
