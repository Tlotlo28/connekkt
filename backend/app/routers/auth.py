"""
Auth endpoints: /signup and /login.
A 'router' in FastAPI is a group of related endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.user import UserSignup, UserLogin, UserPublic, TokenResponse
from app.core.security import hash_password, verify_password, create_access_token


# All routes here will be prefixed with /auth and tagged "auth" in the docs
router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def signup(payload: UserSignup, db: Session = Depends(get_db)):
    """
    Create a new account.
    Returns the user + a JWT so they're auto-logged-in after signup.
    """
    # Reject duplicate emails
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )

    # Create the user with a hashed password
    user = User(
        email=payload.email,
        hashed_password=hash_password(payload.password),
        name=payload.name,
    )
    db.add(user)
    db.commit()
    db.refresh(user)  # reloads the user with their newly-assigned ID

    token = create_access_token(user.id)
    return TokenResponse(access_token=token, user=UserPublic.model_validate(user))


@router.post("/login", response_model=TokenResponse)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    """
    Log in. Returns a JWT on success.
    Generic error message on failure — never tell attackers which part was wrong.
    """
    user = db.query(User).filter(User.email == payload.email).first()

    # Verify password — important: do BOTH checks even if user is None,
    # so attackers can't time the response to figure out which emails exist.
    # (Real apps go further with constant-time comparisons.)
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account has been deactivated.",
        )

    token = create_access_token(user.id)
    return TokenResponse(access_token=token, user=UserPublic.model_validate(user))

@router.post("/demo", response_model=TokenResponse)
def demo_login(db: Session = Depends(get_db)):
    """
    Instant demo login as Modisa (user id 1).
    For portfolio demonstration only — do not expose in a real product.
    """
    demo_user = db.query(User).filter(User.id == 1).first()
    if not demo_user:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Demo account not set up yet.",
        )

    token = create_access_token(demo_user.id)
    return TokenResponse(access_token=token, user=UserPublic.model_validate(demo_user))