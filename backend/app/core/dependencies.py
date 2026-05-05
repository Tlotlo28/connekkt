"""
Reusable FastAPI dependencies.
The big one here: get_current_user — extracts the JWT from the Authorization
header, decodes it, looks up the user, and returns them. Any endpoint that
needs auth just adds `current_user: User = Depends(get_current_user)` to its signature.
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.core.security import decode_access_token


# This tells FastAPI to expect "Authorization: Bearer <token>" headers.
# It also makes the docs at /docs show a nice "Authorize" button.
bearer_scheme = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    """
    Extract the user from the JWT in the Authorization header.
    Raises 401 if the token is missing/invalid/expired.
    """
    token = credentials.credentials
    user_id = decode_access_token(token)

    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token.",
        )

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User no longer exists.",
        )

    return user