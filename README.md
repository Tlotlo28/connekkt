<div align="center">

# Connekkt 🎨

**A location-aware social discovery app for creatives.**
*Connekkt the dots.*

[Live Demo](https://connekkt.pages.dev) · [Report a bug](https://github.com/Tlotlo28/connekkt/issues)

</div>

---

## What is this?

Pretoria has a vibrant creative scene — producers, designers, photographers, videographers, marketers — but most creatives find each other through Instagram hashtags or word-of-mouth. Both are unreliable.

**Connekkt** is a map-based platform for creatives to discover each other based on location. Open the app, see who's nearby, scan the area by holding a button, find your people. Each creative field has its own colour and shape on the map, so a glance tells you what kind of creative you're looking at.

> **Try the live demo:** [connekkt.pages.dev](https://connekkt.pages.dev) — tap **"Try the demo →"** on the welcome screen for instant access.
>
> ⚠️ **First load may take ~30 seconds.** Running on free hosting; the backend sleeps when idle and takes a moment to wake up.

---

## Highlights

- **Real-time geolocation + map-based discovery** powered by Leaflet + OpenStreetMap
- **Radius scanning** — hold a button to grow your search radius, releasing reveals nearby creatives with a staggered animation
- **12 creative categories**, each with its own colour and geometric shape (designers = coral squares, musicians = amber hexagons, photographers = teal circles, etc.)
- **Cinematic profile pages** with vertical photo scroll, parallax-style ken-burns zoom, frosted-glass action buttons, customisable category-coloured fade overlay, and a double-tap "focus mode"
- **Full authentication system** — JWT tokens, bcrypt password hashing, persistent sessions via localStorage
- **Server-side distance queries** using the Haversine formula with bounding-box pre-filtering
- **Mobile-first responsive design** — works on phones, tablets, and desktops with a magazine-spread layout on wider screens
- **Client-side image cropping** with Cropper.js so users can adjust photos to the required 3:4 portrait ratio

---

## Tech stack

| Layer | Tech |
|---|---|
| Frontend | Vanilla JavaScript, HTML5, CSS3 |
| Maps | Leaflet.js + CartoDB Dark Matter tiles |
| Image cropping | Cropper.js |
| Backend | Python 3.12, FastAPI |
| Database | PostgreSQL (production) / SQLite (development) |
| ORM | SQLAlchemy 2.0 |
| Auth | JWT (python-jose) + bcrypt |
| Validation | Pydantic v2 |
| Hosting | Render (backend) + Cloudflare Pages (frontend) |

Notably **no frontend framework** — the entire UI is hand-written vanilla JS to keep things fast, lightweight, and to demonstrate fundamentals rather than lean on abstractions.

---

## Architecture
┌──────────────────────┐         ┌────────────────────────┐
│  Cloudflare Pages    │  HTTPS  │    Render Web Service  │
│  (static frontend)   │ ──────► │      (FastAPI)         │
│                      │ ◄────── │                        │
│  Leaflet + vanilla JS│   JSON  │  JWT auth, geo queries │
└──────────────────────┘         └────────────┬───────────┘
│
▼
┌────────────────────────┐
│   Render PostgreSQL    │
│   (users, photos, etc) │
└────────────────────────┘

---

## Key features

### 🗺 Map-based discovery

The home screen is a full-bleed dark map showing every creative as a coloured, shape-coded pin. Single-click a pin for a quick popup; double-click to open the full profile. A view toggle lets you switch between map and list view, with distance readouts.

### The scan button

Inspired by Uber's pulse animation, holding the central scan button grows a translucent radius circle on the map (500m → 10km). Releasing fades non-matching creatives and reveals matching ones with a staggered fade-in animation.

### Cinematic profile pages

Each profile is built like a film poster, not a database row. Full-bleed photo carousel, vertical scroll with snap-to-photo behaviour, gentle ken-burns zoom on the active photo, a fixed gradient fade in the user's category colour, and a top bar of frosted-glass controls that float over the photos.

Profile owners can:
- Edit their bio, tags, social links, and contact info
- Cycle the fade colour through any of the 12 category palettes
- Add up to 3 portrait photos with built-in 3:4 cropping

### Creative DNA tags

Beyond the main category, users tag themselves with short style descriptors ("afrohouse", "minimalist", "lo-fi"). Helps the right collaborators find each other beyond just "I need a designer."

###  Privacy-aware contact info

The contact modal shows whatever the user chose to share (email, WhatsApp, a freeform note) with direct deep links (`mailto:`, `tel:`, `wa.me/`). Empty state for users who prefer to keep things on-platform.

---

## Status & roadmap

This is an **active build**. The core experience works; some features are in progress.

**Currently working:**
- Auth (signup, login, JWT sessions, logout)
- Onboarding flow (multi-step wizard with photo cropping)
- Map discovery + scan + filter
- Profile pages (own + others')
- Edit profile
- Demo login bypass for portfolio viewing

**Known issues:**
- 🐛 New-user signup occasionally drops profile fields silently (under investigation)
- 🐛 Fade colour picker showing only 2 of 8 expected colours on some browsers

**Roadmap (v2):**
- **Collab Board** — creatives post briefs, others browse and reach out
- **Real-time messaging** with WebSockets
- **"Vibe Mode"** — live availability toggle
- **Connekkt Trail** — collab history on profiles for trust signalling
- **Verified Creative** badge system
- **Push notifications**
- **Move photo storage** from base64-in-DB to Cloudflare R2 object storage
- **Forgot password** flow with email service
- **Per-field contact privacy controls** (public / verified-only / private)

---

## Run locally

You'll need Python 3.12 and Node-free dev tools.

```bash
# 1. Clone
git clone https://github.com/Tlotlo28/connekkt.git
cd connekkt

# 2. Set up Python environment
py -3.12 -m venv .venv
.\.venv\Scripts\Activate.ps1     # Windows
# source .venv/bin/activate       # Mac/Linux

# 3. Install dependencies
pip install -r requirements.txt

# 4. Create your .env from the template
cp .env.example .env
# Edit .env and set JWT_SECRET_KEY to a random string

# 5. Run the backend
cd backend
uvicorn app.main:app --reload --port 8000

# 6. In a separate terminal, serve the frontend
# Open frontend/index.html with VS Code's Live Server extension,
# or run a simple Python server:
cd frontend
python -m http.server 5500
```

Then open [http://127.0.0.1:5500](http://127.0.0.1:5500) in your browser.

The backend API docs are auto-generated at [http://localhost:8000/docs](http://localhost:8000/docs).

---

## Lessons learned

Building this taught me more than any tutorial could, especially:

- **The difference between a 200 OK and a successful operation.** Network requests can return success codes while silently dropping data. Trusting status codes alone is a beginner trap.
- **Why production environments will always differ from local dev** — Python versions, database engines, file paths, encoding. Pinning everything explicitly is the only way to stay sane.
- **The art of "shipping at 80%."** Polishing forever is how portfolios die in drawers. Connekkt isn't done. It's deployed.
- **Real geospatial queries** with the Haversine formula and bounding-box optimisation — and when to graduate to PostGIS.

---

## Contact

Built by **Tlotlo Masisi** in Pretoria, South Africa.

If you're a creative who'd actually use this, or a recruiter who wants to talk, find me:

- **Live app:** [connekkt.pages.dev](https://connekkt.pages.dev)
- **LinkedIn:** [[Your LinkedIn URL](https://www.linkedin.com/in/tlotlo-masisi-49b0b014a/)]
- **Email:** tlotlomasisi66@gmail.com

If you're also Modisa-curious: I make Afrohouse + Afrotech 🎧
[Spotify](https://open.spotify.com/artist/2O0fopkATrQcBkRmYasrNW) · [Apple Music](https://music.apple.com/us/artist/modisa/1541279621) · [YouTube](https://www.youtube.com/@modisatm4867)

---

<div align="center">

**If this project resonates, star the repo. It helps more than you'd think.**

</div>