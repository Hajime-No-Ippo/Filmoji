import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
// import { featuredMovies } from '../data/movies'
import { useMoviesWithPosters, useMoviesTrailer } from '../../hooks/useMoviesAPIs'
import { ContainerScroll } from '../../components/effects/ContainerScroll/ContainerScroll'
import ReviewSnippetCard from '../../components/movie/ReviewSnippetCard'
import { db } from '../../../firebase'
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore'

function MovieDetail() {
  const { id } = useParams()
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)

useEffect(() => {
  fetch('/api/movies')
    .then(res => res.json())
    // .then(data => {
    //   setMovies(data)
    //   setLoading(false)
    // })
    .then(data => {
      const mapped = data.map(movie => ({
        ...movie,
        poster: movie.posterUrl || movie.poster || movie.poster_url,
        year: movie.releaseYear || movie.release_year,
        description: movie.synopsis
      }))
      setMovies(mapped)
    })
}, [])
  // const { movies, loading } = useMoviesWithPosters(featuredMovies)
  const movie = movies.find((m) => m.id === parseInt(id))
  //   ? featuredMovies.find((m) => m.id === parseInt(id))
  //   : movies.find((m) => m.id === parseInt(id))
  const { trailerKey: fetchedTrailerKey, loading: trailerLoading } = useMoviesTrailer(movie?.id)
  const trailerKey = fetchedTrailerKey
  const navigate = useNavigate()

  const [reviews, setReviews] = useState([])
  useEffect(() => {
    if (!movie?.id) return
    const q = query(
      collection(db, 'reviews'),
      where('movieId', '==', movie.id),
      orderBy('createdAt', 'desc'),
      limit(3)
    )
    getDocs(q).then((snap) => setReviews(snap.docs.map((d) => ({ id: d.id, ...d.data() }))))
  }, [movie?.id])

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
      <Link to="/" className="nav-link flex items-center gap-2 text-sm mb-6 inline-block">
        ← Back
      </Link>
      <div className="flex flex-wrap justify-center gap-2 mb-4">
        {(Array.isArray(movie.genres) ? movie.genres : (movie.genres || "").split(",")).map((g) => (
          <span key={g?.id ?? g} className="text-xs px-3 py-1 rounded-full border border-accent text-accent uppercase tracking-widest">
            {g?.name ?? g}
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
      {/* Controller Pad, can be fullsize render the Trailer now */}
      <ContainerScroll titleComponent={titleComponent}>
        {/* Card content — trailer full size, links overlaid at bottom */}
        <div className="relative h-full w-full overflow-hidden rounded-xl bg-black">

          {/* Trailer — full size */}
          {trailerLoading ? (
            <div className="w-full h-full flex items-center justify-center text-white/40 text-sm">
              Loading trailer...
            </div>
          ) : trailerKey ? (
            <iframe
              src={`https://www.youtube.com/embed/${trailerKey}`}
              title={`${movie.title} trailer`}
              allowFullScreen
              className="w-full h-full"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/40 text-sm">
              No trailer available.
            </div>
          )}
        </div>
      </ContainerScroll>

      {/* UpComing functions, we will render reviews and rating details below the pad, also do the options */}

      <div className="pt-24 pb-20 px-6 min-h-screen">
        

          {/* Links overlay at bottom */}
          <div className="w-full relative">
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
          

          {/* Rating and Reviews Sections */}
          <section id="reviews" className="section">
            <h3 className="text-3xl font-bold mb-6">{movie.title} Ratings & Reviews</h3>
            {reviews.length === 0 ? (
              <p className="text-muted text-sm">No reviews yet.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {reviews.map((review) => (
                  <ReviewSnippetCard key={review.id} review={review} movieId={movie.id} />
                ))}
                <button
                  onClick={() => navigate(`/reviews?movieId=${movie.id}`)}
                  className="text-sm text-accent hover:text-accent-hover text-left mt-1"
                >
                  See all reviews →
                </button>
              </div>
            )}
          </section>
        </div>
    </div>
  )
}

export default MovieDetail
