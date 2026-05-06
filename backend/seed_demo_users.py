"""
Seeds 5 demo creatives into the database.
Run with: python seed_demo_users.py
Idempotent — safe to run multiple times. Won't duplicate users.
"""

from app.database import SessionLocal, Base, engine
from app.models.user import User
from app.core.security import hash_password


# Make sure tables exist
Base.metadata.create_all(bind=engine)


# Real-feeling demo creatives. Locations clustered around Pretoria.
# Photos are from Unsplash's free API — already 3:4 portrait, no licensing issues.
DEMO_USERS = [
    {
        "email": "naledi@demo.connekkt",
        "name": "Naledi M.",
        "category": "photographer",
        "subcategories": ["Portrait", "Street", "Fashion"],
        "bio": "Portrait + street work, Pretoria-based. Always chasing that golden hour. Down to collab on editorials and music shoots.",
        "tags": ["portrait", "street", "afrofuturism", "lo-fi"],
        "photos": [
            "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&h=1066&fit=crop",
            "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=800&h=1066&fit=crop",
        ],
        "socials": [
            {"type": "instagram", "url": "https://instagram.com/naledi_demo"},
            {"type": "behance", "url": "https://behance.net/naledi"},
        ],
        "contact": {"email": "naledi@demo.connekkt", "note": "DM on Instagram first — I check it daily."},
        "lat": -25.7510, "lng": 28.1925,
    },
    {
        "email": "kabelo@demo.connekkt",
        "name": "Kabelo D.",
        "category": "designer",
        "subcategories": ["Branding", "Type", "Posters"],
        "bio": "Brand identity + type. I make confusing things less confusing. Open to gig posters, album art, and the occasional zine.",
        "tags": ["branding", "minimalist", "experimental", "type"],
        "photos": [
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=1066&fit=crop",
        ],
        "socials": [
            {"type": "behance", "url": "https://behance.net/kabelo"},
            {"type": "dribbble", "url": "https://dribbble.com/kabelo"},
            {"type": "website", "url": "https://kabelo.studio"},
        ],
        "contact": {"email": "kabelo@demo.connekkt"},
        "lat": -25.7445, "lng": 28.1812,
    },
    {
        "email": "amahle@demo.connekkt",
        "name": "Amahle B.",
        "category": "videographer",
        "subcategories": ["Music videos", "Short films", "Documentary"],
        "bio": "Music videos and short docs. Shot a couple things you might've seen on YouTube. Looking for vocalists with a story to tell.",
        "tags": ["music videos", "doc", "cinematic", "afrofuturism"],
        "photos": [
            "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=800&h=1066&fit=crop",
            "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&h=1066&fit=crop",
            "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&h=1066&fit=crop",
        ],
        "socials": [
            {"type": "youtube", "url": "https://youtube.com/@amahle_demo"},
            {"type": "vimeo", "url": "https://vimeo.com/amahle"},
            {"type": "instagram", "url": "https://instagram.com/amahle_demo"},
        ],
        "contact": {"whatsapp": "+27 71 555 0123", "note": "Best to WhatsApp for quick replies."},
        "lat": -25.7398, "lng": 28.1995,
    },
    {
        "email": "sipho@demo.connekkt",
        "name": "Sipho N.",
        "category": "musician",
        "subcategories": ["Amapiano", "Jazz", "DJ"],
        "bio": "Producer + DJ. Amapiano roots, jazz heart. Open to collabs with vocalists, instrumentalists, and visual artists who get the vibe.",
        "tags": ["amapiano", "jazz", "house", "experimental"],
        "photos": [
            "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&h=1066&fit=crop",
            "https://images.unsplash.com/photo-1564564321837-a57b7070ac4f?w=800&h=1066&fit=crop",
        ],
        "socials": [
            {"type": "spotify", "url": "https://open.spotify.com/artist/sipho_demo"},
            {"type": "soundcloud", "url": "https://soundcloud.com/sipho_demo"},
            {"type": "instagram", "url": "https://instagram.com/sipho_demo"},
        ],
        "contact": {"email": "sipho@demo.connekkt"},
        "lat": -25.7560, "lng": 28.1845,
    },
    {
        "email": "lerato@demo.connekkt",
        "name": "Lerato K.",
        "category": "uiux",
        "subcategories": ["Mobile", "Design Systems", "Prototyping"],
        "bio": "Product designer based in Pretoria. Mobile-first thinking, design systems nerd. Looking for engineers and PMs to ship something real.",
        "tags": ["mobile", "design systems", "minimalist"],
        "photos": [
            "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&h=1066&fit=crop",
        ],
        "socials": [
            {"type": "dribbble", "url": "https://dribbble.com/lerato_demo"},
            {"type": "linkedin", "url": "https://linkedin.com/in/lerato_demo"},
            {"type": "github", "url": "https://github.com/lerato_demo"},
            {"type": "website", "url": "https://lerato.design"},
        ],
        "contact": {"email": "lerato@demo.connekkt", "whatsapp": "+27 82 555 0456"},
        "lat": -25.7472, "lng": 28.2087,
    },
]


def seed():
    db = SessionLocal()
    try:
        for data in DEMO_USERS:
            existing = db.query(User).filter(User.email == data["email"]).first()
            if existing:
                # Update fields in case we tweaked them
                for k, v in data.items():
                    if k not in ("email",):
                        setattr(existing, k, v)
                print(f"  Updated {data['name']}")
            else:
                user = User(
                    email=data["email"],
                    hashed_password=hash_password("demo-password-not-used"),
                    name=data["name"],
                    category=data["category"],
                    subcategories=data["subcategories"],
                    bio=data["bio"],
                    tags=data["tags"],
                    photos=data["photos"],
                    socials=data["socials"],
                    contact=data["contact"],
                    lat=data["lat"],
                    lng=data["lng"],
                )
                db.add(user)
                print(f"  Created {data['name']}")
        db.commit()
        print(f"\n✓ {len(DEMO_USERS)} demo users seeded.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()