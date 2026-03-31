import { useState } from 'react'
import { Link } from 'react-router-dom'
import MovieCard from '../components/MovieCard'
import RecommendationGenreStep from '../components/RecommendationGenreStep'

// ── Step 1: Categories ────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: 1, name: 'Sci-Fi', emoji: '🚀' },
  { id: 2, name: 'Drama', emoji: '🎭' },
  { id: 3, name: 'Comedy', emoji: '😂' },
  { id: 4, name: 'Horror', emoji: '👻' },
  { id: 5, name: 'Intense', emoji: '🔥' },
  { id: 6, name: 'Thoughtful', emoji: '🤔' },
  { id: 7, name: 'Adventure', emoji: '🚀' },
]

// ── Step 2: Swipe cards (sample prompts per genre) ────────────────────────────
const SWIPE_CARDS = {
  'Sci-Fi':    ['A lone astronaut drifting through deep space', 'AI takes over humanity', 'Time travel paradox thriller'],
  'Drama':     ['A family torn apart by war', 'One man\'s fight for justice', 'A musician\'s rise and fall'],
  'Comedy':    ['Awkward road trip gone wrong', 'Office chaos on deadline day', 'A wedding full of disasters'],
  'Horror':    ['Haunted house, no escape', 'Creature lurking in the dark', 'Psychological breakdown'],
  'Romance':   ['Strangers meeting in Paris', 'Second chances at love', 'Long-distance love story'],
  'Thriller':  ['Spy with no memory', 'Killer hiding in plain sight', 'A race against the clock'],
  'Action':    ['One-man army vs cartel', 'Heist inside a skyscraper', 'Undercover cop gone rogue'],
  'Animation': ['A child lost in a spirit world', 'Toys trying to find their owner', 'Animals saving their forest'],
}

// ── Step 3: Emoji picker ──────────────────────────────────────────────────────
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

// ── Step indicator ────────────────────────────────────────────────────────────
function StepBar({ step }) {
  const steps = ['Genre', 'Vibe Check', 'Pick Mood']
  return (
    <div className="flex items-center gap-2 mb-10">
      {steps.map((label, i) => (
        <div key={label} className="flex items-center gap-2">
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold transition-all
            ${i + 1 === step ? 'bg-accent text-white' : i + 1 < step ? 'bg-accent/30 text-ink/60' : 'bg-white/10 text-muted'}`}>
            <span>{i + 1}</span>
            <span>{label}</span>
          </div>
          {i < steps.length - 1 && <span className="text-muted text-xs">›</span>}
        </div>
      ))}
    </div>
  )
}

// ── Step 2: Tinder-style swipe ────────────────────────────────────────────────
function Step2({ categories, onNext }) {
  const allCards = categories.flatMap((cat) =>
    (SWIPE_CARDS[cat] || []).map((prompt) => ({ cat, prompt }))
  )

  const [index, setIndex]   = useState(0)
  const [liked, setLiked]   = useState([])
  const [anim, setAnim]     = useState(null) // 'left' | 'right'

  const current = allCards[index]

  const swipe = (yes) => {
    setAnim(yes ? 'right' : 'left')
    setTimeout(() => {
      if (yes) setLiked((prev) => [...prev, current])
      setAnim(null)
      if (index + 1 >= allCards.length) {
        onNext(liked.concat(yes ? current : []))
      } else {
        setIndex((i) => i + 1)
      }
    }, 300)
  }

  if (!current) {
    onNext(liked)
    return null
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-ink mb-2">Does this vibe work for you?</h1>
      <p className="section-subtitle mb-8">
        Card {index + 1} of {allCards.length} · {liked.length} liked
      </p>

      {/* Card */}
      <div className="flex justify-center mb-10">
        <div
          className={`relative w-72 h-96 rounded-3xl border border-white/10 bg-white flex flex-col items-center justify-center gap-4 p-8 text-center shadow-2xl transition-all duration-300
            ${anim === 'right' ? 'translate-x-24 opacity-0 rotate-12' : ''}
            ${anim === 'left'  ? '-translate-x-24 opacity-0 -rotate-12' : ''}`}
        >
          <span className="text-5xl">
            {CATEGORIES.find((c) => c.name === current.cat)?.emoji || '🎬'}
          </span>
          <span className="text-xs font-semibold text-accent uppercase tracking-widest">{current.cat}</span>
          <p className="text-ink text-lg font-medium leading-snug">{current.prompt}</p>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-center gap-6">
        <button
          onClick={() => swipe(false)}
          className="w-16 h-16 rounded-full border border-red-400/40 bg-red-500/10 text-2xl hover:bg-red-500/20 transition-all cursor-pointer"
        >
          ✕
        </button>
        <button
          onClick={() => swipe(true)}
          className="w-16 h-16 rounded-full border border-green-400/40 bg-green-500/10 text-2xl hover:bg-green-500/20 transition-all cursor-pointer"
        >
          ♥
        </button>
      </div>

      <p className="text-center text-xs text-muted mt-4">✕ Nope &nbsp;·&nbsp; ♥ Yes!</p>

      {/* Skip all */}
      <div className="flex justify-center mt-6">
        <button
          onClick={() => onNext(liked)}
          className="text-xs text-muted hover:text-ink transition-colors cursor-pointer underline"
        >
          Skip remaining →
        </button>
      </div>
    </div>
  )
}

// ── Step 3: Emoji + results ───────────────────────────────────────────────────
function Step3({ likedVibes }) {
  const [selected, setSelected] = useState('')
  const [movies, setMovies]     = useState([])
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)

  const pick = (emoji) => {
    setSelected(emoji)
    setMovies([])
    setError(null)
    setLoading(true)

    fetch('/api/recommendations', {
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
      {/* Mood selector — compact section */}
      <section className="mb-10">
        <h1 className="text-3xl font-bold text-ink mb-1">How are you feeling?</h1>
        <p className="section-subtitle mb-6">
          {likedVibes.length > 0
            ? `Based on your ${likedVibes.length} liked vibe${likedVibes.length > 1 ? 's' : ''}`
            : 'Pick your current mood to get recommendations'}
        </p>
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

      {/* Results section */}
      <section>
        {loading && (
          <p className="text-muted text-sm">Finding movies for you...</p>
        )}
        {error && (
          <p className="text-red-400 text-sm">Could not load recommendations: {error}</p>
        )}
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

// ── Main flow ─────────────────────────────────────────────────────────────────
function EmojiRecommendations() {
  const [step, setStep]             = useState(1)
  const [categories, setCategories] = useState([])
  const [likedVibes, setLikedVibes] = useState([])

  const handleStep1 = (selected) => {
    setCategories(selected)
    setStep(2)
  }

  const handleStep2 = (liked) => {
    setLikedVibes(liked)
    setStep(3)
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="container-main">
        <Link to="/" className="accent-link text-sm mb-8 inline-block">← Back</Link>

        <StepBar step={step} />

        {step === 1 && <RecommendationGenreStep onNext={handleStep1} />}
        {step === 2 && <Step2 categories={categories} onNext={handleStep2} />}
        {step === 3 && <Step3 likedVibes={likedVibes} />}
      </div>
    </div>
  )
}

export default EmojiRecommendations
