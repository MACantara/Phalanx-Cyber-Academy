from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "Phalanx Cyber Academy API"
    debug: bool = False
    supabase_url: str
    supabase_service_role_key: str

    # Brevo transactional email
    brevo_api_key: str | None = None
    brevo_default_sender_email: str | None = None
    brevo_default_sender_name: str = "Phalanx Cyber Academy"
    brevo_suppress_send: bool = False

    # Login security
    max_login_attempts: int = 5
    login_lockout_minutes: int = 15

    # CORS
    cors_allowed_origins: str = "http://localhost:5173"
    cors_allowed_methods: str = "GET,POST,PUT,DELETE,OPTIONS"
    cors_allowed_headers: str = "Authorization,Content-Type,X-User-Id,X-Requested-With"


settings = Settings()
