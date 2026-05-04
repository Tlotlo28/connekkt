"""
Security utilities: password hashing and JWT generation/verification.

We use the `bcrypt` library directly (instead of passlib) because passlib is
unmaintained and breaks with recent bcrypt versions. Direct usage is simpler anyway.
"""

import bcrypt
from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError

from app.config import settings


def hash_password(plain_password: str) -> str:
    """
    Hash a password for storing in the database.

    Bcrypt has a 72-byte input limit. We truncate longer passwords to stay safe.
    (This is fine — 72 bytes of entropy is wildly more than any real password needs.)
    """
    pw_bytes = plain_password.encode("utf-8")[:72]
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(pw_bytes, salt)
    return hashed.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Check a plain password against its stored hash."""
    pw_bytes = plain_password.encode("utf-8")[:72]
    hash_bytes = hashed_password.encode("utf-8")
    try:
        return bcrypt.checkpw(pw_bytes, hash_bytes)
    except ValueError:
        # Malformed hash in the DB — should never happen, but fail safe
        return False


def create_access_token(user_id: int) -> str:
    """
    Create a JWT for a given user.
    The 'sub' claim (subject) is the user ID — that's how we know who's making requests.
    """
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.JWT_EXPIRE_MINUTES)
    payload = {
        "sub": str(user_id),
        "exp": expire,
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def decode_access_token(token: str) -> int | None:
    """
    Verify a JWT and return the user_id inside it.
    Returns None if invalid or expired.
    """
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        user_id = payload.get("sub")
        return int(user_id) if user_id else None
    except (JWTError, ValueError):
        return None