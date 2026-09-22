import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    database_url = os.getenv("DATABASE_URL")
    secret_key = os.getenv("SECRET_KEY", "change-this-secret-in-production")
    frontend_origin = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")
    admin_name = os.getenv("ADMIN_NAME", "Sadhana Mythri ADMIN")
    admin_email = os.getenv("ADMIN_EMAIL", "admin@sadhanamythri.com")
    admin_password = os.getenv("ADMIN_PASSWORD")
    razorpay_key_id = os.getenv("RAZORPAY_KEY_ID")
    razorpay_key_secret = os.getenv("RAZORPAY_KEY_SECRET")


settings = Settings()
