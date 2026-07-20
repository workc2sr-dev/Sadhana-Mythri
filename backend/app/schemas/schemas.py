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
