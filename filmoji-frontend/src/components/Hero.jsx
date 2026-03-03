import { useState } from 'react'
import { useScroll, useTransform, motion, AnimatePresence } from 'motion/react'
import { Link } from 'react-router-dom'
import { featuredMovies } from '../data/movies'
import WaveDivider from './WaveDivider'

// 16 basic emotion emojis split into 4 columns
const columns = [
  {
    initialY: 0,
    blocks: [
      { emoji: '😊', mood: 'happy',     color: '#F5C519' },
      { emoji: '😡', mood: 'angry',     color: '#1A3A8F' },
      { emoji: '😎', mood: 'cool',      color: '#3B5BDB' },
      { emoji: '🥳', mood: 'festive',   color: '#F5C519' },
    ],
  },
  {
    initialY: -60,
    blocks: [
      { emoji: '😢', mood: 'sad',       color: '#3B5BDB' },
      { emoji: '😍', mood: 'romantic',  color: '#E05A2B' },
      { emoji: '🤩', mood: 'excited',   color: '#2D6A4F' },
      { emoji: '😴', mood: 'bored',     color: '#2D6A4F' },
    ],
  },
  {
    initialY: 40,
    blocks: [
      { emoji: '😱', mood: 'scared',    color: '#2D6A4F' },
      { emoji: '🥺', mood: 'emotional', color: '#E05A2B' },
      { emoji: '🤯', mood: 'mindblown', color: '#1A3A8F' },
      { emoji: '😌', mood: 'peaceful',  color: '#3B5BDB' },
    ],
  },
  {
    initialY: -20,
    blocks: [
      { emoji: '😂', mood: 'laughing',     color: '#F5C519' },
      { emoji: '🤔', mood: 'curious',      color: '#2D6A4F' },
      { emoji: '😤', mood: 'tense',        color: '#E05A2B' },
      { emoji: '🫠', mood: 'overwhelmed',  color: '#3B5BDB' },
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
  bored:       '😴 Bored',
  scared:      '😱 Scared',
  emotional:   '🥺 Emotional',
  mindblown:   '🤯 Mind-blown',
  peaceful:    '😌 Peaceful',
  laughing:    '😂 Laughing',
  curious:     '🤔 Curious',
  tense:       '😤 Tense',
  overwhelmed: '🫠 Overwhelmed',
}

function Hero() {
  const { scrollY } = useScroll()
  const [expanded, setExpanded] = useState(null)   // { emoji, mood, color, rect }

  // Parallax activates once the emoji section scrolls into view (~1 viewport down)
  const y0 = useTransform(scrollY, [400, 1600], [0,  -70])
  const y1 = useTransform(scrollY, [400, 1600], [0, -190])
  const y2 = useTransform(scrollY, [400, 1600], [0,  -50])
  const y3 = useTransform(scrollY, [400, 1600], [0, -140])
  const yValues = [y0, y1, y2, y3]

  const handleClick = (e, block) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setExpanded({ ...block, rect })
  }

  const handleClose = () => setExpanded(null)

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
      <div className="relative min-h-screen overflow-hidden flex gap-3 p-3 pt-24">
        
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
              initial={{
                borderRadius: '1.5rem',
              }}
              animate={{
                borderRadius: 0,
              }}
              exit={{
                borderRadius: '1.5rem',
                opacity: 0,
              }}
              transition={{ type: 'spring', stiffness: 280, damping: 30 }}
              style={{ backgroundColor: expanded.color }}
              className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden"
            >
              {/* Close hint */}
              <button
                onClick={handleClose}
                className="absolute top-6 right-6 text-white/60 hover:text-white text-sm font-[Inter] tracking-widest uppercase bg-transparent border-none cursor-pointer transition-colors"
              >
                ✕ Close
              </button>

              {/* Big emoji */}
              <motion.span
                layoutId={`emoji-${expanded.mood}`}
                className="text-[22vw] leading-none select-none mb-6"
              >
                {expanded.emoji}
              </motion.span>

              {/* Mood label */}
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.15 }}
                className="text-white text-3xl sm:text-5xl font-bold tracking-wide mb-4"
              >
                {moodLabels[expanded.mood]}
              </motion.h2>

              {/* Movie teasers */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col items-center gap-6"
              >
                <p className="text-white/70 text-sm font-[Inter] tracking-widest uppercase">
                  Movies for this mood
                </p>

                <div className="flex gap-3 overflow-hidden">
                  {featuredMovies.slice(0, 4).map((movie) => (
                    <div key={movie.id} className="w-24 shrink-0">
                      <img
                        src={movie.poster}
                        alt={movie.title}
                        className="w-full aspect-[2/3] object-cover rounded-xl shadow-xl"
                      />
                    </div>
                  ))}
                </div>

                <Link
                  to={`/recommendations?mood=${expanded.mood}`}
                  onClick={handleClose}
                  className="mt-2 px-8 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-semibold text-sm uppercase tracking-widest rounded-full no-underline transition-colors"
                >
                  See all recommendations →
                </Link>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      
    </section>
  )
}

export default Hero
