"""
FastAPI app entry point. This is what uvicorn runs.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, engine
from app.models import user as user_model  # noqa: F401 — import so the table is registered
from app.routers import auth


# Create database tables on startup.
# (For real schema changes later we'll switch to Alembic migrations — for now this is fine.)
Base.metadata.create_all(bind=engine)


app = FastAPI(
    title=settings.APP_NAME,
    description="The hub for creatives. Connekkt the dots.",
    version="0.1.0",
)

# CORS — allows our frontend (which runs on a different port) to call this API.
# In production we'll lock this down to our actual domain.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5500", "http://127.0.0.1:5500", "*"],  # Live Server defaults
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Mount the auth router
app.include_router(auth.router)


@app.get("/")
def root():
    """Sanity-check endpoint."""
    return {
        "app": settings.APP_NAME,
        "status": "running",
        "docs": "/docs",
    }