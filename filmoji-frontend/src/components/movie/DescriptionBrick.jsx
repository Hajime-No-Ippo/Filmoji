import CardSwap, { Card } from '../effects/CardSwap/CardSwap'
import Particles from '../effects/Particles/Particles'

function DescriptionBrick() {
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

        {/* Right: CardSwap */}
        <div style={{ flex: 1, height: '600px', position: 'relative', zIndex: 1 }}>
          <CardSwap cardDistance={60} verticalDistance={70} delay={5000} pauseOnHover={false}>
            <Card> <img src = "https://imgs.search.brave.com/Hyzh5xwDnpqoBP6GZ01GRdsGHiiBFBBoTWyYy-FK_0M/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9wcmV2/aWV3LnJlZGQuaXQv/d2hhdC1oYXMtYmVl/bi10aGUtYmVzdC1t/b3ZpZS1wb3N0ZXIt/b2YtMjAyNS1zby1m/YXItdjAtbmwyMWlj/OTRja3RmMS5qcGVn/P3dpZHRoPTE2Mzgm/Zm9ybWF0PXBqcGcm/YXV0bz13ZWJwJnM9/OGI4M2NiNjZlM2U3/NDYxYzdlMGY5ZDEy/N2IyOGNmMzliMzE2/ZWUwYw"></img> </Card>
            <Card />
            <Card />
            <Card />
            <Card />
            <Card />
          </CardSwap>
        </div>
      </div>
    </div>
  )
}

export default DescriptionBrick
