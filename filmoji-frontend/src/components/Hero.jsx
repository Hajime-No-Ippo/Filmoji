import { useState } from 'react'
import { useScroll, useTransform, motion, AnimatePresence } from 'motion/react'
import { Link } from 'react-router-dom'
import { useMoviesTrailer } from '../hooks/useMoviesAPIs'
import { authFetch } from '../utils/api'
import WaveDivider from './effects/WaveDivider/WaveDivider'

// 16 basic emotion emojis split into 4 columns
const columns = [
  {
    initialY: 0,
    blocks: [
      { emoji: '😊', mood: 'happy',     color: 'var(--color-mood-yellow)' },
      { emoji: '😡', mood: 'angry',     color: 'var(--color-mood-navy)'   },
      { emoji: '😎', mood: 'cool',      color: 'var(--color-mood-blue)'   },
      { emoji: '🥳', mood: 'festive',   color: 'var(--color-mood-yellow)' },
    ],
  },
  {
    initialY: -60,
    blocks: [
      { emoji: '😢', mood: 'sad',       color: 'var(--color-mood-blue)'   },
      { emoji: '😍', mood: 'romantic',  color: 'var(--color-mood-orange)' },
      { emoji: '🤩', mood: 'excited',   color: 'var(--color-mood-green)'  },
      { emoji: '🥱', mood: 'bored',     color: 'var(--color-mood-green)'  },
    ],
  },
  {
    initialY: 40,
    blocks: [
      { emoji: '😱', mood: 'scared',    color: 'var(--color-mood-green)'  },
      { emoji: '🥺', mood: 'emotional', color: 'var(--color-mood-orange)' },
      { emoji: '🤯', mood: 'mindblown', color: 'var(--color-mood-navy)'   },
      { emoji: '😌', mood: 'peaceful',  color: 'var(--color-mood-blue)'   },
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
  happy:       '😊 Happy',
  angry:       '😡 Angry',
  cool:        '😎 Cool',
  festive:     '🥳 Festive',
  sad:         '😢 Sad',
  romantic:    '😍 Romantic',
  excited:     '🤩 Excited',
  bored:       '🥱 Bored',
  scared:      '😱 Scared',
  emotional:   '🥺 Emotional',
  mindblown:   '🤯 Mind-blown',
  peaceful:    '😌 Peaceful',
  laughing:    '😂 Laughing',
  thoughtful:  '🤔 Thoughtful',
  tense:       '😤 Tense',
  overwhelmed: '🫠 Overwhelmed',
}

    
  // useEffect(() => {
  //   fetch('/api/movies')
  //     .then(res => res.json())
  //     // .then(data => {
  //     //   setMovies(data)
  //     //   setLoading(false)
  //     // })
  //     .then(data => {
  //       const mapped = data.map(movie => ({
  //         ...movie,
  //         poster: movie.poster_url,
  //         year: movie.release_year,
  //         description: movie.synopsis
  //       }))
  //       setMovies(mapped)
  //     })
  // }, [])


const moodToEmoji = {
  happy: '😊', angry: '😡', cool: '😎', festive: '🥳',
  sad: '😢', romantic: '😍', excited: '🤩', bored: '🥱',
  scared: '😱', emotional: '🥺', mindblown: '🤯', peaceful: '😌',
  laughing: '😂', thoughtful: '🤔', tense: '😤', overwhelmed: '🫠',
}

function Hero({ movies }) {
  const { scrollY } = useScroll()
  const [expanded, setExpanded] = useState(null)
  const [selected, setSelected] = useState(movies[0] || {})
  const [loadingMovie, setLoadingMovie] = useState(false)
  const { trailerKey, loading: trailerLoading } = useMoviesTrailer(selected?.id)

  // Parallax activates once the emoji section scrolls into view (~1 viewport down)
  const y0 = useTransform(scrollY, [400, 1600], [0,  -70])
  const y1 = useTransform(scrollY, [400, 1600], [0, -190])
  const y2 = useTransform(scrollY, [400, 1600], [0,  -50])
  const y3 = useTransform(scrollY, [400, 1600], [0, -140])
  const yValues = [y0, y1, y2, y3]

  const handleClick = async (e, block) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setExpanded({ ...block, rect })
    setLoadingMovie(true)
    try {
      const emoji = moodToEmoji[block.mood] || block.emoji
      const res = await authFetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emojis: emoji }),
      })
      if (res.ok) {
        const data = await res.json()
        if (data.length > 0) {
          const m = data[0]
          setSelected({
            ...m,
            year: m.releaseYear,
            description: m.synopsis,
            poster: m.poster_url,
          })
        }
      }
    } catch (_) {}
    setLoadingMovie(false)
  }

  const handleClose = () => setExpanded(null)

// for (let i = 0; i < 10; i++) {
//   const movie = movies[i];
//   return <div>Hero{movie.title}</div>
// }
  return (
    <section className="relative">

      {/* ── 1. Title screen ── */}
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
        <h1 className="text-4xl sm:text-6xl md:text-8xl font-light tracking-[0.15em] text-ink mb-4">
          FILM📀JI
        </h1>
        <p className="text-xs sm:text-sm md:text-base tracking-[0.2em] sm:tracking-[0.4em] uppercase text-ink/70 mb-6">
          A Film Recommendation Platform
        </p>
        <p className="text-ink/40 text-sm font-[Inter] tracking-widest uppercase animate-bounce">
          Pick a mood ↓
        </p>
      </div>

      {/* ── 2. Emoji blocks screen ── */}
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
                type="button"
                aria-label={`Select mood ${moodLabels[block.mood] || block.mood}`}
                layoutId={`emoji-block-${block.mood}`}
                onClick={(e) => handleClick(e, block)}
                // Reuse this radius as main theme
                style={{ backgroundColor: block.color, borderRadius: '1.5rem' }}
                className="flex items-center justify-center h-52 w-full cursor-pointer border-none shrink-0 hover:brightness-110 hover:scale-[1.03] transition-all duration-200 group"
              >
                <motion.span
                  layoutId={`emoji-${block.mood}`}
                  className="text-7xl group-hover:scale-110 transition-transform duration-200 leading-none select-none"
                >
                  {block.emoji}
                </motion.span>
              </motion.button>
            ))}
          </motion.div>
        ))}
      </div>

      <WaveDivider />
      
      {/* Expanded emoji overlay */}
      <AnimatePresence>
        {expanded && (
          <>
            {/* Backdrop to catch outside clicks */}
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
              className="fixed inset-0 z-[100] flex overflow-hidden"
            >
              {/* Subtle radial glow behind emoji */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'radial-gradient(ellipse 55% 60% at 28% 52%, rgba(255,255,255,0.18) 0%, transparent 70%)',
                }}
              />

              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute top-6 right-6 z-10 flex items-center gap-1.5 text-white/60 hover:text-white text-xs font-[Inter] tracking-widest uppercase bg-white/10 hover:bg-white/20 backdrop-blur-sm border-none cursor-pointer transition-all px-4 py-2 rounded-full"
              >
                ✕ Close
              </button>

              {/* ── Left panel: emoji + mood identity ── */}
              <div className="flex flex-col items-center justify-center w-[42%] px-12 gap-5">
                <motion.span
                  layoutId={`emoji-${expanded.mood}`}
                  className="leading-none select-none"
                  style={{ fontSize: 'clamp(6rem, 14vw, 13rem)' }}
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
                  <p className="text-white/60 text-xs tracking-[0.3em] uppercase font-[Inter] mb-2">
                    You're feeling
                  </p>
                  <h2 className="text-white font-bold tracking-tight leading-none"
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
                className="w-px self-stretch my-16 origin-center"
                style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
              />

              {/* ── Right: film detail panel ── */}
              <div className="flex flex-col justify-center py-14 px-10 flex-1 max-w-xl">

                {loadingMovie && <p className="text-white/40 text-sm mb-4 font-[Inter]">Finding a match…</p>}
                <h2 className="text-2xl font-bold text-white mb-2">{selected.title}</h2>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs text-white/40">{selected.year}</span>
                  <span className="text-xs font-semibold text-yellow-500">★ {selected.rating}</span>
                  {(Array.isArray(selected.genres) ? selected.genres : (selected.genres || "").split(",")).map((g) => (
                    <span key={g?.id ?? g} className="text-[10px] px-2 py-0.5 rounded-full bg-black/5 text-white/50">
                      {g?.name ?? g}
                    </span>
                  ))}
                </div>

                <p className="text-white/60 text-sm leading-relaxed mb-8">
                  {selected.description ||
                    'An unforgettable film crafted with a gripping story, stunning visuals, and a tone that perfectly reflects your mood right now.'}
                </p>

                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white mb-2">
                  Reason we suggest
                </h3>
                <p className="text-white/60 text-sm leading-relaxed mb-8">
                  Based on your{' '}
                  <span className="font-semibold text-white/80">{expanded.mood}</span> mood, this film's
                  tone, pacing, and emotional arc are a natural match for how you're feeling.
                </p>

                {/* Trailer placeholder */}
                <div
                  className="rounded-2xl flex items-center justify-center mb-8 cursor-pointer hover:brightness-[0.97] transition-all"
                  style={{ backgroundColor: '#e9eaec', height: 372 }}
                >
                  {/* <div className="flex flex-col items-center gap-2 text-ink/30">
                    <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
                      <circle cx="22" cy="22" r="22" fill="currentColor" fillOpacity="0.12" />
                      <polygon points="18,14 33,22 18,30" fill="currentColor" fillOpacity="0.45" />
                    </svg>
                    <span className="text-xs tracking-widest uppercase">Trailer</span>
                  </div> */}
                  {trailerLoading ? (
                    <div className="w-full h-full flex items-center justify-center text-white/40 text-sm">
                      Loading trailer...
                    </div>
                  ) : trailerKey ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${trailerKey}`}
                      allowFullScreen
                      className="w-full h-full"
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
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-sm font-bold uppercase tracking-widest rounded-full no-underline transition-all hover:bg-white/90 hover:gap-3 self-start"
                  style={{ color: expanded.color }}
                >
                  See all recommendations <span>→</span>
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      
    </section>
  )
}

export default Hero
