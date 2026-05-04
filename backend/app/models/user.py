"""
The User model — the shape of the 'users' table in the database.
SQLAlchemy converts this Python class into a real SQL table at startup.
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Boolean

from app.database import Base


class User(Base):
    __tablename__ = "users"

    # Primary key — auto-incremented unique ID for each user
    id = Column(Integer, primary_key=True, index=True)

    # Login credentials
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)

    # Stage name / display name (Modisa, Thando M., etc.)
    name = Column(String, nullable=True)

    # Profile fields — filled in during onboarding (round 2)
    category = Column(String, nullable=True)  # e.g. "musician"
    bio = Column(String, nullable=True)

    # Account status
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)  # email verification — for v2

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)