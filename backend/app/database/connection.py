from sqlalchemy import create_engine  # type: ignore
from sqlalchemy.orm import DeclarativeBase, sessionmaker  # type: ignore
from app.utils.config import settings

DATABASE_URL = settings.database_url
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
