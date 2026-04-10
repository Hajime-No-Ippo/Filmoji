import { useMemo } from "react";

const ALLOWED_CATEGORIES = [
  "Drama",
  "Comedy",
  "Romance",
  "Action",
  "Adventure",
  "Thriller",
  "Horror",
  "Sci-Fi",
];

function normalizeGenre(raw) {
  if (!raw) return null;
  const g = String(raw).trim();
  if (!g) return null;

  const lower = g.toLowerCase();
  if (lower === "science fiction") return "Sci-Fi";
  if (lower === "sci fi" || lower === "scifi" || lower === "sci-fi")
    return "Sci-Fi";

  // Simple title-case for common genres
  return g
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

function parseMovieGenres(movie) {
  const raw = movie?.genres;

  if (Array.isArray(raw)) {
    return raw.map(normalizeGenre).filter(Boolean);
  }

  if (typeof raw === "string") {
    return raw
      .split(",")
      .map((s) => normalizeGenre(s))
      .filter(Boolean);
  }

  return [];
}

function formatAverage(avg) {
  if (!Number.isFinite(avg)) return "0.0";
  return avg.toFixed(1);
}

function buildCategoryStats({ reviews, allMovies }) {
  const movieById = new Map((allMovies || []).map((m) => [m.id, m]));

  const stats = new Map();
  for (const category of ALLOWED_CATEGORIES) {
    stats.set(category, { count: 0, sum: 0 });
  }

  for (const review of reviews || []) {
    const movie = movieById.get(review.movieId);
    if (!movie) continue;

    const rating = Number(review.rating);
    if (!Number.isFinite(rating)) continue;

    const genres = parseMovieGenres(movie);
    const categories = new Set(
      genres.filter((g) => ALLOWED_CATEGORIES.includes(g)),
    );

    for (const category of categories) {
      const current = stats.get(category);
      if (!current) continue;
      current.count += 1;
      current.sum += rating;
    }
  }

  const rows = Array.from(stats.entries())
    .map(([category, { count, sum }]) => ({
      category,
      count,
      avg: count ? sum / count : 0,
    }))
    .filter((r) => r.count > 0)
    // Requirement: sort by rating high -> low
    .sort((a, b) => b.avg - a.avg || b.count - a.count);

  const maxAvg = rows.reduce((acc, r) => Math.max(acc, r.avg), 0);

  return { rows, maxAvg };
}

export default function Interests({ reviews, allMovies }) {
  const { rows, maxAvg } = useMemo(
    () => buildCategoryStats({ reviews, allMovies }),
    [reviews, allMovies],
  );

  return (
    <div
      className="rounded-2xl p-6 shadow-lg"
      style={{ backgroundColor: "var(--color-card)" }}
    >
      <h2 className="text-2xl font-bold" style={{ color: "var(--color-ink)" }}>
        Interests
      </h2>
      <p className="mt-2" style={{ color: "var(--color-muted)" }}>
        Top interests related to my ratings.
      </p>

      <div className="mt-6">
        <div
          className="text-sm font-bold tracking-wide"
          style={{ color: "var(--color-ink)" }}
        >
          TOP RATED
          <div
            className="mt-3 h-1 w-48"
            style={{ backgroundColor: "var(--color-mood-blue)" }}
          />
        </div>

        {rows.length === 0 ? (
          <div className="mt-6 text-sm" style={{ color: "var(--color-muted)" }}>
            No ratings yet.
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {rows.slice(0, 8).map((row) => {
              const widthPct = maxAvg
                ? Math.max(18, Math.round((row.avg / maxAvg) * 100))
                : 0;

              return (
                <div
                  key={row.category}
                  className="relative rounded-2xl overflow-hidden shadow-md"
                  style={{ backgroundColor: "var(--color-card)" }}
                >
                  <div
                    className="absolute inset-y-0 left-0"
                    style={{
                      width: `${widthPct}%`,
                      backgroundColor: "var(--color-mood-blue)",
                      opacity: 0.12,
                    }}
                  />

                  <div className="relative p-4 flex items-center justify-between gap-4">
                    <div>
                      <div
                        className="text-lg font-semibold"
                        style={{ color: "var(--color-ink)" }}
                      >
                        {row.category}
                      </div>

                      <div
                        className="mt-1 flex items-center gap-3 text-sm"
                        style={{ color: "var(--color-ink)" }}
                      >
                        <span className="font-semibold">
                          {row.count} ratings
                        </span>
                        <span style={{ color: "var(--color-muted)" }}>•</span>
                        <span style={{ color: "var(--color-accent)" }}>★</span>
                        <span className="font-semibold">
                          {formatAverage(row.avg)}
                        </span>
                        <span style={{ color: "var(--color-muted)" }}>
                          average
                        </span>
                      </div>
                    </div>

                    <div
                      className="text-2xl"
                      style={{ color: "var(--color-muted)" }}
                    >
                      ›
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
