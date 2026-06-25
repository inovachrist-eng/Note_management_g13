"""Configuration centralisée — équivalent des fichiers config/*.php + .env de Laravel."""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Base de données
    database_url: str = "sqlite:///./app.db"

    # Frontend / CORS
    frontend_url: str = "http://localhost:5173"
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"

    # Lien magique
    magic_link_ttl_minutes: int = 15

    # Email
    mail_mailer: str = "log"  # "log" ou "smtp"
    mail_host: str = "127.0.0.1"
    mail_port: int = 1025
    mail_username: str | None = None
    mail_password: str | None = None
    mail_from: str = "hello@example.com"
    mail_from_name: str = "Note Management"

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


settings = Settings()
