"""Pydantic schemas — request/response shapes."""

from datetime import datetime
from pydantic import BaseModel, EmailStr, Field


class UserSignup(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    name: str | None = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserPublic(BaseModel):
    """Safe-to-return user data. Notice: no password."""
    id: int
    email: EmailStr
    name: str | None = None
    category: str | None = None
    bio: str | None = None
    subcategories: list = []
    tags: list = []
    photos: list = []
    socials: list = []
    contact: dict = {}
    fade_color: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class UserUpdate(BaseModel):
    """Body for PATCH /users/me — every field optional, only sent fields update."""
    name: str | None = None
    category: str | None = None
    bio: str | None = Field(default=None, max_length=240)
    subcategories: list[str] | None = None
    tags: list[str] | None = None
    photos: list[str] | None = None
    socials: list[dict] | None = None
    contact: dict | None = None
    fade_color: str | None = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserPublic