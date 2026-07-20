import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    database_url = os.getenv("DATABASE_URL", "sqlite:///./sadhana_mythri.db")
    secret_key = os.getenv("SECRET_KEY", "change-this-secret-in-production")
    frontend_origin = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")


settings = Settings()
