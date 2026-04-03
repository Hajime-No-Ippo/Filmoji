import { featuredMovies } from '../data/movies'
import { useMoviesWithPosters } from '../hooks/useMoviesAPIs'
import CardSwap, { Card } from './CardSwap/CardSwap'
import MovieCard from './MovieCard'
import Particles from './Particles/Particles'

function FeaturedMovies() {
  const { movies, loading } = useMoviesWithPosters(featuredMovies)

  if (loading) return <div className="container-main">Updating movie posters...</div>;


  return (
    <div>
    <section id = "description" className = "section">

      <div
        className="overflow-hidden border border-border bg-card m-7"
        style={{ borderRadius: '1.5rem', display: 'flex', alignItems: 'center', minHeight: '600px', position: 'relative' }}
      >
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

        {/* Left Section: title and description */}
        <div style={{ flex: '0 0 60%', padding: '3rem 2.5rem', position: 'relative', zIndex: 1 }}>
          <h1 className="section-title">Get your favourite Movie from Filmoji</h1>
          <p className="section-subtitle">Try the latest recommendation function!</p>
        </div>

        {/* Right Section: CardSwap */}
        <div style={{ flex: 1, height: '600px', position: 'relative', zIndex: 1 }}>
          <CardSwap
            cardDistance={60}
            verticalDistance={70}
            delay={5000}
            pauseOnHover={false}
          >
            {/** Place Holder
             * Could be place any content in the cards for effects
             */}
            <Card>
            </Card>

            <Card>
            </Card>

            <Card>
            </Card>

            <Card>
            </Card>

            <Card>
            </Card>

            <Card>
            </Card>
          </CardSwap>
        </div>
      </div>
    </section>

    <section id="featured" className="section">
      <div className="container-main">
        <h2 className="section-title"
        style ={{}}>
          Featured Movies</h2>
        <p className="section-subtitle">Handpicked recommendations just for you</p>
        <div className="grid-movies">
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </div>
    </section>
    </div>
  )
}

export default FeaturedMovies