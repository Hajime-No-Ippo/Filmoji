import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useMoviesTrailer } from '../../hooks/useMoviesAPIs'
import { ContainerScroll } from '../../components/effects/ContainerScroll/ContainerScroll'
import ReviewSnippetCard from '../../components/movie/ReviewSnippetCard'
import { db, auth } from '../../../firebase'
import { collection, query, where, orderBy, limit, getDocs, addDoc, serverTimestamp } from 'firebase/firestore'
import { authFetch } from '../../utils/api'
import { useWatchlist } from '../../components/watchlist/WatchlistContext'

function MovieDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [movie, setMovie] = useState(null)
  const [loading, setLoading] = useState(true)
  const { isInWatchlist, toggleWatchlist } = useWatchlist()
  const [interaction, setInteraction] = useState(null) // 'like' | 'dislike' | null
  const [interactionSaving, setInteractionSaving] = useState(false)
  const [toast, setToast] = useState(null) // { message, type: 'success'|'error' }

  const [reviews, setReviews] = useState([])
  const [reviewText, setReviewText] = useState('')
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewSubmitting, setReviewSubmitting] = useState(false)
  const [reviewError, setReviewError] = useState(null)

  const { trailerKey, loading: trailerLoading } = useMoviesTrailer(movie?.id)

  useEffect(() => {
    let mounted = true
    setLoading(true)

    fetch(`/api/movies/${id}`)
      .then(async (res) => {
        if (res.ok) return res.json()
        // fallback: backend exposes list endpoint — try to find by tmdbId or id
        try {
          const listRes = await fetch('/api/movies?limit=10000')
          if (!listRes.ok) return null
          const list = await listRes.json()
          const parsed = parseInt(id, 10)
          return list.find(m => m.id === parsed || m.tmdbId === parsed || m.id === id || m.tmdbId === id) || null
        } catch (e) {
          return null
        }
      })
      .then(data => {
        if (mounted && data) setMovie({ ...data, year: data.releaseYear, description: data.synopsis })
      })
      .catch(() => {})
      .finally(() => { if (mounted) setLoading(false) })

    return () => { mounted = false }
  }, [id])

  useEffect(() => {
    if (!movie?.id) return
    const q = query(
      collection(db, 'reviews'),
      where('movieId', '==', movie.id),
      orderBy('createdAt', 'desc'),
      limit(3)
    )
    getDocs(q).then(snap => setReviews(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
  }, [movie?.id])

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 2500)
  }

  const handleInteraction = async (type) => {
    if (interactionSaving) return
    const next = interaction === type ? null : type
    setInteraction(next)
    if (!next) return
    setInteractionSaving(true)
    try {
      const res = await authFetch('/api/interactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ movieId: movie.id, type: next }),
      })
      if (res.status === 401) {
        navigate(`/login?redirect=/movie/${movie.id}`)
        return
      }
      if (res.ok) {
        showToast(next === 'like' ? '👍 Liked! Recommendations updated.' : '👎 Noted! Recommendations updated.')
      }
    } catch (_) {
      showToast('Something went wrong. Please try again.', 'error')
      setInteraction(interaction) // revert UI
    }
    setInteractionSaving(false)
  }

  const handleReviewSubmit = async (e) => {
    e.preventDefault()
    if (!reviewText.trim() || reviewRating === 0) return
    const user = auth.currentUser
    if (!user) { setReviewError('Please log in to write a review.'); return }
    setReviewSubmitting(true)
    setReviewError(null)
    try {
      await addDoc(collection(db, 'reviews'), {
        movieId: movie.id,
        userEmail: user.email,
        comment: reviewText.trim(),
        rating: reviewRating,
        createdAt: serverTimestamp(),
      })
      setReviewText('')
      setReviewRating(0)
      showToast('✅ Review submitted!')
      const q = query(collection(db, 'reviews'), where('movieId', '==', movie.id), orderBy('createdAt', 'desc'), limit(3))
      const snap = await getDocs(q)
      setReviews(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    } catch {
      setReviewError('Failed to submit review. Please try again.')
    }
    setReviewSubmitting(false)
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-muted">Loading...</div>
  }

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
      <Link to="/" className="nav-link flex items-center gap-2 text-sm mb-6 inline-block">← Back</Link>
      <div className="flex flex-wrap justify-center gap-2 mb-4">
        {(Array.isArray(movie.genres) ? movie.genres : (movie.genres || '').split(',')).map((g) => (
          <span key={g?.id ?? g} className="text-xs px-3 py-1 rounded-full border border-accent text-accent uppercase tracking-widest">
            {g?.name ?? g}
          </span>
        ))}
      </div>
      <h1 className="text-4xl md:text-6xl font-bold text-ink mb-3 tracking-tight">{movie.title}</h1>
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
      <ContainerScroll titleComponent={titleComponent}>
        <div className="relative h-full w-full overflow-hidden rounded-xl bg-black">
          {trailerLoading ? (
            <div className="w-full h-full flex items-center justify-center text-white/40 text-sm">Loading trailer...</div>
          ) : trailerKey ? (
            <iframe src={`https://www.youtube.com/embed/${trailerKey}`} title={`${movie.title} trailer`} allowFullScreen className="w-full h-full" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/40 text-sm">No trailer available.</div>
          )}
        </div>
      </ContainerScroll>

      <div className="pt-24 pb-20 px-6 min-h-screen">

        {/* Toast */}
        {toast && (
          <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full text-sm font-semibold shadow-lg transition-all
            ${toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>
            {toast.message}
          </div>
        )}

        {/* Like / Dislike */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => handleInteraction('like')}
            disabled={interactionSaving}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm transition-all disabled:opacity-50
              ${interaction === 'like'
                ? 'bg-green-500 text-white scale-105'
                : 'bg-white/5 border border-white/10 text-muted hover:bg-green-500/20 hover:text-green-400'}`}
          >
            <span className="text-xl">👍</span>
            {interactionSaving && interaction === 'like' ? 'Saving…' : 'Like'}
          </button>
          <button
            onClick={() => handleInteraction('dislike')}
            disabled={interactionSaving}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm transition-all disabled:opacity-50
              ${interaction === 'dislike'
                ? 'bg-red-500 text-white scale-105'
                : 'bg-white/5 border border-white/10 text-muted hover:bg-red-500/20 hover:text-red-400'}`}
          >
            <span className="text-xl">👎</span>
            {interactionSaving && interaction === 'dislike' ? 'Saving…' : 'Dislike'}
          </button>
          <button
            onClick={() => toggleWatchlist(movie.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm transition-all
              ${isInWatchlist(movie.id)
                ? 'bg-accent text-ink scale-105'
                : 'bg-white/5 border border-white/10 text-muted hover:bg-accent/20 hover:text-accent'}`}
          >
            <span className="text-xl">{isInWatchlist(movie.id) ? '★' : '☆'}</span>
            {isInWatchlist(movie.id) ? 'In Watchlist' : 'Add to Watchlist'}
          </button>
          <Link to="/reviews" className="ml-auto text-sm accent-link">Read all reviews →</Link>
        </div>

        {/* Write Review */}
        <section className="mb-10">
          <h3 className="text-xl font-bold text-ink mb-4">Write a Review</h3>
          <form onSubmit={handleReviewSubmit} className="bg-card rounded-2xl p-6 border border-border space-y-4">
            {/* Star rating */}
            <div className="flex items-center gap-1">
              {[1,2,3,4,5,6,7,8,9,10].map(n => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setReviewRating(n)}
                  className={`text-xl transition-all ${n <= reviewRating ? 'text-yellow-400' : 'text-muted/30'}`}
                >★</button>
              ))}
              <span className="ml-2 text-sm text-muted">{reviewRating > 0 ? `${reviewRating}/10` : 'Select rating'}</span>
            </div>
            <textarea
              value={reviewText}
              onChange={e => setReviewText(e.target.value)}
              placeholder="Share your thoughts about this movie..."
              rows={3}
              className="w-full bg-transparent border border-border rounded-lg px-4 py-3 text-ink placeholder-muted text-sm outline-none focus:border-accent/60 transition-colors resize-none font-[Inter]"
            />
            {reviewError && <p className="text-red-400 text-sm">{reviewError}</p>}
            <button
              type="submit"
              disabled={reviewSubmitting || !reviewText.trim() || reviewRating === 0}
              className="btn-primary px-8 py-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {reviewSubmitting ? 'Submitting…' : 'Submit Review'}
            </button>
          </form>
        </section>

        {/* Reviews */}
        <section id="reviews">
          <h3 className="text-3xl font-bold mb-6">{movie.title} Ratings & Reviews</h3>
          {reviews.length === 0 ? (
            <p className="text-muted text-sm">No reviews yet. Be the first!</p>
          ) : (
            <div className="flex flex-col gap-3">
              {reviews.map(review => (
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
