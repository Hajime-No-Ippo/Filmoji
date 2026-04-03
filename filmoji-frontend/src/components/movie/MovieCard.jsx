import { Link } from 'react-router-dom'

function MovieCard({ movie }) {
  return (
    <Link
      to={`/movie/${movie.id}`}
      className="group block no-underline"
    >
      <div className="overflow-hidden rounded-2xl border border-border bg-card"
      >
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
          <p className="mt-1 text-xs text-muted">
            {movie.year}
          </p>
        )}
      </div>
    </Link>
  )
}

export default MovieCard
