# Run-all wrapper for Filmoji (Windows PowerShell)
# Validates .env has TMDB_API_KEY and starts the full stack via Docker Compose.

param(
    [switch]$Detached
)

$ErrorActionPreference = 'Stop'

# Load .env (simple parser)
if (Test-Path .env) {
    Get-Content .env | ForEach-Object {
        $_ = $_.Trim()
        if (-not [string]::IsNullOrWhiteSpace($_) -and -not $_.StartsWith('#')) {
            $parts = $_ -split '=', 2
            if ($parts.Count -eq 2) {
                $name = $parts[0].Trim()
                $value = $parts[1].Trim().Trim('"')
                if ($name.Length -gt 0 -and $value.Length -gt 0) {
                    $env:$name = $value
                }
            }
        }
    }
}

if (-not $env:TMDB_API_KEY) {
    Write-Host "TMDB_API_KEY is not set. Add TMDB_API_KEY=your_key to .env or export it in your environment." -ForegroundColor Red
    exit 1
}

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "Docker CLI not found in PATH. Please install Docker Desktop and ensure 'docker' is available." -ForegroundColor Red
    exit 1
}

Write-Host "Starting Filmoji full stack with Docker Compose..."
if ($Detached) {
    docker compose up --build -d
} else {
    docker compose up --build
}
