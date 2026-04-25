import { Link } from 'react-router-dom'

function MovieCard({ movie, rank }) {
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
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card">
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
        {rank && (
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/80 to-transparent rounded-b-2xl z-10 flex items-end p-2">
            <span className="text-white font-bold text-2xl leading-none">
              #{rank}
            </span>
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
