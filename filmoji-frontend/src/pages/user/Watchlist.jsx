import { Link } from "react-router-dom";
import { useWatchlist } from "../../components/watchlist/WatchlistContext";

function Watchlist({ allMovies }) {
  const { watchlist, loading } = useWatchlist();

  const count = watchlist.length;

  return (
    <div
      className="rounded-2xl p-6 shadow-lg"
      style={{ backgroundColor: "var(--color-card)" }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2
            className="text-2xl font-bold"
            style={{ color: "var(--color-ink)" }}
          >
            Watchlist
          </h2>
          <span
            className="text-sm font-semibold"
            style={{ color: "var(--color-muted)" }}
          >
            {count}
          </span>
        </div>
      </div>

      {loading ? (
        <p className="mt-2" style={{ color: "var(--color-muted)" }}>
          Loading...
        </p>
      ) : count === 0 ? (
        <p className="mt-2" style={{ color: "var(--color-muted)" }}>
          No movies in your watchlist yet.
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <div className="flex gap-6 pb-2">
            {watchlist.map((movieId) => {
              const movie = allMovies?.find((m) => m.id === movieId);
              const poster =
                movie?.posterUrl ||
                movie?.poster ||
                movie?.posterPath ||
                movie?.poster_path ||
                "";

              return (
                <Link
                  key={movieId}
                  to={`/movie/${movieId}`}
                  className="shrink-0 w-40 rounded-2xl shadow-lg overflow-hidden no-underline"
                  style={{ backgroundColor: "var(--color-card)" }}
                >
                  {poster ? (
                    <img
                      src={poster}
                      alt={movie?.title || `Movie #${movieId}`}
                      className="aspect-[2/3] w-full object-cover"
                    />
                  ) : (
                    <div
                      className="aspect-[2/3] w-full flex items-center justify-center"
                      style={{ backgroundColor: "var(--color-card-hover)" }}
                    >
                      <span style={{ color: "var(--color-muted)" }}>
                        No poster
                      </span>
                    </div>
                  )}

                  <div className="p-3">
                    <div
                      className="text-sm font-semibold leading-snug line-clamp-2"
                      style={{ color: "var(--color-ink)" }}
                      title={movie?.title || `Movie #${movieId}`}
                    >
                      {movie?.title || `Movie #${movieId}`}
                    </div>
                    {movie?.year ? (
                      <div
                        className="mt-1 text-xs"
                        style={{ color: "var(--color-muted)" }}
                      >
                        {movie.year}
                      </div>
                    ) : null}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default Watchlist;
