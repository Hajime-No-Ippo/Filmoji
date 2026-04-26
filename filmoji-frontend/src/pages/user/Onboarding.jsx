import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useMotionValue, useTransform, animate } from 'motion/react'
import { authFetch } from '../../utils/api'

// ── Quiz data (ported from filmoji-test) ─────────────────────────────────────
const QUIZ_QUESTIONS = [
  {
    id: 'q1',
    text: "It's Friday night, your plans fell through. You're actually...",
    answers: [
      { emoji: '🛋️', text: 'Kind of relieved, hello couch and snacks',          scores: { comfort: 2, social: 0, adventure: 0, intellectual: 0 } },
      { emoji: '🎉', text: 'Already calling everyone to make NEW plans',         scores: { comfort: 0, social: 2, adventure: 1, intellectual: 0 } },
      { emoji: '🎨', text: 'Using the time to finally start that creative project', scores: { comfort: 0, social: 0, adventure: 0, intellectual: 2 } },
      { emoji: '🌊', text: "Fine with it, I'll just vibe and see what happens",  scores: { comfort: 1, social: 0, adventure: 1, intellectual: 0 } },
    ],
  },
  {
    id: 'q2',
    text: 'Your ideal movie snack situation is:',
    answers: [
      { emoji: '🧀', text: "Full charcuterie board, we're doing this RIGHT",      scores: { sophisticated: 2, classic: 0 } },
      { emoji: '🍿', text: "Popcorn, obviously. Don't @ me",                      scores: { classic: 2, sophisticated: 0 } },
      { emoji: '🤷', text: "Whatever's in the fridge, I'm chaotic",                scores: { spontaneous: 2, classic: 0 } },
      { emoji: '🍣', text: 'Something delivered, I have taste',                   scores: { sophisticated: 1, comfort: 1 } },
    ],
  },
  {
    id: 'q3',
    text: 'Your villain origin story would be:',
    answers: [
      { emoji: '🧠', text: 'Nobody believed in my genius',                        scores: { thriller: 1, sci_fi: 1 } },
      { emoji: '💔', text: 'I was betrayed by someone I loved',                   scores: { drama: 2, romance: 1 } },
      { emoji: '😤', text: "Society's rules never made sense to me",              scores: { drama: 1, action: 1 } },
      { emoji: '😳', text: 'I tripped in front of my crush and never recovered',  scores: { comedy: 2, romance: 1 } },
    ],
  },
  {
    id: 'q4',
    text: 'The last time you cried was because:',
    answers: [
      { emoji: '😭', text: 'A movie/book/song hit differently',                   scores: { emotional: 2, drama: 1 } },
      { emoji: '😤', text: 'Pure frustration at a situation',                     scores: { intense: 1, thriller: 1 } },
      { emoji: '🥹', text: 'I was happy for someone else',                        scores: { feel_good: 2, emotional: 1 } },
      { emoji: '😎', text: "I genuinely don't remember, I'm built different",     scores: { action: 1, comedy: 1 } },
    ],
  },
  {
    id: 'q5',
    text: "You're at a party. Where are you?",
    answers: [
      { emoji: '🎤', text: 'Center of the room telling a story to a crowd',       scores: { social: 2, comedy: 1 } },
      { emoji: '🤝', text: 'Having an intense 1-on-1 with someone interesting',   scores: { intellectual: 2, drama: 1 } },
      { emoji: '🍳', text: 'Helping the host in the kitchen',                     scores: { feel_good: 2, comfort: 1 } },
      { emoji: '🌆', text: 'On the balcony looking at the city lights',           scores: { reflective: 2, drama: 1 } },
    ],
  },
  {
    id: 'q6',
    text: 'Pick your perfect Saturday:',
    answers: [
      { emoji: '🗺️', text: "Exploring a city I've never been to",                 scores: { adventure: 2, action: 1 } },
      { emoji: '📺', text: 'Rewatching a comfort show for the 5th time',          scores: { comfort: 2, nostalgia: 1 } },
      { emoji: '💪', text: 'Planning something ambitious and doing it',           scores: { action: 2, adventure: 1 } },
      { emoji: '🫂', text: 'Deep conversations with one good friend',             scores: { emotional: 2, drama: 1 } },
    ],
  },
]

function StepBar({ step }) {
  const steps = ['Quiz', 'Swipe']
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

// ── Quiz step ────────────────────────────────────────────────────────────────
function QuizStep({ onComplete }) {
  const [index, setIndex]     = useState(0)
  const [answers, setAnswers] = useState({})
  const [scores, setScores]   = useState({})

  const total   = QUIZ_QUESTIONS.length
  const current = QUIZ_QUESTIONS[index]
  const pct     = Math.round((index / total) * 100)

  const pick = (answerIndex) => {
    const answer = current.answers[answerIndex]
    const nextAnswers = { ...answers, [current.id]: answerIndex }
    const nextScores  = { ...scores }
    Object.entries(answer.scores).forEach(([k, v]) => {
      nextScores[k] = (nextScores[k] || 0) + v
    })
    setAnswers(nextAnswers)
    setScores(nextScores)

    if (index + 1 < total) {
      setIndex(index + 1)
    } else {
      onComplete({ answers: nextAnswers, scores: nextScores })
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2 text-xs text-muted font-[Inter]">
        <span>Question {index + 1} of {total}</span>
        <span>{pct}%</span>
      </div>
      <div className="w-full h-1.5 bg-white/10 rounded-full mb-8 overflow-hidden">
        <motion.div
          className="h-full bg-accent"
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      <motion.div
        key={current.id}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <p className="text-xs uppercase tracking-widest text-accent font-semibold mb-3">Question {index + 1}</p>
        <h1 className="text-2xl md:text-3xl font-bold text-ink mb-8 leading-snug">{current.text}</h1>

        <div className="grid gap-3 sm:grid-cols-2">
          {current.answers.map((a, i) => (
            <button
              key={i}
              onClick={() => pick(i)}
              className="flex items-start gap-3 text-left px-5 py-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-accent hover:text-ink hover:border-accent transition-all cursor-pointer group"
            >
              <span className="text-2xl shrink-0">{a.emoji}</span>
              <span className="text-sm text-ink/80 group-hover:text-ink leading-snug">{a.text}</span>
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

// ── Single swipe card ────────────────────────────────────────────────────────
function SwipeCard({ movie, onSwipe }) {
  const x        = useMotionValue(0)
  const rotate   = useTransform(x, [-200, 200], [-18, 18])
  const opacity  = useTransform(x, [-200, 0, 200], [0, 1, 0])
  const likeOp   = useTransform(x, [40, 140], [0, 1])
  const nopeOp   = useTransform(x, [-140, -40], [1, 0])

  const fly = (liked) => {
    animate(x, liked ? 360 : -360, { duration: 0.3 }).then(() => onSwipe(liked))
  }

  const handleDragEnd = (_, info) => {
    if (info.offset.x > 100) fly(true)
    else if (info.offset.x < -100) fly(false)
    else animate(x, 0, { duration: 0.2 })
  }

  const posterSrc = movie.posterUrl || null
  const genres    = (movie.genres || []).slice(0, 3)

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      style={{ x, rotate, opacity }}
      className="relative w-72 sm:w-80 h-[28rem] rounded-3xl border border-white/10 bg-white overflow-hidden shadow-2xl cursor-grab active:cursor-grabbing"
    >
      <motion.div
        style={{ opacity: likeOp }}
        className="absolute top-6 right-6 z-20 px-3 py-1 rounded-full border-4 border-green-400 text-green-500 font-extrabold rotate-12 text-lg"
      >LIKE 👍</motion.div>
      <motion.div
        style={{ opacity: nopeOp }}
        className="absolute top-6 left-6 z-20 px-3 py-1 rounded-full border-4 border-red-400 text-red-500 font-extrabold -rotate-12 text-lg"
      >NOPE 👎</motion.div>

      {posterSrc ? (
        <img
          src={posterSrc}
          alt={movie.title}
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-6xl text-ink/30">🎬</div>
      )}

      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-5 text-white">
        <h3 className="text-lg font-bold leading-tight mb-1">{movie.title}</h3>
        <p className="text-xs text-white/70 mb-2">{movie.releaseYear}</p>
        <div className="flex flex-wrap gap-1.5">
          {genres.map((g) => (
            <span key={g} className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-accent/80 text-ink font-semibold">{g}</span>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

// ── Swipe step ───────────────────────────────────────────────────────────────
function SwipeStep({ onComplete }) {
  const [deck, setDeck]       = useState(null)
  const [index, setIndex]     = useState(0)
  const [swipes, setSwipes]   = useState([])
  const [loadErr, setLoadErr] = useState(null)

  useEffect(() => {
    let cancelled = false
    authFetch('/api/users/onboarding/swipe-deck')
      .then((res) => {
        if (!res.ok) throw new Error(`Server returned ${res.status}`)
        return res.json()
      })
      .then((data) => { if (!cancelled) setDeck(data) })
      .catch((err) => { if (!cancelled) setLoadErr(err.message) })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    const onKey = (e) => {
      if (!deck || index >= deck.length) return
      if (e.key === 'ArrowRight') handleSwipe(true)
      if (e.key === 'ArrowLeft')  handleSwipe(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deck, index])

  const handleSwipe = (liked) => {
    if (!deck) return
    const movie = deck[index]
    const nextSwipes = [...swipes, { tmdbId: movie.tmdbId, liked }]
    setSwipes(nextSwipes)
    if (index + 1 >= deck.length) {
      onComplete(nextSwipes)
    } else {
      setIndex(index + 1)
    }
  }

  if (loadErr) {
    return (
      <div className="text-center py-16">
        <p className="text-red-400 text-sm mb-4">Could not load the swipe deck: {loadErr}</p>
        <button onClick={() => onComplete([])} className="text-xs text-muted underline cursor-pointer">Skip swipes →</button>
      </div>
    )
  }

  if (!deck) {
    return <p className="text-muted text-sm text-center py-16">Loading your swipe deck...</p>
  }

  if (deck.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-muted text-sm mb-4">No movies available to swipe right now.</p>
        <button onClick={() => onComplete([])} className="px-5 py-2 rounded-full bg-accent text-ink font-semibold text-sm cursor-pointer">Continue</button>
      </div>
    )
  }

  const movie = deck[index]
  const liked = swipes.filter((s) => s.liked).length

  return (
    <div>
      <h1 className="text-3xl font-bold text-ink mb-2">Now, the fun part</h1>
      <p className="section-subtitle mb-6">
        Swipe right to like, left to pass · Movie {index + 1} of {deck.length} · {liked} liked
      </p>

      <div className="flex justify-center mb-8 min-h-[28rem]">
        <SwipeCard key={movie.tmdbId} movie={movie} onSwipe={handleSwipe} />
      </div>

      <div className="flex justify-center gap-6">
        <button onClick={() => handleSwipe(false)} aria-label="Nope" className="w-16 h-16 rounded-full border border-red-400/40 bg-red-500/10 text-2xl hover:bg-red-500/20 transition-all cursor-pointer">👎</button>
        <button onClick={() => handleSwipe(true)}  aria-label="Like"  className="w-16 h-16 rounded-full border border-green-400/40 bg-green-500/10 text-2xl hover:bg-green-500/20 transition-all cursor-pointer">👍</button>
      </div>
      <p className="text-center text-xs text-muted mt-4">← / → arrow keys also work</p>
    </div>
  )
}

// ── Main ─────────────────────────────────────────────────────────────────────
function Onboarding() {
  const [step, setStep]             = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]           = useState(null)
  const navigate = useNavigate()

  const handleQuizComplete = async ({ answers, scores }) => {
    setError(null)
    try {
      const res = await authFetch('/api/users/onboarding', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ answers, scores }),
      })
      if (!res.ok) throw new Error('Could not save quiz answers')
      setStep(2)
    } catch (err) {
      setError(err.message)
    }
  }

  const handleSwipesComplete = async (swipes) => {
    setSubmitting(true)
    setError(null)
    try {
      const res = await authFetch('/api/users/onboarding/swipes', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ swipes }),
      })
      if (!res.ok) throw new Error('Could not save swipes')
      navigate('/emoji-recommendations')
    } catch (err) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="container-main max-w-2xl">
        <StepBar step={step} />
        {error && <p className="text-red-400 text-sm mb-4 font-[Inter]">{error}</p>}
        {submitting && <p className="text-muted text-sm mb-4">Building your taste profile…</p>}
        {step === 1 && <QuizStep onComplete={handleQuizComplete} />}
        {step === 2 && <SwipeStep onComplete={handleSwipesComplete} />}
      </div>
    </div>
  )
}

export default Onboarding
