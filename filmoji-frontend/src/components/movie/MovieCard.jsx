import { Link } from 'react-router-dom'

function MovieCard({ movie }) {
  const poster = movie.posterUrl || movie.poster || movie.poster_url || movie.posterPath || movie.poster_path || null
//   for (let i = 0; i < 10; i++) {
//   const movie = movies[i];
//   return <div>MoveCard{movie.title}</div>
// }
  return (
    <Link
      to={`/movie/${movie.id}`}
      className="group block no-underline"
    >
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        {poster ? (
          <img
            src={poster}
            alt={movie.title}
            className="aspect-[2/3] w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="aspect-[2/3] w-full flex items-center justify-center text-muted text-sm">
            No poster
          </div>
        )}
      </div>
      <div className="pt-3">
        <h3 className="text-sm font-semibold leading-snug text-ink">
          {movie.title}
        </h3>
        {movie.year && (
          <p className="mt-1 text-xs text-muted">
            {movie.year}
          </p>
        )}
      </div>
    </Link>
  )
}

export default MovieCard
