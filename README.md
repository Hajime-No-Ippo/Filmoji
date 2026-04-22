# Filmoji — Quick Start (Docker)

This project can be started with Docker Compose. The following shows the minimal `.env` entries and recommended commands for your team.

**Prerequisites**
- Docker & Docker Compose
- A TMDB API key (required)
- firebase-service-account.json (Stores your domain's auth db)

**Create `.env` at the repository root**

.example `.env`:

TMDB_API_KEY=your_tmdb_api_key_here
# Optional overrides
DB_USER=postgres
DB_PASSWORD=postgres_password
DB_NAME=filmoji
HUGGINGFACE_API_TOKEN=your_hf_token

**Run (Windows PowerShell)**

```powershell
# Validates .env then runs compose (shows logs)
.\run-all.ps1

# Detached
.\run-all.ps1 -Detached
```

**Run (Linux / macOS)**

```bash
docker compose up --build
# or detached
docker compose up --build -d
```

**Verify**
- Frontend: http://localhost/ (nginx on port 80)
- Backend health: http://localhost:8080/actuator/health (or try `/api/actuator/health` if configured)
- AI service health: http://localhost:8000/health

Notes:
- `TMDB_API_KEY` is required for the TMDB import and backend TMDB lookups.
- Keep the AI service in Docker for team convenience (heavy ML dependencies). If you prefer local Python, use Conda with Python 3.10.


