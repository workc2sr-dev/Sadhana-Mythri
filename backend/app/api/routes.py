from datetime import datetime, timedelta, timezone
from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.auth.security import (
    create_token,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    get_admin_user,
    get_current_user,
    hash_password,
    verify_password,
)
from app.database.connection import get_db
from app.models.models import Invoice, Plan, Subscription, User, Verification
from app.schemas.schemas import (
    LoginRequest,
    PlanResponse,
    RegisterRequest,
    SubscriptionCreate,
    SubscriptionResponse,
    AdminVerificationResponse,
    UserResponse,
    VerificationResponse,
    VerificationReview,
)
from app.services.seed import ensure_admin, ensure_plans

router = APIRouter()
KYC_UPLOAD_DIR = Path(__file__).resolve().parents[2] / "uploads" / "kyc"
ACTIVE_SUBSCRIPTION_STATUSES = ("under_review", "approved", "active")


@router.on_event("startup")
def seed_initial_data():
    # The database session dependency is not available during application startup.
    from app.database.connection import SessionLocal
    db = SessionLocal()
    try:
        ensure_admin(db)
        ensure_plans(db)
    finally:
        db.close()


@router.post("/auth/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(409, "An account with this email already exists")

    user = User(
        full_name=payload.full_name,
        email=payload.email,
        password_hash=hash_password(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/auth/login")
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(401, "Incorrect email or password")

    expires_at = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": create_token(user.id, expires_at),
        "token_type": "bearer",
        "expires_at": int(expires_at.timestamp()),
        "user": UserResponse.model_validate(user),
    }


@router.get("/plans", response_model=list[PlanResponse])
def list_plans(db: Session = Depends(get_db)):
    ensure_plans(db)
    return db.query(Plan).all()


@router.get("/subscriptions", response_model=list[SubscriptionResponse])
def subscriptions(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Subscription).filter(Subscription.user_id == user.id).all()


@router.post("/subscriptions", response_model=SubscriptionResponse, status_code=status.HTTP_201_CREATED)
def create_subscription(
    payload: SubscriptionCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # A subscription can be the first API request a newly signed-in user makes.
    # Ensure the built-in plan catalogue exists before validating the selection.
    ensure_plans(db)
    if not db.get(Plan, payload.plan_id):
        raise HTTPException(404, "Plan not found")

    active_subscription = (
        db.query(Subscription)
        .filter(
            Subscription.user_id == user.id,
            Subscription.status.in_(ACTIVE_SUBSCRIPTION_STATUSES),
        )
        .first()
    )
    if active_subscription:
        raise HTTPException(status.HTTP_409_CONFLICT, "One plan per account")

    verification = db.query(Verification).filter(Verification.user_id == user.id).first()
    if not verification or verification.status != "approved":
        raise HTTPException(403, "Government ID verification must be approved before subscribing")

    subscription = Subscription(user_id=user.id, plan_id=payload.plan_id, status="under_review")
    db.add(subscription)
    db.commit()
    db.refresh(subscription)
    return subscription


@router.get("/verification", response_model=VerificationResponse)
def get_verification(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    verification = db.query(Verification).filter(Verification.user_id == user.id).first()
    if not verification:
        return VerificationResponse(status="not_started")
    return verification


@router.post("/verification", response_model=VerificationResponse, status_code=status.HTTP_201_CREATED)
async def submit_verification(
    document_type: str = Form(...),
    document: UploadFile = File(...),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    allowed_types = {"application/pdf", "image/jpeg", "image/png"}
    if document.content_type not in allowed_types:
        raise HTTPException(415, "Upload a PDF, JPG, or PNG government ID")
    contents = await document.read()
    if not contents or len(contents) > 5 * 1024 * 1024:
        raise HTTPException(400, "Government ID must be between 1 byte and 5 MB")

    verification = db.query(Verification).filter(Verification.user_id == user.id).first()
    if verification and verification.status == "approved":
        raise HTTPException(409, "Your government ID is already approved")

    KYC_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    suffix = Path(document.filename or "document").suffix.lower()
    stored_name = f"{user.id}-{uuid4().hex}{suffix}"
    stored_path = KYC_UPLOAD_DIR / stored_name
    stored_path.write_bytes(contents)

    if not verification:
        verification = Verification(user_id=user.id)
        db.add(verification)
    verification.document_type = document_type.strip()[:80]
    verification.document_name = document.filename or "Government ID"
    verification.document_path = str(stored_path)
    verification.status = "pending"
    verification.reviewed_at = None
    db.commit()
    db.refresh(verification)
    return verification


@router.get("/admin/verifications", response_model=list[AdminVerificationResponse])
def admin_verifications(_: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    rows = db.query(Verification, User).join(User, Verification.user_id == User.id).order_by(Verification.created_at.desc()).all()
    return [
        AdminVerificationResponse(
            id=verification.id,
            user_id=account.id,
            user_name=account.full_name,
            user_email=account.email,
            document_type=verification.document_type,
            document_name=verification.document_name,
            status=verification.status,
            created_at=verification.created_at,
            reviewed_at=verification.reviewed_at,
        )
        for verification, account in rows
    ]


@router.patch("/admin/verifications/{verification_id}", response_model=VerificationResponse)
def review_verification(
    verification_id: int,
    payload: VerificationReview,
    _: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    verification = db.get(Verification, verification_id)
    if not verification:
        raise HTTPException(404, "Verification not found")
    verification.status = payload.status
    verification.reviewed_at = datetime.utcnow()
    db.commit()
    db.refresh(verification)
    return verification


@router.get("/admin/verifications/{verification_id}/document")
def get_verification_document(
    verification_id: int,
    _: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    verification = db.get(Verification, verification_id)
    document_path = Path(verification.document_path) if verification and verification.document_path else None
    if not document_path or not document_path.is_file():
        raise HTTPException(404, "Government ID file not found")
    return FileResponse(document_path, filename=verification.document_name or document_path.name)


@router.get("/invoices")
def invoices(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Invoice).filter(Invoice.user_id == user.id).all()


@router.get("/admin/users", response_model=list[UserResponse])
def admin_users(_: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    # Ignore incomplete legacy records so the administrative directory only
    # returns accounts that can be safely represented to the client.
    return db.query(User).filter(User.email != "").all()
