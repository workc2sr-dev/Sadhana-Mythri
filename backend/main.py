import logging

from app.database.connection import Base, engine
from app.api.routes import router
from app.middleware.request_context import add_request_context
from app.utils.config import settings

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException
from sqlalchemy import text

logger = logging.getLogger(__name__)

# Create missing database tables
Base.metadata.create_all(bind=engine)

# Add missing columns to existing tables
blob_type = "BYTEA" if engine.dialect.name == "postgresql" else "LONGBLOB"

with engine.begin() as connection:
    connection.execute(
        text("ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP")
    )
    connection.execute(
        text("ALTER TABLE invoices ADD COLUMN IF NOT EXISTS subscription_id INTEGER")
    )
    connection.execute(
        text("ALTER TABLE invoices ADD COLUMN IF NOT EXISTS plan_id VARCHAR(30)")
    )
    connection.execute(
        text("ALTER TABLE users ADD COLUMN IF NOT EXISTS account_type VARCHAR(20) DEFAULT 'individual'")
    )
    connection.execute(
        text("ALTER TABLE users ADD COLUMN IF NOT EXISTS account_status VARCHAR(30) DEFAULT 'under_review'")
    )
    connection.execute(
        text("ALTER TABLE verifications ADD COLUMN IF NOT EXISTS document_content_type VARCHAR(100)")
    )
    connection.execute(
        text(f"ALTER TABLE verifications ADD COLUMN IF NOT EXISTS document_data {blob_type}")
    )

app = FastAPI(title="Sadhana Mythri API", version="0.1.0")

ERROR_RESPONSES = {
    400: ("BAD_REQUEST", "The request could not be processed."),
    401: ("UNAUTHORIZED", "Authentication is required."),
    403: ("FORBIDDEN", "The request is not permitted."),
    404: ("NOT_FOUND", "The requested resource was not found."),
    409: ("CONFLICT", "The request conflicts with the current state."),
    415: ("UNSUPPORTED_MEDIA_TYPE", "The request media type is not supported."),
    422: ("VALIDATION_ERROR", "The request contains invalid data."),
    429: ("TOO_MANY_REQUESTS", "Too many requests. Please try again later."),
}


def error_response(status_code: int, code: str, message: str, headers=None):
    return JSONResponse(
        status_code=status_code,
        content={"code": code, "detail": message},
        headers=headers,
    )


@app.exception_handler(StarletteHTTPException)
async def handle_http_error(request: Request, exc: StarletteHTTPException):
    code, message = ERROR_RESPONSES.get(
        exc.status_code,
        (
            "INTERNAL_ERROR" if exc.status_code >= 500 else "REQUEST_FAILED",
            "Something went wrong. Please try again later."
            if exc.status_code >= 500
            else "The request could not be completed.",
        ),
    )

    request_id = getattr(request.state, "request_id", "unknown")

    logger.warning(
        "HTTP error request_id=%s status=%s method=%s path=%s detail=%r",
        request_id,
        exc.status_code,
        request.method,
        request.url.path,
        exc.detail,
    )

    return error_response(
        exc.status_code, code, message, exc.headers
    )


@app.exception_handler(RequestValidationError)
async def handle_validation_error(request: Request, exc: RequestValidationError):
    request_id = getattr(request.state, "request_id", "unknown")

    invalid_fields = [
        {"location": error["loc"], "type": error["type"]}
        for error in exc.errors()
    ]

    logger.warning(
        "Request validation error request_id=%s method=%s path=%s invalid_fields=%s",
        request_id,
        request.method,
        request.url.path,
        invalid_fields,
    )

    code, message = ERROR_RESPONSES[422]
    return error_response(422, code, message)


@app.exception_handler(Exception)
async def handle_unexpected_error(request: Request, exc: Exception):
    request_id = getattr(request.state, "request_id", "unknown")

    logger.exception(
        "Unhandled error request_id=%s method=%s path=%s",
        request_id,
        request.method,
        request.url.path,
    )

    return error_response(
        500,
        "INTERNAL_ERROR",
        "Something went wrong. Please try again later.",
    )


app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.frontend_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.middleware("http")(add_request_context)
app.include_router(router, prefix="/api")


# Basic API health check
@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "sadhana-mythri-api",
    }


# Database connectivity health check
@app.get("/health/db")
def database_health_check():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))

        return {
            "status": "ok",
            "service": "sadhana-mythri-api",
            "database": "connected",
        }

    except Exception:
        logger.exception("Database health check failed")

        return JSONResponse(
            status_code=503,
            content={
                "status": "error",
                "service": "sadhana-mythri-api",
                "database": "unavailable",
            },
        )