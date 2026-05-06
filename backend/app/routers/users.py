"""User profile endpoints."""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.database import get_db
from app.models.user import User
from app.schemas.user import UserPublic, UserUpdate, UserListItem, LocationUpdate
from app.core.dependencies import get_current_user
from app.services.geo import haversine_km, bounding_box

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserPublic)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.patch("/me", response_model=UserPublic)
def update_me(
    payload: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(current_user, field, value)
    db.commit()
    db.refresh(current_user)
    return current_user


@router.patch("/me/location", response_model=UserPublic)
def update_my_location(
    payload: LocationUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Save the logged-in user's current location (called after browser geo permission)."""
    current_user.lat = payload.lat
    current_user.lng = payload.lng
    db.commit()
    db.refresh(current_user)
    return current_user


@router.get("", response_model=list[UserListItem])
def list_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    category: str | None = Query(None, description="Filter by creative category"),
    lat: float | None = Query(None, ge=-90, le=90),
    lng: float | None = Query(None, ge=-180, le=180),
    radius_km: float = Query(50, gt=0, le=500),
    limit: int = Query(50, gt=0, le=200),
):
    """
    Discover users. Supports filtering by category and geo radius.
    Excludes the requesting user (you don't show up in your own search).
    """
    q = db.query(User).filter(
        User.id != current_user.id,
        User.is_active == True,  # noqa: E712
        User.category.isnot(None),  # only show users who finished onboarding
    )

    if category:
        q = q.filter(User.category == category)

    # Geo filter — bounding box pre-filter, then exact haversine
    if lat is not None and lng is not None:
        min_lat, max_lat, min_lng, max_lng = bounding_box(lat, lng, radius_km)
        q = q.filter(
            and_(
                User.lat.between(min_lat, max_lat),
                User.lng.between(min_lng, max_lng),
            )
        )

    candidates = q.limit(limit * 3).all()  # over-fetch since some may fail haversine

    # Compute exact distance, filter by radius, sort by distance
    if lat is not None and lng is not None:
        results = []
        for u in candidates:
            if u.lat is None or u.lng is None:
                continue
            d = haversine_km(lat, lng, u.lat, u.lng)
            if d <= radius_km:
                u.distance_km = round(d, 2)
                results.append(u)
        results.sort(key=lambda u: u.distance_km)
        return results[:limit]

    return candidates[:limit]


@router.get("/{user_id}", response_model=UserPublic)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),  # require auth
):
    """Public profile of any user."""
    user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
    return user