import { useState } from 'react'
import BubbleMenu from '../effects/BubbleMenu/BubbleMenu'
import Particles from '../effects/Particles/Particles'

const MENU_ITEMS = [
  {
    label: '🚀 Sci-Fi',
    value: 'Sci-Fi',
    rotation: -8,
    bgColor: 'var(--color-mood-navy)',
    textColor: '#F7F1D5',
    borderColor: 'rgba(247, 241, 213, 0.2)',
    hoverStyles: { bgColor: 'var(--color-mood-navy-hover)', textColor: '#ffffff' },
  },
  {
    label: '🎭 Drama',
    value: 'Drama',
    rotation: 8,
    bgColor: 'var(--color-mood-orange)',
    textColor: '#FFF7E7',
    borderColor: 'rgba(255, 247, 231, 0.24)',
    hoverStyles: { bgColor: 'var(--color-mood-orange-hover)', textColor: '#ffffff' },
  },
  {
    label: '😂 Comedy',
    value: 'Comedy',
    rotation: -6,
    bgColor: 'var(--color-mood-yellow)',
    textColor: '#1C1600',
    borderColor: 'rgba(28, 22, 0, 0.12)',
    hoverStyles: { bgColor: 'var(--color-mood-yellow-hover)', textColor: '#1C1600' },
  },
  {
    label: '👻 Horror',
    value: 'Horror',
    rotation: 7,
    bgColor: 'var(--color-mood-green)',
    textColor: '#F4F2E8',
    borderColor: 'rgba(244, 242, 232, 0.2)',
    hoverStyles: { bgColor: 'var(--color-mood-green-hover)', textColor: '#ffffff' },
  },
]

function RecommendationGenreStep({ onNext }) {
  const [selected, setSelected] = useState(null)

  const handlePick = (name) => {
    setSelected(name)
    window.setTimeout(() => onNext([name]), 180)
  }

  const items = MENU_ITEMS.map((item) => ({
    ...item,
    href: '#',
    ariaLabel: `Choose ${item.value}`,
    onClick: () => handlePick(item.value),
  }))

  return (
    <div className="flex flex-col min-h-[calc(100vh-10rem)]">
      <h1 className="text-4xl font-bold text-ink mb-2">What do you feel like watching?</h1>
      <p className="section-subtitle mb-8">Step 1: open the menu and choose 1 genre bubble</p>

      <div className="relative flex-1 min-h-[32rem] rounded-[2rem] border border-white bg-white overflow-hidden isolate shadow-xl">
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 text-center">
          <p className="text-sm text-[#1C1600]/55 mt-3 text-center align-center justify-center items-center font-[Inter]">
            {selected ? `Selected: ${selected}` : 'Using the same palette as the emoji blocks screen.'}
          </p>
        </div>

        {/* Particles as full section background */}
        <Particles
          particleColors={["#F5C519"]}
          particleCount={200}
          particleSpread={10}
          speed={0.1}
          particleBaseSize={100}
          moveParticlesOnHover
          alphaParticles={false}
          disableRotation={false}
          pixelRatio={1}
          className="absolute inset-0 w-full h-full"
        />
        <BubbleMenu
          className="recommendation-bubble-menu"
          logo={<span className="text-sm font-semibold tracking-[0.25em] text-[#1C1600]">GENRES</span>}
          menuAriaLabel="Open genre selection"
          menuBg="#F7F1D5"
          menuContentColor="#1C1600"
          items={items}
          style={{ top: '1.5rem' }}
        />
      </div>
    </div>
  )
}

export default RecommendationGenreStep
