# 🎬 Filmoji

**Pick an emoji, get a movie.** Filmoji turns a mood — 😱, 🥹, 🚀, 🕵️ — into film
recommendations by embedding emojis and movies into the same vector space and
matching them with semantic similarity. *When Spring Boot happened to AI.*

---

## What it does

- **Emoji → movie recommendations.** Choose one or several emojis; the AI
  service embeds them and finds the nearest movies in a pgvector index.
- **Multi-emoji blends.** Combine emojis to shape the query (`🚀 + 😂` ≠ `🚀`
  alone).
- **Onboarding that learns your taste.** A Buzzfeed-style quiz plus a
  Tinder-style swipe build a personal **profile vector**, blended with each
  query (80/20) so recommendations lean toward you.
- **Watchlist, movie detail, interests, reviews** — browsing on top of the
  emoji engine.

## Architecture

Four services, one `docker-compose.yml`:

```
                 ┌────────────────────────┐
   browser  ───▶ │ frontend  (nginx :80)  │   React 19 + Vite, Firebase auth
                 └───────────┬────────────┘
                             │ /api proxy
                 ┌───────────▼────────────┐
                 │ backend   (:8080)      │   Spring Boot (Java) — TMDB lookups,
                 └───────────┬────────────┘   watchlist/auth, recommend endpoints
                             │
                 ┌───────────▼────────────┐
                 │ ai-service (:8000)     │   FastAPI + sentence-transformers —
                 └───────────┬────────────┘   emoji/movie embeddings, similarity
                             │
                 ┌───────────▼────────────┐
                 │ db (pgvector)          │   Postgres + vector, ivfflat recall
                 └────────────────────────┘
```

## Tech stack

| Service | Stack |
|---------|-------|
| **frontend** | React 19, Vite 8, Firebase (auth), served by nginx |
| **backend** | Spring Boot (Java), Actuator health, TMDB integration |
| **ai-service** | FastAPI, Uvicorn, `sentence-transformers`, `psycopg2` |
| **db** | `ankane/pgvector` (Postgres + pgvector, `ivfflat` index) |

## The recommendation pipeline

The AI service (`python-ai-service/`) owns the vector data:

1. `import_tmdb.py` — pull movies + metadata from TMDB into Postgres.
2. `generate_vectors.py` — embed each movie into a vector column.
3. `generate_emoji_embeddings.py` — embed the emoji vocabulary into the same space.
4. `main.py` — the FastAPI service: embed an emoji query, `ivfflat` nearest-
   neighbour search over movie vectors, dedup, and (when signed in) blend the
   user's profile vector 80/20 before ranking.

Emojis and movies share one embedding space, so "closest movie to this emoji"
is just a vector search — no hand-tuned rules.

---

## Quick start (Docker)

**Prerequisites**
- Docker & Docker Compose
- A **TMDB API key** (required — powers the import and backend lookups)
- `firebase-service-account.json` (auth DB for your domain)

**Create `.env` at the repository root:**

```dotenv
TMDB_API_KEY=your_tmdb_api_key_here
# Optional overrides
DB_USER=postgres
DB_PASSWORD=postgres_password
DB_NAME=filmoji
HUGGINGFACE_API_TOKEN=your_hf_token
```

**Run — Windows PowerShell:**

```powershell
.\run-all.ps1            # validates .env, then compose up (with logs)
.\run-all.ps1 -Detached # detached
```

**Run — Linux / macOS:**

```bash
docker compose up --build       # add -d to detach
```

**Verify:**

| Service | URL |
|---------|-----|
| Frontend | http://localhost/ |
| Backend health | http://localhost:8080/actuator/health |
| AI service health | http://localhost:8000/health |

---

## Local development

Docker Compose is the supported path (the AI service has heavy ML deps). For
piecemeal local runs:

```bash
# frontend
cd filmoji-frontend && npm install && npm run dev

# ai-service (Python 3.10 recommended, e.g. via Conda)
cd python-ai-service && pip install -r requirements.txt && uvicorn main:app --reload --port 8000
```

The backend is a standard Spring Boot app (`filmoji-backend/`) — run it from
your IDE or `./mvnw spring-boot:run`, pointing `DB_*` at the pgvector instance.

## Notes

- `TMDB_API_KEY` is required; without it the import and TMDB lookups fail.
- Keep the AI service in Docker for team convenience (large model downloads);
  local Python works with Python 3.10.
- First boot runs the TMDB import + vector generation, so give it a minute
  before the emoji recommendations return results.
