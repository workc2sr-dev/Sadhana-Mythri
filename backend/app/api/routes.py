from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.auth.security import (
    create_token,
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
    UserResponse,
    VerificationCreate,
)
from app.services.seed import ensure_plans

router = APIRouter()


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

    return {
        "access_token": create_token(user.id),
        "token_type": "bearer",
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
    if not db.get(Plan, payload.plan_id):
        raise HTTPException(404, "Plan not found")

    subscription = Subscription(user_id=user.id, plan_id=payload.plan_id)
    db.add(subscription)
    db.commit()
    db.refresh(subscription)
    return subscription


@router.get("/verification")
def get_verification(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Verification).filter(Verification.user_id == user.id).first() or {
        "status": "not_started"
    }


@router.post("/verification")
def submit_verification(
    payload: VerificationCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    verification = db.query(Verification).filter(Verification.user_id == user.id).first()
    if not verification:
        verification = Verification(
            user_id=user.id,
            document_type=payload.document_type,
            status="submitted",
        )
        db.add(verification)
    else:
        verification.document_type = payload.document_type
        verification.status = "submitted"

    db.commit()
    db.refresh(verification)
    return verification


@router.get("/invoices")
def invoices(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Invoice).filter(Invoice.user_id == user.id).all()


@router.get("/admin/users", response_model=list[UserResponse])
def admin_users(_: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    return db.query(User).all()
