import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Link } from 'react-router-dom'
import { authFetch } from '../../utils/api'

const columns = [
  {
    initialY: 0,
    blocks: [
      { emoji: '😊', mood: 'happy',       color: 'var(--color-mood-yellow)' },
      { emoji: '😡', mood: 'angry',       color: 'var(--color-mood-navy)'   },
      { emoji: '😎', mood: 'cool',        color: 'var(--color-mood-blue)'   },
      { emoji: '🥳', mood: 'festive',     color: 'var(--color-mood-yellow)' },
    ],
  },
  {
    initialY: -60,
    blocks: [
      { emoji: '😢', mood: 'sad',         color: 'var(--color-mood-blue)'   },
      { emoji: '😍', mood: 'romantic',    color: 'var(--color-mood-orange)' },
      { emoji: '🤩', mood: 'excited',     color: 'var(--color-mood-green)'  },
      { emoji: '🥱', mood: 'bored',       color: 'var(--color-mood-green)'  },
    ],
  },
  {
    initialY: 40,
    blocks: [
      { emoji: '😱', mood: 'scared',      color: 'var(--color-mood-green)'  },
      { emoji: '🥺', mood: 'emotional',   color: 'var(--color-mood-orange)' },
      { emoji: '🤯', mood: 'mindblown',   color: 'var(--color-mood-navy)'   },
      { emoji: '😌', mood: 'peaceful',    color: 'var(--color-mood-blue)'   },
    ],
  },
  {
    initialY: -20,
    blocks: [
      { emoji: '😂', mood: 'laughing',    color: 'var(--color-mood-yellow)' },
      { emoji: '🤔', mood: 'thoughtful',  color: 'var(--color-mood-green)'  },
      { emoji: '😤', mood: 'tense',       color: 'var(--color-mood-orange)' },
      { emoji: '🫠', mood: 'overwhelmed', color: 'var(--color-mood-blue)'   },
    ],
  },
]

const moodLabels = {
  happy:       'Happy',
  angry:       'Angry',
  cool:        'Cool',
  festive:     'Festive',
  sad:         'Sad',
  romantic:    'Romantic',
  excited:     'Excited',
  bored:       'Bored',
  scared:      'Scared',
  emotional:   'Emotional',
  mindblown:   'Mind-blown',
  peaceful:    'Peaceful',
  laughing:    'Laughing',
  thoughtful:  'Thoughtful',
  tense:       'Tense',
  overwhelmed: 'Overwhelmed',
}

function EmojiGrid({ yValues = [0, 0, 0, 0] }) {
  const [expanded, setExpanded] = useState(null)
  const [selectedMovie, setSelectedMovie] = useState(null)
  const [recLoading, setRecLoading] = useState(false)
  const trailerKey = selectedMovie?.trailerKey ?? null

  const handleClick = (e, block) => {
    setExpanded({ ...block, rect: e.currentTarget.getBoundingClientRect() })
    setSelectedMovie(null)
    setRecLoading(true)
    authFetch('/api/recommendations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emojis: block.emoji }),
    })
      .then((res) => res.json())
      .then((data) => setSelectedMovie(data[0] ?? null))
      .catch(() => setSelectedMovie(null))
      .finally(() => setRecLoading(false))
  }

  const handleClose = () => {
    setExpanded(null)
    setSelectedMovie(null)
  }

  return (
    <>
      {/* ── Emoji blocks ── */}
      <div className="relative min-h-screen overflow-hidden flex gap-3 p-3 pt-30">
        {columns.map((col, colIdx) => (
          <motion.div
            key={colIdx}
            style={{ y: yValues[colIdx], translateY: col.initialY }}
            className="flex flex-col gap-3 flex-1"
          >
            {col.blocks.map((block) => (
              <motion.button
                key={block.mood}
                layoutId={`emoji-block-${block.mood}`}
                onClick={(e) => handleClick(e, block)}
                style={{ backgroundColor: block.color, borderRadius: '1.5rem' }}
                className="flex items-center justify-center h-28 sm:h-40 md:h-52 w-full cursor-pointer border-none shrink-0 hover:brightness-110 hover:scale-[1.03] transition-all duration-200 group"
              >
                <motion.span
                  layoutId={`emoji-${block.mood}`}
                  className="text-3xl sm:text-5xl md:text-7xl group-hover:scale-110 transition-transform duration-200 leading-none select-none"
                >
                  {block.emoji}
                </motion.span>
              </motion.button>
            ))}
          </motion.div>
        ))}
      </div>

      {/* ── Expanded overlay ── */}
      <AnimatePresence>
        {expanded && (
          <>
            <motion.div
              className="fixed inset-0 z-[99]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
            />

            <motion.div
              layoutId={`emoji-block-${expanded.mood}`}
              initial={{ borderRadius: '1.5rem' }}
              animate={{ borderRadius: 0 }}
              exit={{ borderRadius: '1.5rem', opacity: 0 }}
              transition={{ type: 'spring', stiffness: 280, damping: 30 }}
              style={{ backgroundColor: expanded.color }}
              className="fixed inset-0 z-[100] flex flex-col md:flex-row overflow-hidden overflow-y-auto"
            >
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'radial-gradient(ellipse 55% 60% at 28% 52%, rgba(255,255,255,0.18) 0%, transparent 70%)',
                }}
              />

              <button
                onClick={handleClose}
                className="absolute top-6 right-6 z-10 flex items-center gap-1.5 text-white/60 hover:text-white text-xs tracking-widest uppercase bg-white/10 hover:bg-white/20 backdrop-blur-sm border-none cursor-pointer transition-all px-4 py-2 rounded-full"
              >
                ✕ Close
              </button>

              {/* Left panel */}
              <div className="flex flex-col items-center justify-center w-full md:w-[42%] px-8 md:px-12 pt-16 pb-6 md:py-0 gap-4 md:gap-5">
                <motion.span
                  layoutId={`emoji-${expanded.mood}`}
                  className="leading-none select-none"
                  style={{ fontSize: 'clamp(4rem, 20vw, 13rem)' }}
                >
                  {expanded.emoji}
                </motion.span>
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: 0.15 }}
                  className="text-center"
                >
                  <p className="text-white/60 text-xs tracking-[0.3em] uppercase mb-2">
                    You're feeling
                  </p>
                  <h2
                    className="text-white font-bold tracking-tight leading-none"
                    style={{ fontSize: 'clamp(2rem, 4.5vw, 4rem)' }}
                  >
                    {moodLabels[expanded.mood]}
                  </h2>
                </motion.div>
              </div>

              {/* Divider */}
              <motion.div
                initial={{ scaleY: 0, opacity: 0 }}
                animate={{ scaleY: 1, opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.1, duration: 0.4 }}
                className="hidden md:block w-px self-stretch my-16 origin-center"
                style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
              />

              {/* Right panel */}
              <div className="flex flex-col justify-start md:justify-center py-6 md:py-14 px-6 md:px-10 flex-1 md:max-w-3xl">
                {recLoading ? (
                  <p className="text-white/40 text-sm mb-8">Finding a movie for your mood...</p>
                ) : selectedMovie ? (
                  <>
                    <h2 className="text-2xl font-bold text-white mb-2">{selectedMovie.title}</h2>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-xs text-white/40">{selectedMovie.releaseYear}</span>
                      <span className="text-xs text-yellow-500 font-[Inter]">★ {selectedMovie.rating?.toFixed(1)}</span>
                      {(Array.isArray(selectedMovie.genres) ? selectedMovie.genres : selectedMovie.genres?.split(',') ?? []).map((g) => (
                        <span key={g} className="text-[10px] px-2 py-0.5 rounded-full bg-black/5 text-white/50">
                          {g.trim()}
                        </span>
                      ))}
                    </div>
                    <p className="text-white/60 text-sm leading-relaxed mb-8 font-[Inter]">
                      {selectedMovie.synopsis || 'An unforgettable film that perfectly reflects your mood right now.'}
                    </p>
                  </>
                ) : (
                  <p className="text-white/40 text-sm mb-8">No recommendation found. Try another mood!</p>
                )}

                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white mb-2">
                  Reason we suggest
                </h3>
                <p className="text-white/60 text-sm leading-relaxed mb-8  font-[Inter]">
                  Based on your{' '}
                  <span className="font-semibold text-white/80">{expanded.mood}</span> mood, this film's
                  tone, pacing, and emotional arc are a natural match for how you're feeling.
                </p>

                <div
                  className="rounded-2xl flex items-center justify-center mb-8"
                  style={{ backgroundColor: '#e9eaec', height: 'clamp(200px, 40vw, 372px)' }}
                >
                  {recLoading ? (
                    <div className="w-full h-full flex items-center justify-center text-white/40 text-sm">
                      Loading trailer...
                    </div>
                  ) : trailerKey ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${trailerKey}`}
                      allowFullScreen
                      className="w-full h-full rounded-2xl"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/40 text-sm">
                      No trailer available.
                    </div>
                  )}
                </div>

                <Link
                  to={`/recommendations?mood=${expanded.mood}`}
                  onClick={handleClose}
                  className="relative inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white text-sm font-[Inter] uppercase tracking-widest rounded-full no-underline transition-all hover:bg-white/90 hover:gap-3 w-full md:w-auto"
                  style={{ color: expanded.color }}
                >
                  See all<span>→</span>
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export default EmojiGrid