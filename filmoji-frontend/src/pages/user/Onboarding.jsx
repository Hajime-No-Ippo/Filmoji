import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authFetch } from '../../utils/api'

const GENRES = [
  { value: 'Sci-Fi',       emoji: '🚀', label: 'Sci-Fi' },
  { value: 'Drama',        emoji: '🎭', label: 'Drama' },
  { value: 'Comedy',       emoji: '😂', label: 'Comedy' },
  { value: 'Horror',       emoji: '👻', label: 'Horror' },
  { value: 'Intense',      emoji: '⚡', label: 'Intense' },
  { value: 'Thoughtful',   emoji: '🧠', label: 'Thoughtful' },
  { value: 'Adventure',    emoji: '🌍', label: 'Adventure' },
  { value: 'Romance',      emoji: '❤️', label: 'Romance' },
  { value: 'Action',       emoji: '💥', label: 'Action' },
  { value: 'Animation',    emoji: '✨', label: 'Animation' },
]

function Onboarding() {
  const [selected, setSelected] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const toggle = (value) => {
    setSelected((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    )
  }

  const handleSubmit = async () => {
    if (selected.length === 0) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await authFetch('/api/users/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ genres: selected, likedVibes: [] }),
      })
      if (!res.ok) throw new Error('Onboarding failed')
      navigate('/dashboard')
    } catch (err) {
      setError('Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-20">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-ink mb-3">What do you love watching?</h1>
          <p className="text-ink/60 font-[Inter] text-sm">
            Pick your favourite genres — we'll personalise your recommendations.
          </p>
        </div>

        {/* Genre grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-10">
          {GENRES.map(({ value, emoji, label }) => {
            const active = selected.includes(value)
            return (
              <button
                key={value}
                onClick={() => toggle(value)}
                className={`
                  flex items-center gap-3 rounded-xl px-5 py-4 text-left font-medium
                  border-2 transition-all duration-150
                  ${active
                    ? 'border-accent bg-accent/10 text-ink scale-[1.02]'
                    : 'border-white/10 bg-card text-ink/70 hover:border-white/30 hover:text-ink'
                  }
                `}
              >
                <span className="text-2xl">{emoji}</span>
                <span className="font-[Inter] text-sm">{label}</span>
                {active && (
                  <span className="ml-auto text-accent text-xs">✓</span>
                )}
              </button>
            )
          })}
        </div>

        {error && (
          <p className="text-red-400 text-sm text-center mb-4 font-[Inter]">{error}</p>
        )}

        {/* Submit */}
        <div className="flex flex-col items-center gap-3">
          <button
            onClick={handleSubmit}
            disabled={selected.length === 0 || submitting}
            className="btn-primary w-full sm:w-auto sm:px-16 py-3 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting ? 'Setting up your profile…' : `Continue${selected.length > 0 ? ` (${selected.length} selected)` : ''}`}
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-ink/40 text-xs font-[Inter] hover:text-ink/60 transition-colors"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  )
}

export default Onboarding
