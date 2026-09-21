from datetime import datetime
from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    full_name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(min_length=8)
    account_type: str = Field(default="individual", pattern="^(individual|business)$")


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    is_admin: bool
    account_type: str = "individual"
    account_status: str = "under_review"

    class Config:
        from_attributes = True


class PlanResponse(BaseModel):
    id: str
    name: str
    price: int
    workspace_days: int

    class Config:
        from_attributes = True


class SubscriptionCreate(BaseModel):
    plan_id: str


class SubscriptionResponse(BaseModel):
    id: int
    plan_id: str
    status: str
    created_at: datetime
    expires_at: datetime | None = None

    class Config:
        from_attributes = True


class AdminSubscriptionResponse(SubscriptionResponse):
    user_id: int
    user_name: str
    user_email: EmailStr


class BusinessDetailsCreate(BaseModel):
    business_name: str = Field(default="", max_length=150)
    business_type: str = Field(min_length=2, max_length=80)
    gst_number: str | None = Field(default=None, max_length=20)
    phone: str = Field(min_length=7, max_length=20)
    address_line: str = Field(min_length=3, max_length=255)
    city: str = Field(min_length=2, max_length=100)
    state: str = Field(min_length=2, max_length=100)
    pincode: str = Field(min_length=4, max_length=10)


class BusinessDetailsResponse(BusinessDetailsCreate):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class InvoiceResponse(BaseModel):
    id: int
    subscription_id: int | None = None
    plan_id: str | None = None
    amount: int
    status: str
    issued_at: datetime

    class Config:
        from_attributes = True


class CreateOrderRequest(BaseModel):
    amount: int = Field(ge=100, description="Amount in paise, minimum 100")
    currency: str = "INR"
    receipt: str | None = None


class CreateOrderResponse(BaseModel):
    order_id: str
    amount: int
    currency: str
    key_id: str


class VerifyPaymentRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


class VerifyPaymentResponse(BaseModel):
    success: bool


class VerificationCreate(BaseModel):
    document_type: str


class VerificationResponse(BaseModel):
    id: int | None = None
    document_type: str | None = None
    document_name: str | None = None
    status: str
    created_at: datetime | None = None
    reviewed_at: datetime | None = None

    class Config:
        from_attributes = True


class VerificationReview(BaseModel):
    status: str = Field(pattern="^(approved|declined)$")


class AdminVerificationResponse(VerificationResponse):
    user_id: int
    user_name: str
    user_email: EmailStr
