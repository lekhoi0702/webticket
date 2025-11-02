from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field, model_validator

from app.models.user import UserRole, UserStatus


class UserBase(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = Field(None, min_length=3, max_length=50)
    full_name: Optional[str] = Field(None, min_length=1, max_length=255)
    phone: Optional[str] = Field(None, max_length=20)

    @model_validator(mode="after")
    def ensure_contact(cls, data):
        if not data.email and not data.username:
            raise ValueError("Either email or username must be provided")
        return data


class UserCreate(UserBase):
    full_name: str = Field(..., min_length=1, max_length=255)
    password: str = Field(..., min_length=6, max_length=72)
    role: UserRole = UserRole.customer


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = Field(None, min_length=3, max_length=50)
    full_name: Optional[str] = Field(None, min_length=1, max_length=255)
    phone: Optional[str] = Field(None, max_length=20)
    password: Optional[str] = Field(None, min_length=6, max_length=72)
    role: Optional[UserRole] = None
    status: Optional[UserStatus] = None


class UserResponse(UserBase):
    user_id: int
    role: UserRole
    status: UserStatus
    email_verified: bool
    created_at: datetime
    updated_at: datetime

    @model_validator(mode="before")
    @classmethod
    def convert_enums(cls, data):
        """Convert string role/status to enum for response"""
        if isinstance(data, dict):
            if "role" in data and isinstance(data["role"], str):
                try:
                    data["role"] = UserRole(data["role"].lower())
                except ValueError:
                    data["role"] = UserRole.customer
            if "status" in data and isinstance(data["status"], str):
                try:
                    data["status"] = UserStatus(data["status"].lower())
                except ValueError:
                    data["status"] = UserStatus.ACTIVE
        return data

    class Config:
        from_attributes = True


class UserLogin(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    password: str = Field(..., min_length=6, max_length=72)

    @model_validator(mode="after")
    def check_identifier(cls, data):
        if not data.username and not data.email:
            raise ValueError("Username or email is required")
        return data
