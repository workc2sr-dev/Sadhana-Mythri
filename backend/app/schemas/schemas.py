from datetime import datetime
from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    full_name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(min_length=8)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    is_admin: bool

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

    class Config:
        from_attributes = True


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
