"""
Geo utilities. Pure functions, no DB knowledge.
We'll use SQLAlchemy to filter users in Python after fetching them, which
is fine for our MVP scale. For a production app with 100k+ users we'd push
this into a SQL function or migrate to PostGIS.
"""

from math import radians, sin, cos, asin, sqrt


EARTH_RADIUS_KM = 6371.0


def haversine_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """
    Great-circle distance between two lat/lng points, in kilometers.
    Returns ~0 for identical points, ~12,742 for opposite sides of the planet.
    """
    # Convert degrees to radians for trig functions
    lat1_r, lng1_r = radians(lat1), radians(lng1)
    lat2_r, lng2_r = radians(lat2), radians(lng2)

    # Differences
    dlat = lat2_r - lat1_r
    dlng = lng2_r - lng1_r

    # Haversine formula
    a = sin(dlat / 2) ** 2 + cos(lat1_r) * cos(lat2_r) * sin(dlng / 2) ** 2
    c = 2 * asin(sqrt(a))

    return EARTH_RADIUS_KM * c


def bounding_box(lat: float, lng: float, radius_km: float) -> tuple[float, float, float, float]:
    """
    Return (min_lat, max_lat, min_lng, max_lng) for a rough SQL pre-filter.
    Cheaper than haversine — we use it to throw out obvious non-matches first,
    THEN run haversine on the smaller set. Classic optimization pattern.
    """
    # 1 degree latitude ≈ 111 km everywhere
    lat_delta = radius_km / 111.0
    # 1 degree longitude shrinks toward the poles. cos(lat) corrects for it.
    lng_delta = radius_km / (111.0 * max(cos(radians(lat)), 0.01))

    return (
        lat - lat_delta,
        lat + lat_delta,
        lng - lng_delta,
        lng + lng_delta,
    )