import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { featuredMovies } from '../../data/movies'
import { useMoviesWithPosters, useMoviesTrailer } from '../../hooks/useMoviesAPIs'
import { ContainerScroll } from '../../components/ContainerScroll'
import ReviewsColumn from '../../components/effects/ReviewsColumn/ReviewsColumn'
import { db } from '../../../firebase'
import { collection, query, where, orderBy, limit, getDocs, addDoc, serverTimestamp } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import FeaturedMovies from '../../components/movie/FeaturedMovies'

function MovieDetail() {
  const { id } = useParams()
  const { movies, loading } = useMoviesWithPosters(featuredMovies)
  const movie = loading
    ? featuredMovies.find((m) => m.id === parseInt(id))
    : movies.find((m) => m.id === parseInt(id))
  const { trailerKey: fetchedTrailerKey, loading: trailerLoading } = useMoviesTrailer(movie?.id)
  const trailerKey = fetchedTrailerKey ?? 'dQw4w9WgXcQ' // TODO: remove fallback once backend returns trailerKey
  const navigate = useNavigate()

  const [reviews, setReviews] = useState([])
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const currentUser = getAuth().currentUser

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    if (!currentUser) return
    if (rating < 1 || rating > 10 || !comment.trim()) return
    setSubmitting(true)
    try {
      await addDoc(collection(db, 'reviews'), {
        movieId: movie.id,
        userId: currentUser.uid,
        userEmail: currentUser.email,
        rating: parseInt(rating),
        comment: comment.trim(),
        createdAt: serverTimestamp()
      })
      setRating(0)
      setComment('')
      // refresh snippets
      const q = query(collection(db, 'reviews'), where('movieId', '==', movie.id), orderBy('createdAt', 'desc'), limit(3))
      const snap = await getDocs(q)
      setReviews(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    } finally {
      setSubmitting(false)
    }
  }
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
          {/* Rating and Reviews Sections */}
          <section id="reviews" className="section">
            <h3 className="text-3xl font-bold mb-6">{movie.title} Ratings & Reviews</h3>

            {/* Write a review form */}
            {currentUser ? (
              <form onSubmit={handleSubmitReview} className="card-base p-5 mb-6 flex flex-col gap-3">
                <p className="text-sm font-semibold text-ink">Write a Review</p>
                <div className="flex items-center gap-3">
                  <label className="text-sm text-muted">Rating</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={rating || ''}
                    onChange={(e) => setRating(e.target.value)}
                    placeholder="1–10"
                    className="input-field w-20"
                    required
                  />
                </div>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your thoughts..."
                  rows={3}
                  className="input-field resize-none"
                  required
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary px-6 self-start"
                >
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            ) : (
              <p className="text-sm text-muted mb-6">
                <Link to="/login" className="accent-link">Sign in</Link> to leave a review.
              </p>
            )}
            {reviews.length === 0 ? (
              <p className="text-muted text-sm">No reviews yet. Be the first!</p>
            ) : (
              <div>
                <ReviewsColumn reviews={reviews} duration={20} className="max-h-[520px]" />
                <button
                  onClick={() => navigate(`/reviews?movieId=${movie.id}`)}
                  className="text-sm text-accent hover:text-accent-hover text-left mt-4 block"
                >
                  See all reviews →
                </button>
              </div>
            )}
          </section>
        </div>
        <FeaturedMovies/>
    </div>
  )
}

export default MovieDetail
