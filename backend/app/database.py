"""
Database connection. SQLAlchemy is our ORM (Object-Relational Mapper) —
it lets us write Python classes that map to database tables.
We never write raw SQL.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from app.config import settings

# create_engine is the connection to our database.
# `connect_args={"check_same_thread": False}` is a SQLite quirk — it lets
# multiple FastAPI requests share the same connection. Not needed for Postgres.
engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {},
)

# A SessionLocal is a "session" — one unit of work with the database.
# Each API request gets its own session, then closes it when done.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class that all our model classes inherit from.
Base = declarative_base()


def get_db():
    """
    Dependency injection: FastAPI calls this for every request that needs the DB.
    Yields a session, then closes it (even if the request crashed).
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()