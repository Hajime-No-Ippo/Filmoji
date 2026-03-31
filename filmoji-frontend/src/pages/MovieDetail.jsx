import { useParams, Link } from 'react-router-dom'
import { featuredMovies } from '../data/movies'
import { useMoviesWithPosters } from '../hooks/useMoviesWithPosters'
import { ContainerScroll } from '../components/ContainerScroll'

function MovieDetail() {
  const { id } = useParams()
  const { movies, loading } = useMoviesWithPosters(featuredMovies)
  const movie = loading
    ? featuredMovies.find((m) => m.id === parseInt(id))
    : movies.find((m) => m.id === parseInt(id))

  if (!movie) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <div className="text-center">
          <p className="text-xl mb-4">Movie not found.</p>
          <Link to="/" className="accent-link">← Back to Home</Link>
        </div>
      </div>
    )
  }

  const titleComponent = (
    <div className="pt-24 pb-4 px-4">
      <div className="flex flex-wrap justify-center gap-2 mb-4">
        {movie.genres.map((g) => (
          <span key={g} className="text-xs px-3 py-1 rounded-full border border-accent text-accent uppercase tracking-widest">
            {g}
          </span>
        ))}
      </div>
      <h1 className="text-4xl md:text-6xl font-bold text-ink mb-3 tracking-tight">
        {movie.title}
      </h1>
      <p className="text-muted text-lg mb-6">{movie.year}</p>
      <div className="flex items-center justify-center gap-6 text-sm text-muted">
        <div className="flex items-center gap-1">
          <span className="text-yellow-500 text-xl">★</span>
          <span className="text-2xl font-bold text-ink">{movie.rating}</span>
          <span className="text-muted">/10 IMDb</span>
        </div>
      </div>
    </div>
  )

  return (
    <div className="bg-dark min-h-screen">
      <div className="absolute top-6 left-6 z-10">
        <Link to="/" className="nav-link flex items-center gap-2 text-sm">
          ← Back
        </Link>
      </div>

      <ContainerScroll titleComponent={titleComponent}>
        {/* Card content */}
        <div className="h-full w-full flex flex-col md:flex-row gap-6 p-4 md:p-6 text-white">
          {/* Poster */}
          <img
            src={movie.poster}
            alt={movie.title}
            className="w-full md:w-48 h-60 md:h-full object-cover rounded-xl shrink-0"
          />

          {/* Info */}
          <div className="flex flex-col justify-between flex-1 overflow-auto">
            <div>
              <h2 className="text-xl font-bold mb-1">{movie.title}</h2>
              <p className="text-white/50 text-sm mb-4">{movie.year} · {movie.genres.join(', ')}</p>
              <p className="text-white/70 text-sm leading-relaxed mb-6">
                A cinematic masterpiece that has captivated audiences worldwide.
                Explore themes of {movie.genres.join(' and ').toLowerCase()} in this
                unforgettable journey.
              </p>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/5 rounded-xl p-3 text-center">
                <p className="text-yellow-400 text-2xl font-bold">{movie.rating}</p>
                <p className="text-white/40 text-xs mt-1">IMDb</p>
              </div>
              <div className="bg-white/5 rounded-xl p-3 text-center">
                <p className="text-accent text-2xl font-bold">{movie.year}</p>
                <p className="text-white/40 text-xs mt-1">Year</p>
              </div>
              <div className="bg-white/5 rounded-xl p-3 text-center">
                <p className="text-white text-lg font-bold">{movie.genres[0]}</p>
                <p className="text-white/40 text-xs mt-1">Genre</p>
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <Link
                to="/reviews"
                className="flex-1 text-center py-2 rounded-lg bg-accent hover:bg-accent-hover text-white text-sm font-semibold transition-colors no-underline"
              >
                Read Reviews
              </Link>
              <Link
                to="/"
                className="flex-1 text-center py-2 rounded-lg border border-white/20 hover:bg-white/10 text-white text-sm transition-colors no-underline"
              >
                More Movies
              </Link>
            </div>
          </div>
        </div>
      </ContainerScroll>

      <>
      <div>
        <p>{movie.title} Ratings & Reviews:</p>
        
      </div>
      </>
    </div>
  )
}

export default MovieDetail
