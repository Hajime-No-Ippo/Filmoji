import { Link } from "react-router-dom";
import { useWatchlist } from "../watchlist/WatchlistContext";

function MovieCard({ movie, showWatchlistButton = true }) {
  const { user, isInWatchlist, toggleWatchlist } = useWatchlist();
  const inWatchlist = isInWatchlist(movie?.id);

  return (
    <div className="group">
      <Link to={`/movie/${movie.id}`} className="block no-underline">
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <img
            src={movie.poster}
            alt={movie.title}
            className="aspect-[2/3] w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        </div>
        <div className="pt-3">
          <h3 className="text-sm font-semibold leading-snug text-ink">
            {movie.title}
          </h3>
          {movie.year && (
            <p className="mt-1 text-xs text-muted">{movie.year}</p>
          )}
        </div>
      </Link>

      {user && showWatchlistButton ? (
        <button
          type="button"
          onClick={() => toggleWatchlist(movie.id)}
          className="mt-3 w-full rounded-lg px-3 py-2 text-sm font-semibold transition"
          style={
            inWatchlist
              ? {
                  backgroundColor: "var(--color-mood-blue)",
                  color: "var(--color-card)",
                }
              : {
                  backgroundColor: "var(--color-card)",
                  color: "var(--color-mood-blue)",
                  border: "1px solid var(--color-mood-blue)",
                }
          }
        >
          {inWatchlist ? "In Watchlist" : "+ Add to Watchlist"}
        </button>
      ) : null}
    </div>
  );
}

export default MovieCard;
