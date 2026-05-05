"""User table — extended with profile fields for onboarding."""

from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Boolean, JSON, Float

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    # Auth
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)

    # Identity
    name = Column(String, nullable=True)
    category = Column(String, nullable=True)
    bio = Column(String, nullable=True)

    # JSON columns store arrays/objects as JSON in SQLite.
    # Easy for prototyping. We'd normalize these into proper tables for a v2 backend.
    subcategories = Column(JSON, default=list)  # ["Afrohouse", "Afrotech"]
    tags = Column(JSON, default=list)           # ["afrohouse", "lo-fi"]
    photos = Column(JSON, default=list)         # base64 data URLs (we'll move to file storage later)
    socials = Column(JSON, default=list)        # [{"type": "spotify", "url": "..."}]
    contact = Column(JSON, default=dict)        # {"email": "...", "whatsapp": "..."}

    # Location (optional, used for the scan feature later)
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)

    # Owner-only
    fade_color = Column(String, nullable=True)  # hex string for custom fade

    # Status
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)