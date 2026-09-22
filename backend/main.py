from app.database.connection import Base, engine
from app.api.routes import router
from app.middleware.request_context import add_request_context
from app.utils.config import settings
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

Base.metadata.create_all(bind=engine)

# create_all only creates missing tables; new columns on pre-existing tables need explicit migration.
blob_type = "BYTEA" if engine.dialect.name == "postgresql" else "LONGBLOB"
with engine.begin() as connection:
    connection.execute(text("ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP"))
    connection.execute(text("ALTER TABLE invoices ADD COLUMN IF NOT EXISTS subscription_id INTEGER"))
    connection.execute(text("ALTER TABLE invoices ADD COLUMN IF NOT EXISTS plan_id VARCHAR(30)"))
    connection.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS account_type VARCHAR(20) DEFAULT 'individual'"))
    connection.execute(text("ALTER TABLE verifications ADD COLUMN IF NOT EXISTS document_content_type VARCHAR(100)"))
    connection.execute(text(f"ALTER TABLE verifications ADD COLUMN IF NOT EXISTS document_data {blob_type}"))

app = FastAPI(title="Sadhana Mythri API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.frontend_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.middleware("http")(add_request_context)
app.include_router(router, prefix="/api")


# Simple liveness endpoint used to verify the API is running
@app.get("/health")
def health_check():
    return {"status": "ok", "service": "sadhana-mythri-api"}
