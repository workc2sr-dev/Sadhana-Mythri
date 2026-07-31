from sqlalchemy import inspect

from app.database.connection import Base, engine
from app.api.routes import router
from app.middleware.request_context import add_request_context
from app.utils.config import settings
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

Base.metadata.create_all(bind=engine)


def migrate_verification_columns():
    """Add KYC upload fields for databases created before document uploads existed."""
    inspector = inspect(engine)
    if "verifications" not in inspector.get_table_names():
        return
    columns = {column["name"] for column in inspector.get_columns("verifications")}
    additions = {
        "document_name": "VARCHAR(255)",
        "document_path": "VARCHAR(500)",
        "created_at": "DATETIME",
        "reviewed_at": "DATETIME",
    }
    with engine.begin() as connection:
        for name, definition in additions.items():
            if name not in columns:
                connection.exec_driver_sql(f"ALTER TABLE verifications ADD COLUMN {name} {definition}")


migrate_verification_columns()
app = FastAPI(title="Sadhana Mythri API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.middleware("http")(add_request_context)
app.include_router(router, prefix="/api")


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "sadhana-mythri-api"}
