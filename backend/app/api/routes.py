import hashlib
import hmac
from datetime import datetime, timedelta, timezone
from uuid import uuid4

import razorpay
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from fastapi.responses import Response
from pydantic import BaseModel
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
from app.models.models import BusinessDetail, Invoice, Plan, Subscription, User, Verification
from app.schemas.schemas import (
    AdminSubscriptionResponse,
    BusinessDetailsCreate,
    BusinessDetailsResponse,
    CreateOrderRequest,
    CreateOrderResponse,
    InvoiceResponse,
    LoginRequest,
    PlanResponse,
    RegisterRequest,
    SubscriptionCreate,
    SubscriptionResponse,
    AdminVerificationResponse,
    UserResponse,
    VerificationResponse,
    VerificationReview,
    VerifyPaymentRequest,
    VerifyPaymentResponse,
)
from app.services.seed import ensure_admin, ensure_plans
from app.utils.config import settings

router = APIRouter()
ACTIVE_SUBSCRIPTION_STATUSES = ("under_review", "approved", "active")


# Build a Razorpay SDK client from configured API credentials
def get_razorpay_client() -> razorpay.Client:
    if not settings.razorpay_key_id or not settings.razorpay_key_secret:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Razorpay credentials are not configured")
    return razorpay.Client(auth=(settings.razorpay_key_id, settings.razorpay_key_secret))


class SupportChatRequest(BaseModel):
    message: str
    history: list[dict[str, str]] = []


# Recompute and persist a user's account status based on verification/admin state
def sync_account_status(user: User, db: Session) -> str:
    verification = db.query(Verification).filter(Verification.user_id == user.id).first()
    if user.is_admin or (verification and verification.status == "approved"):
        user.account_status = "created"
    else:
        user.account_status = "under_review"
    db.add(user)
    db.commit()
    return user.account_status


# Seed the admin user and default plans when the app starts up
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


# Register a new user account
@router.post("/auth/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(409, "An account with this email already exists")

    user = User(
        full_name=payload.full_name,
        email=payload.email,
        password_hash=hash_password(payload.password),
        account_type=payload.account_type,
        account_status="under_review",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


# Authenticate a user and issue an access token
@router.post("/auth/login")
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(401, "something went wrong, please try again")

    sync_account_status(user, db)
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    db.refresh(user)
    return {
        "access_token": create_token(user.id, expires_at),
        "token_type": "bearer",
        "expires_at": int(expires_at.timestamp()),
        "user": UserResponse.model_validate(user),
    }


# Return the currently authenticated user's profile
@router.get("/auth/me", response_model=UserResponse)
def get_me(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    sync_account_status(user, db)
    db.refresh(user)
    return user


# List all available subscription plans
@router.get("/plans", response_model=list[PlanResponse])
def list_plans(db: Session = Depends(get_db)):
    ensure_plans(db)
    return db.query(Plan).all()


# List the current user's subscriptions
@router.get("/subscriptions", response_model=list[SubscriptionResponse])
def subscriptions(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Subscription).filter(Subscription.user_id == user.id).all()


# Create a new subscription for the user after validating eligibility, then invoice it
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

    sync_account_status(user, db)
    verification = db.query(Verification).filter(Verification.user_id == user.id).first()
    if user.account_status != "created" or not verification or verification.status != "approved":
        raise HTTPException(403, "Government ID verification must be approved and the account must be created before subscribing")

    business_details = db.query(BusinessDetail).filter(BusinessDetail.user_id == user.id).first()
    if not business_details:
        raise HTTPException(403, "Customer/business details must be submitted before subscribing")

    plan = db.get(Plan, payload.plan_id)
    now = datetime.utcnow()
    subscription = Subscription(
        user_id=user.id,
        plan_id=payload.plan_id,
        status="active",
        expires_at=now + timedelta(days=365),
    )
    db.add(subscription)
    db.commit()
    db.refresh(subscription)

    # Payment was already verified before this call; generate the annual invoice now.
    invoice = Invoice(
        user_id=user.id,
        subscription_id=subscription.id,
        plan_id=plan.id,
        amount=plan.price * 12,
        status="paid",
    )
    db.add(invoice)
    db.commit()
    return subscription


# Renew an existing active subscription for another year and generate an invoice
@router.post("/subscriptions/{subscription_id}/renew", response_model=SubscriptionResponse)
def renew_subscription(
    subscription_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    subscription = db.get(Subscription, subscription_id)
    if not subscription or subscription.user_id != user.id:
        raise HTTPException(404, "Subscription not found")
    if subscription.status not in ACTIVE_SUBSCRIPTION_STATUSES:
        raise HTTPException(status.HTTP_409_CONFLICT, "Only an active plan can be renewed")

    plan = db.get(Plan, subscription.plan_id)
    if not plan:
        raise HTTPException(404, "Plan not found")

    now = datetime.utcnow()
    base_date = subscription.expires_at if subscription.expires_at and subscription.expires_at > now else now
    subscription.expires_at = base_date + timedelta(days=365)
    subscription.status = "active"
    db.add(subscription)
    db.commit()
    db.refresh(subscription)

    invoice = Invoice(
        user_id=user.id,
        subscription_id=subscription.id,
        plan_id=plan.id,
        amount=plan.price * 12,
        status="paid",
    )
    db.add(invoice)
    db.commit()
    return subscription


# Cancel an active subscription
@router.delete("/subscriptions/{subscription_id}", response_model=SubscriptionResponse)
def cancel_subscription(
    subscription_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    subscription = db.get(Subscription, subscription_id)
    if not subscription or subscription.user_id != user.id:
        raise HTTPException(404, "Subscription not found")
    if subscription.status not in ACTIVE_SUBSCRIPTION_STATUSES:
        raise HTTPException(status.HTTP_409_CONFLICT, "Only an active plan can be cancelled")

    subscription.status = "cancelled"
    db.add(subscription)
    db.commit()
    db.refresh(subscription)
    return subscription


# Create a Razorpay order for the client to complete payment against
@router.post("/payments/create-order", response_model=CreateOrderResponse)
def create_payment_order(payload: CreateOrderRequest, user: User = Depends(get_current_user)):
    if payload.amount < 100:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Amount must be at least 100 paise")

    client = get_razorpay_client()
    try:
        order = client.order.create(
            {
                "amount": payload.amount,
                "currency": payload.currency,
                "receipt": payload.receipt or f"receipt_{user.id}_{uuid4().hex[:8]}",
            }
        )
    except razorpay.errors.BadRequestError as error:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, str(error))
    except Exception as error:
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, f"Unable to create Razorpay order: {error}")

    return CreateOrderResponse(
        order_id=order["id"],
        amount=order["amount"],
        currency=order["currency"],
        key_id=settings.razorpay_key_id,
    )


# Verify a Razorpay payment signature to confirm the transaction is genuine
@router.post("/payments/verify-payment", response_model=VerifyPaymentResponse)
def verify_payment(payload: VerifyPaymentRequest, user: User = Depends(get_current_user)):
    if not payload.razorpay_order_id or not payload.razorpay_payment_id or not payload.razorpay_signature:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Missing payment verification fields")
    if not settings.razorpay_key_secret:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Razorpay credentials are not configured")

    payload_body = f"{payload.razorpay_order_id}|{payload.razorpay_payment_id}"
    expected_signature = hmac.new(
        settings.razorpay_key_secret.encode(),
        payload_body.encode(),
        hashlib.sha256,
    ).hexdigest()

    if not hmac.compare_digest(expected_signature, payload.razorpay_signature):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Payment signature verification failed")

    return VerifyPaymentResponse(success=True)


# Fetch the current user's government ID verification status
@router.get("/verification", response_model=VerificationResponse)
def get_verification(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    verification = db.query(Verification).filter(Verification.user_id == user.id).first()
    if not verification:
        return VerificationResponse(status="not_started")
    return verification


# Upload a government ID document for KYC verification
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

    if not verification:
        verification = Verification(user_id=user.id)
        db.add(verification)
    verification.document_type = document_type.strip()[:80]
    verification.document_name = document.filename or "Government ID"
    verification.document_content_type = document.content_type
    verification.document_data = contents
    verification.status = "pending"
    verification.reviewed_at = None
    db.commit()
    db.refresh(verification)
    return verification


# List all pending/reviewed verifications for admin review
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


# Approve or decline a user's submitted verification and update account status
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

    account = db.get(User, verification.user_id)
    if account:
        account.account_status = "created" if payload.status == "approved" else "under_review"
        db.add(account)

    db.commit()
    db.refresh(verification)
    return verification


# Download the uploaded government ID document for admin review
@router.get("/admin/verifications/{verification_id}/document")
def get_verification_document(
    verification_id: int,
    _: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    verification = db.get(Verification, verification_id)
    if not verification or not verification.document_data:
        raise HTTPException(404, "Government ID file not found")
    filename = verification.document_name or "document"
    return Response(
        content=verification.document_data,
        media_type=verification.document_content_type or "application/octet-stream",
        headers={"Content-Disposition": f'inline; filename="{filename}"'},
    )


# Handle a support chat message with a canned response
@router.post("/chat/support")
async def support_chat(payload: SupportChatRequest):
    user_message = (payload.message or "").strip()
    if not user_message:
        raise HTTPException(status_code=400, detail="Message is required")

    return {
        "reply": (
            "Thanks for reaching out. Our support team can help with account setup, plan questions, "
            "document verification, and general guidance. Please contact +91 8904178434 or "
            "info@sadhanamythri.com for direct assistance."
        )
    }


# List the current user's invoices, most recent first
@router.get("/invoices", response_model=list[InvoiceResponse])
def invoices(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Invoice).filter(Invoice.user_id == user.id).order_by(Invoice.issued_at.desc()).all()


# Fetch the current user's saved business details, if any
@router.get("/business-details", response_model=BusinessDetailsResponse | None)
def get_business_details(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(BusinessDetail).filter(BusinessDetail.user_id == user.id).first()


# Create or update the current user's business details
@router.post("/business-details", response_model=BusinessDetailsResponse, status_code=status.HTTP_201_CREATED)
def submit_business_details(
    payload: BusinessDetailsCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    details = db.query(BusinessDetail).filter(BusinessDetail.user_id == user.id).first()
    if not details:
        details = BusinessDetail(user_id=user.id)
        db.add(details)
    for field, value in payload.model_dump().items():
        setattr(details, field, value)
    # Individual/personal customers may skip a business name; fall back to their account name.
    if not details.business_name:
        details.business_name = user.full_name
    db.commit()
    db.refresh(details)
    return details


# List all subscriptions across users for the admin dashboard
@router.get("/admin/subscriptions", response_model=list[AdminSubscriptionResponse])
def admin_subscriptions(_: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    rows = (
        db.query(Subscription, User)
        .join(User, Subscription.user_id == User.id)
        .order_by(Subscription.created_at.desc())
        .all()
    )
    return [
        AdminSubscriptionResponse(
            id=subscription.id,
            plan_id=subscription.plan_id,
            status=subscription.status,
            created_at=subscription.created_at,
            expires_at=subscription.expires_at,
            user_id=account.id,
            user_name=account.full_name,
            user_email=account.email,
        )
        for subscription, account in rows
    ]


# List all registered users for the admin directory
@router.get("/admin/users", response_model=list[UserResponse])
def admin_users(_: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    # Ignore incomplete legacy records so the administrative directory only
    # returns accounts that can be safely represented to the client.
    return db.query(User).filter(User.email != "").all()


# Permanently delete a user account and all related records/files
@router.delete("/admin/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: int,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    account = db.get(User, user_id)
    if not account:
        raise HTTPException(404, "User not found")
    if account.id == admin.id or account.is_admin:
        raise HTTPException(403, "Administrator accounts cannot be deleted")

    try:
        db.query(Invoice).filter(Invoice.user_id == account.id).delete(synchronize_session=False)
        db.query(Subscription).filter(Subscription.user_id == account.id).delete(synchronize_session=False)
        db.query(Verification).filter(Verification.user_id == account.id).delete(synchronize_session=False)
        db.query(BusinessDetail).filter(BusinessDetail.user_id == account.id).delete(synchronize_session=False)
        db.delete(account)
        db.commit()
    except Exception:
        db.rollback()
        raise
