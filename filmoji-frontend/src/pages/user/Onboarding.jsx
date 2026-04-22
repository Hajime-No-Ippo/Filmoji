import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useMotionValue, useTransform, animate } from 'motion/react'
import RecommendationGenreStep from '../../components/recommendation/RecommendationGenreStep'
import { authFetch } from '../../utils/api'

const SWIPE_CARDS = {
  'Sci-Fi':    ['A lone astronaut drifting through deep space', 'AI takes over humanity', 'Time travel paradox thriller'],
  'Drama':     ['A family torn apart by war', 'One man\'s fight for justice', 'A musician\'s rise and fall'],
  'Comedy':    ['Awkward road trip gone wrong', 'Office chaos on deadline day', 'A wedding full of disasters'],
  'Horror':    ['Haunted house, no escape', 'Creature lurking in the dark', 'Psychological breakdown'],
  'Romance':   ['Strangers meeting in Paris', 'Second chances at love', 'Long-distance love story'],
  'Thriller':  ['Spy with no memory', 'Killer hiding in plain sight', 'A race against the clock'],
  'Action':    ['One-man army vs cartel', 'Heist inside a skyscraper', 'Undercover cop gone rogue'],
  'Animation': ['A child lost in a spirit world', 'Toys trying to find their owner', 'Animals saving their forest'],
  'Intense':   ['A soldier trapped behind enemy lines', 'Survival against the odds', 'No way out thriller'],
  'Thoughtful':['A philosopher\'s final days', 'The meaning behind a painting', 'Questions with no answers'],
  'Adventure': ['Lost in the Amazon jungle', 'Treasure hunt across continents', 'A sailor\'s impossible voyage'],
}

const CATEGORIES = [
  { id: 1, name: 'Sci-Fi',      emoji: '🚀' },
  { id: 2, name: 'Drama',       emoji: '🎭' },
  { id: 3, name: 'Comedy',      emoji: '😂' },
  { id: 4, name: 'Horror',      emoji: '👻' },
  { id: 5, name: 'Intense',     emoji: '🔥' },
  { id: 6, name: 'Thoughtful',  emoji: '🤔' },
  { id: 7, name: 'Adventure',   emoji: '🚀' },
]

function StepBar({ step }) {
  const steps = ['Genre', 'Vibe']
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

function Step2({ categories, onNext }) {
  const allCards = categories.flatMap((cat) =>
    (SWIPE_CARDS[cat] || []).map((prompt) => ({ cat, prompt }))
  )

  const [index, setIndex] = useState(0)
  const [liked, setLiked] = useState([])
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-150, 150], [-20, 20])
  const opacity = useTransform(x, [-150, 0, 150], [0, 1, 0])

  const current = allCards[index]

  const swipe = (yes) => {
    animate(x, yes ? 300 : -300, { duration: 0.3 }).then(() => {
      if (yes) setLiked((prev) => [...prev, current])
      const next = index + 1
      if (next >= allCards.length) {
        onNext(liked.concat(yes ? current : []))
      } else {
        x.set(0)
        setIndex(next)
      }
    })
  }

  const handleDragEnd = (_, info) => {
    if (info.offset.x > 80) swipe(true)
    else if (info.offset.x < -80) swipe(false)
    else x.set(0)
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

      <div className="flex justify-center mb-10">
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={handleDragEnd}
          style={{ x, rotate, opacity }}
          className="relative w-72 h-96 rounded-3xl border border-white/10 bg-white flex flex-col items-center justify-center gap-4 p-8 text-center shadow-2xl cursor-grab active:cursor-grabbing"
        >
          <span className="text-5xl">
            {CATEGORIES.find((c) => c.name === current.cat)?.emoji || '🎬'}
          </span>
          <span className="text-xs font-semibold text-accent uppercase tracking-widest">{current.cat}</span>
          <p className="text-ink text-lg font-medium leading-snug">{current.prompt}</p>
        </motion.div>
      </div>

      <div className="flex justify-center gap-6">
        <button onClick={() => swipe(false)} className="w-16 h-16 rounded-full border border-red-400/40 bg-red-500/10 text-2xl hover:bg-red-500/20 transition-all cursor-pointer">✕</button>
        <button onClick={() => swipe(true)} className="w-16 h-16 rounded-full border border-green-400/40 bg-green-500/10 text-2xl hover:bg-green-500/20 transition-all cursor-pointer">♥</button>
      </div>
      <p className="text-center text-xs text-muted mt-4">✕ Nope &nbsp;·&nbsp; ♥ Yes!</p>

      <div className="flex justify-center mt-6">
        <button onClick={() => onNext(liked)} className="text-xs text-muted hover:text-ink transition-colors cursor-pointer underline">
          Skip remaining →
        </button>
      </div>
    </div>
  )
}

function Onboarding() {
  const [step, setStep] = useState(1)
  const [categories, setCategories] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const handleStep1 = (selected) => {
    setCategories(selected)
    setStep(2)
  }

  const handleStep2 = async (liked) => {
    setSubmitting(true)
    setError(null)
    try {
      const res = await authFetch('/api/users/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ genres: categories, likedVibes: liked }),
      })
      if (!res.ok) throw new Error('Onboarding failed')
      navigate('/emoji-recommendations')
    } catch {
      setError('Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="container-main max-w-2xl">
        <StepBar step={step} />
        {error && <p className="text-red-400 text-sm mb-4 font-[Inter]">{error}</p>}
        {submitting && <p className="text-muted text-sm mb-4">Setting up your profile…</p>}
        {step === 1 && <RecommendationGenreStep onNext={handleStep1} />}
        {step === 2 && <Step2 categories={categories} onNext={handleStep2} />}
      </div>
    </div>
  )
}

export default Onboarding
