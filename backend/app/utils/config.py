import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    database_url = os.getenv(
        "DATABASE_URL",
        "postgresql://neondb_owner:npg_NYvmfF7ZIMV2@ep-long-bonus-azyiqw6o-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
    )
    secret_key = os.getenv("SECRET_KEY", "change-this-secret-in-production")
    frontend_origin = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")
    admin_name = os.getenv("ADMIN_NAME", "Sadhana Mythri ADMIN")
    admin_email = os.getenv("ADMIN_EMAIL", "admin@sadhanamythri.com")
    admin_password = os.getenv("ADMIN_PASSWORD")


settings = Settings()
