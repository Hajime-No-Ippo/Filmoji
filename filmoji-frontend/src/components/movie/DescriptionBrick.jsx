import CardSwap, { Card } from '../effects/CardSwap/CardSwap'
import Particles from '../effects/Particles/Particles'

function DescriptionBrick({ movies }) {
  return (
    <div className="relative gap-3 p-3 pt-30">
      <div
        className="overflow-hidden border border-border bg-card"
        style={{ borderRadius: '1.5rem', display: 'flex', alignItems: 'center', minHeight: '600px', position: 'relative' }}
      >
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

        {/* Left: title and description */}
        <div style={{ flex: '0 0 60%', padding: '3rem 2.5rem', position: 'relative', zIndex: 1 }}>
          <h1 className="section-title">Get a personalised recommendation from Filmoji</h1>
          <p className="section-subtitle">Try the latest recommendation function!</p>
        </div>

       {/* Right Section: CardSwap effect */}
        <div style={{ flex: 1, height: '600px', position: 'relative' }}>
          {movies.length > 0 && (
            <CardSwap
              cardDistance={60}
              verticalDistance={70}
              delay={5000}
              pauseOnHover={false}
              >
              {/** Place Holder
               * Could be place any content in the cards for effects
               */}
                {/* Render up to 6 poster cards using the passed `movies` prop */}
                {movies.slice(0, 6).map((m, idx) => (
                  <Card key={m.id} className="overflow-hidden rounded-2xl bg-card flex items-center justify-center">
                    {m.poster ? (
                      <img
                      src={m.poster || m.posterUrl}
                      alt={m.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      />
                    ) : (
                      <div className="text-muted text-sm">No poster</div>
                    )}
                  </Card>
                ))}
            </CardSwap>
          )}
        </div>
      </div>
    </div>
  )
}

export default DescriptionBrick
