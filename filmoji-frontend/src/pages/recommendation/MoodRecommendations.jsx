import { useState } from 'react'
import { featuredMovies } from '../../data/movies'
import { useMoviesTrailer } from '../../hooks/useMoviesAPIs'

// ── Fan geometry ─────────────────────────────────────────────────────────────
const CX = 100, CY = 400, R1 = 128, R2 = 318
const FAN_W = 460, FAN_H = 730

const SLICES = [
  { a1: -90, a2: -58 },
  { a1: -54, a2: -22 },
  { a1: -18, a2:  14 },
  { a1:  18, a2:  50 },
  { a1:  54, a2:  86 },
]

const IMG_W = 112, IMG_H = 168

function toRad(deg) { return deg * Math.PI / 180 }

function sliceClipPath(a1, a2) {
  const pt = (r, d) =>
    `${(CX + r * Math.cos(toRad(d))).toFixed(1)}px ${(CY + r * Math.sin(toRad(d))).toFixed(1)}px`
  const pts = [pt(R1, a1)]
  for (let i = 0; i <= 6; i++) pts.push(pt(R2, a1 + (a2 - a1) * i / 6))
  pts.push(pt(R1, a2))
  return `polygon(${pts.join(', ')})`
}

function sliceCenter(a1, a2) {
  const am = (a1 + a2) / 2
  const rm = (R1 + R2) / 2
  return {
    x: CX + rm * Math.cos(toRad(am)),
    y: CY + rm * Math.sin(toRad(am)),
  }
}

// ── Props: emoji, color, mood (strings) ──────────────────────────────────────
export default function MoodRecommendations({ emoji = '😊', color = '#F5C519', mood = 'happy' }) {
  const movies = featuredMovies.slice(0, 5)
  const [selectedIdx, setSelectedIdx] = useState(0)
  const selected = movies[selectedIdx]
  const { trailerKey, loading: trailerLoading } = useMoviesTrailer(selected.id)

  // TODO: remove this test line once backend is ready   
  const testTrailerKey = 'dQw4w9WgXcQ'

  return (
    <div className="min-h-screen bg-white flex items-stretch">

      {/* ── Left: pie-slice fan carousel ── */}
      <div
        className="relative flex-shrink-0 overflow-hidden"
        style={{ width: FAN_W, height: FAN_H }}
      >
        {SLICES.map(({ a1, a2 }, i) => {
          const { x, y } = sliceCenter(a1, a2)
          const movie = movies[i]
          const isSelected = i === selectedIdx

          return (
            <div
              key={i}
              onClick={() => setSelectedIdx(i)}
              style={{
                position: 'absolute',
                inset: 0,
                clipPath: sliceClipPath(a1, a2),
                backgroundColor: '#d1d5db',
                cursor: 'pointer',
                opacity: isSelected ? 1 : 0.55,
                transition: 'opacity 0.2s',
              }}
            >
              <img
                src={movie.poster}
                alt={movie.title}
                style={{
                  position: 'absolute',
                  width: IMG_W,
                  height: IMG_H,
                  left: x - IMG_W / 2,
                  top: y - IMG_H / 2,
                  objectFit: 'cover',
                }}
              />
            </div>
          )
        })}

        {/* Emoji pivot */}
        <div
          style={{
            position: 'absolute',
            left: CX,
            top: CY,
            transform: 'translate(-50%, -50%)',
            fontSize: 190,
            lineHeight: 1,
            userSelect: 'none',
            zIndex: 10,
            pointerEvents: 'none',
          }}
        >
          {emoji}
        </div>
      </div>

      {/* ── Right: film detail panel ── */}
      <div className="flex flex-col justify-center py-14 px-10 flex-1 max-w-xl">

        <h2 className="text-2xl font-bold text-ink mb-2">{selected.title}</h2>
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs text-ink/40">{selected.year}</span>
          <span className="text-xs font-semibold text-yellow-500">★ {selected.rating}</span>
          {selected.genres.map((g) => (
            <span key={g} className="text-[10px] px-2 py-0.5 rounded-full bg-black/5 text-ink/50">
              {g}
            </span>
          ))}
        </div>

        <p className="text-ink/60 text-sm leading-relaxed mb-8">
          {selected.description ||
            'An unforgettable film crafted with a gripping story, stunning visuals, and a tone that perfectly reflects your mood right now.'}
        </p>

        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-ink mb-2">
          Reason we suggest
        </h3>
        <p className="text-ink/60 text-sm leading-relaxed mb-8">
          Based on your{' '}
          <span className="font-semibold text-ink/80">{mood}</span> mood, this film's
          tone, pacing, and emotional arc are a natural match for how you're feeling.
        </p>

        {/* Trailer */}
        <div className="rounded-2xl overflow-hidden mb-8" style={{ height: 172 }}>
          {trailerLoading ? (
            <div className="w-full h-full flex items-center justify-center bg-black/5 text-sm text-ink/40">
              Loading trailer...
            </div>
          ) : trailerKey ? (
            <iframe
              src={`https://www.youtube.com/embed/${testTrailerKey}`}
              // title={`${selected.title} trailer`}
              allowFullScreen
              className="w-full h-full"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-black/5 text-sm text-ink/40">
              No trailer available.
            </div>
          )}
        </div>

        <div>
          <button
            className="px-7 py-3 rounded-full text-white text-sm font-semibold tracking-wide border-none cursor-pointer transition-all hover:brightness-110"
            style={{ backgroundColor: color }}
          >
            Recommend another →
          </button>
        </div>
      </div>
    </div>
  )
}
