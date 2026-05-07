#!/bin/bash
python seed_demo_users.py || echo "Seed skipped (probably already seeded)"
uvicorn app.main:app --host 0.0.0.0 --port $PORT