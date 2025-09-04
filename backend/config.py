from pydantic_settings import BaseSettings
from typing import Dict
import os
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    DATABASE_URL: str = os.getenv('SQLALCHEMY_DATABASE_URI', 'sqlite:///instance/cointactix.db')
    JWT_SECRET_KEY: str = os.getenv('JWT_SECRET_KEY', 'default-secret-key')
    MODEL_PATHS: Dict[str, str] = {
        "BTC": "models/BTC_model.joblib",
        "ETH": "models/ETH_model.joblib"
    }
    CACHE_TTL: int = 60
    LOG_LEVEL: str = "INFO"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JSON_SORT_KEYS = False
    
    class Config:
        env_file = ".env"

settings = Settings()