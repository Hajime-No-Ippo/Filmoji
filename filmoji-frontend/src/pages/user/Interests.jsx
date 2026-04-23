import { useMemo, useState } from "react";

const ALLOWED_CATEGORIES = [
  "Action",
  "Adventure",
  "Animation",
  "Comedy",
  "Crime",
  "Documentary",
  "Drama",
  "Family",
  "Fantasy",
  "History",
  "Horror",
  "Music",
  "Mystery",
  "Romance",
  "Sci-Fi",
  "Thriller",
  "War",
  "Western",
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
    // Handle object array format [{id, name}, ...] or string array
    return raw
      .map((item) => {
        // If item is an object with 'name' property, extract the name
        if (typeof item === "object" && item !== null && "name" in item) {
          return normalizeGenre(item.name);
        }
        // Otherwise treat as string
        return normalizeGenre(item);
      })
      .filter(Boolean);
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
  console.log("🔍 buildCategoryStats Full Debug:", {
    allMoviesType: typeof allMovies,
    isArray: Array.isArray(allMovies),
    allMoviesLength: allMovies?.length,
    allMoviesFullArray: allMovies,
    firstElement: allMovies?.[0],
    firstElementType: typeof allMovies?.[0],
    reviewsLength: reviews?.length,
    firstReview: reviews?.[0],
  });

  const movieById = new Map((allMovies || []).map((m) => [m.id, m]));

  const stats = new Map();
  for (const category of ALLOWED_CATEGORIES) {
    stats.set(category, { count: 0, sum: 0 });
  }

  let matchedCount = 0;
  let unmatchedGenres = new Set();

  for (const review of reviews || []) {
    const movie = movieById.get(review.movieId);
    if (!movie) continue;

    const rating = Number(review.rating);
    if (!Number.isFinite(rating)) continue;

    const genres = parseMovieGenres(movie);
    console.log(`📽️ Movie: ${movie.title}`, {
      rawGenres: movie.genres,
      parsedGenres: genres,
      matchedGenres: genres.filter((g) => ALLOWED_CATEGORIES.includes(g)),
    });

    const categories = new Set(
      genres.filter((g) => ALLOWED_CATEGORIES.includes(g)),
    );

    if (categories.size > 0) {
      matchedCount++;
    } else {
      genres.forEach((g) => unmatchedGenres.add(g));
    }

    for (const category of categories) {
      const current = stats.get(category);
      if (!current) continue;
      current.count += 1;
      current.sum += rating;
    }
  }

  console.log("📊 Stats Summary:", {
    matchedMovies: matchedCount,
    unmatchedGenres: Array.from(unmatchedGenres),
  });

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
  const [showAll, setShowAll] = useState(false);

  const { rows, maxAvg } = useMemo(
    () => buildCategoryStats({ reviews, allMovies }),
    [reviews, allMovies],
  );

  // Detailed debugging log
  console.log("🎬 Interests Component Debug:", {
    reviews: reviews ? `${reviews.length} reviews` : "No reviews",
    allMovies: allMovies ? `${allMovies.length} movies` : "No movies",
    rows: rows ? `${rows.length} categories` : "No rows",
    firstReview: reviews?.[0],
    firstMovie: allMovies?.[0],
    maxAvg,
  });

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
            {rows.slice(0, showAll ? rows.length : 5).map((row) => {
              const widthPct = maxAvg
                ? Math.max(18, Math.round((row.avg / maxAvg) * 100))
                : 0;

              console.log("📊 Row Debug:", {
                category: row.category,
                avg: row.avg,
                maxAvg,
                widthPct,
              });

              return (
                <div
                  key={row.category}
                  className="relative rounded-2xl overflow-hidden shadow-md"
                  style={{ backgroundColor: "var(--color-card)" }}
                >
                  <div
                    className="absolute inset-y-0 left-0 transition-all"
                    style={{
                      width: `${widthPct}%`,
                      backgroundColor: "var(--color-mood-blue)",
                      opacity: 0.2,
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

            {rows.length > 5 && (
              <div className="mt-4 text-center">
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="text-sm font-semibold transition-colors hover:opacity-80"
                  style={{ color: "var(--color-mood-blue)" }}
                >
                  {showAll ? "Show less" : "See more"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
