import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { auth } from '../../../firebase'
import { onAuthStateChanged } from 'firebase/auth'
import MovieCard from '../../components/movie/MovieCard'
import { authFetch } from '../../utils/api'

const EMOJIS = [
  { emoji: '😊', label: 'Happy' },
  { emoji: '😢', label: 'Sad' },
  { emoji: '😱', label: 'Scared' },
  { emoji: '😂', label: 'Funny' },
  { emoji: '❤️', label: 'Romantic' },
  { emoji: '🔥', label: 'Intense' },
  { emoji: '🤔', label: 'Thoughtful' },
  { emoji: '🚀', label: 'Adventure' },
  { emoji: '👻', label: 'Spooky' },
  { emoji: '🤯', label: 'Mind-blown' },
]

function adaptMovie(m) {
  return {
    id:             m.id,
    title:          m.title,
    poster:         m.posterUrl || '',
    year:           m.releaseYear,
    rating:         m.rating,
    genres:         Array.isArray(m.genres) ? m.genres : [],
    whyRecommended: m.whyRecommended,
  }
}

function LoginGate() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="text-6xl mb-6">🎬</div>
      <h2 className="text-2xl font-bold text-ink mb-3">Sign in to get recommendations</h2>
      <p className="section-subtitle mb-8 max-w-sm font-[Inter]">
        Create a free account so we can learn your taste and personalise every pick for you.
      </p>
      <div className="flex gap-4">
        <Link to="/login?redirect=/emoji-recommendations" className="px-6 py-3 rounded-full bg-accent text-ink font-semibold text-sm hover:brightness-110 transition-all">
          Log in
        </Link>
        <Link to="/register?redirect=/emoji-recommendations" className="px-6 py-3 rounded-full border border-white/20 text-ink text-sm hover:bg-white/10 transition-all">
          Sign up
        </Link>
      </div>
    </div>
  )
}

function Step3() {
  const [selected, setSelected] = useState('')
  const [movies, setMovies]     = useState([])
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)

  const pick = (emoji) => {
    setSelected(emoji)
    setMovies([])
    setError(null)
    setLoading(true)

    authFetch('/api/recommendations', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ emojis: emoji }),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Server returned ${res.status}`)
        return res.json()
      })
      .then((data) => setMovies(data.map(adaptMovie)))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  return (
    <div>
      <section className="mb-10">
        <h1 className="text-3xl font-bold text-ink mb-1">How are you feeling?</h1>
        <p className="section-subtitle mb-6">Pick your current mood to get recommendations</p>
        <div className="flex flex-wrap gap-2">
          {EMOJIS.map(({ emoji, label }) => (
            <button
              key={emoji}
              onClick={() => pick(emoji)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all cursor-pointer
                ${selected === emoji
                  ? 'border-accent bg-accent text-ink font-semibold scale-105'
                  : 'border-white/10 bg-white/5 text-muted hover:bg-white/10 hover:text-ink'}`}
            >
              <span className="text-lg">{emoji}</span>
              <span>{label}</span>
            </button>
          ))}
        </div>
      </section>

      <section>
        {loading && <p className="text-muted text-sm">Finding movies for you...</p>}
        {error && <p className="text-red-400 text-sm">Could not load recommendations: {error}</p>}
        {!loading && !error && selected && movies.length === 0 && (
          <p className="text-muted text-sm">No movies found.</p>
        )}
        {!selected && !loading && (
          <p className="text-muted text-sm">Select a mood above to see recommendations.</p>
        )}
        {movies.length > 0 && (
          <>
            <h2 className="text-xl font-semibold text-ink mb-6">Top picks for {selected}</h2>
            <div className="grid-movies">
              {movies.map((movie) => (
                <div key={movie.id}>
                  <MovieCard movie={movie} />
                  {movie.whyRecommended && (
                    <p className="text-xs text-muted mt-2 px-1">{movie.whyRecommended}</p>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  )
}

function EmojiRecommendations() {
  const [authState, setAuthState] = useState('loading')

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setAuthState(firebaseUser ? 'user' : 'guest')
    })
    return () => unsub()
  }, [])

  if (authState === 'loading') {
    return (
      <div className="min-h-screen pt-24 pb-16 px-6 flex items-center justify-center">
        <p className="text-muted">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="container-main">
        <Link to="/" className="accent-link text-sm mb-8 inline-block">← Back</Link>
        {authState === 'guest' ? <LoginGate /> : <Step3 />}
      </div>
    </div>
  )
}

export default EmojiRecommendations
