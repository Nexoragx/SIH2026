import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Server Configuration
    PROJECT_NAME: str = "SIH26094 Mental Health Monitoring & Distress Prediction System"
    API_V1_PREFIX: str = "/api/v1"
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    DEBUG: bool = True
    ENVIRONMENT: str = "development"

    # CORS Configuration
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:8000",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:8000",
    ]

    # JWT Authentication
    JWT_SECRET_KEY: str = "sih26094_dynamic_mental_health_jwt_secret_key_change_in_production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # OAuth2 Configuration (Google OAuth & Generic OAuth)
    OAUTH_GOOGLE_CLIENT_ID: str = "mock_google_client_id.apps.googleusercontent.com"
    OAUTH_GOOGLE_CLIENT_SECRET: str = "mock_google_client_secret"
    OAUTH_REDIRECT_URI: str = "http://localhost:8000/api/v1/auth/oauth/callback"

    # MongoDB Configuration (Read from .env)
    MONGO_URI: str = "mongodb://localhost:27017/Mental"
    MONGO_DB_NAME: str = "Mental"

    # Feature Fusion Weights (from Architecture Diagram)
    WEIGHT_MADRS: float = 0.40
    WEIGHT_NLP: float = 0.15
    WEIGHT_VOICE: float = 0.10
    WEIGHT_CONTEXT: float = 0.15
    WEIGHT_BASELINE: float = 0.20

    # Distress Score Thresholds (0 - 100)
    THRESHOLD_LOW: int = 25
    THRESHOLD_MODERATE: int = 50
    THRESHOLD_HIGH: int = 75
    THRESHOLD_CRITICAL: int = 100

    # External Integration API Stubs
    CRISIS_AMBULANCE_108_API_ENDPOINT: str = "https://api.emergency108.gov.in/v1/dispatch"
    CRISIS_AMBULANCE_108_API_KEY: str = "mock_108_api_key_test_sandbox"
    TELEPSYCHIATRY_SERVICE_ENDPOINT: str = "https://telepsych.portal.gov.in/v1"
    NGO_PARTNERSHIP_DISPATCH_ENDPOINT: str = "https://ngo-network.mentalhealth.org/v1/assign"

    # Audio/Voice Upload Restrictions
    MAX_AUDIO_FILE_SIZE_MB: int = 25
    ALLOWED_AUDIO_EXTENSIONS: List[str] = [".wav", ".mp3", ".m4a", ".ogg", ".webm", ".flac"]

    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()
