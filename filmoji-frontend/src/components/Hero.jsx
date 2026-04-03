import { useScroll, useTransform } from 'motion/react'
import WaveDivider from './effects/WaveDivider/WaveDivider'
import EmojiGrid from './effects/EmojiGrid'

function Hero() {
  const { scrollY } = useScroll()

  const y0 = useTransform(scrollY, [400, 1600], [0,  -70])
  const y1 = useTransform(scrollY, [400, 1600], [0, -190])
  const y2 = useTransform(scrollY, [400, 1600], [0,  -50])
  const y3 = useTransform(scrollY, [400, 1600], [0, -140])
  const yValues = [y0, y1, y2, y3]

  return (
    <section className="relative">
      {/* ── Title screen ── */}
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
        <h1 className="text-4xl sm:text-6xl md:text-8xl font-light tracking-[0.15em] text-ink mb-4">
          FILM📀JI
        </h1>
        <p className="text-xs sm:text-sm md:text-base tracking-[0.2em] sm:tracking-[0.4em] uppercase text-ink/70 mb-6">
          A Film Recommendation Platform
        </p>
        <p className="text-ink/40 text-sm tracking-widest uppercase animate-bounce">
          Pick a mood ↓
        </p>
      </div>
      <EmojiGrid yValues={yValues} />
      <WaveDivider />
    </section>
  )
}

export default Hero