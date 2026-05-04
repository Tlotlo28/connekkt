"""
Pydantic schemas define what data comes IN (requests) and goes OUT (responses).
They validate everything automatically — no garbage data reaches our database.
"""

from datetime import datetime
from pydantic import BaseModel, EmailStr, Field


class UserSignup(BaseModel):
    """What the client sends when signing up."""
    email: EmailStr  # Pydantic validates real email format automatically
    password: str = Field(min_length=8, max_length=128)
    name: str | None = None


class UserLogin(BaseModel):
    """What the client sends when logging in."""
    email: EmailStr
    password: str


class UserPublic(BaseModel):
    """What we send BACK about a user. Notice: no password, no hash."""
    id: int
    email: EmailStr
    name: str | None = None
    category: str | None = None
    bio: str | None = None
    created_at: datetime

    # Tells Pydantic to read from SQLAlchemy model attributes (not just dicts)
    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    """What we return on successful login."""
    access_token: str
    token_type: str = "bearer"
    user: UserPublic