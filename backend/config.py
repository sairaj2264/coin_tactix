from pydantic_settings import BaseSettings
from typing import Dict

class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./instance/cointactix.db"
    JWT_SECRET_KEY: str
    MODEL_PATHS: Dict[str, str] = {
        "BTC": "models/BTC_model.joblib",
        "ETH": "models/ETH_model.joblib"
    }
    CACHE_TTL: int = 60
    LOG_LEVEL: str = "INFO"
    
    class Config:
        env_file = ".env"

settings = Settings()