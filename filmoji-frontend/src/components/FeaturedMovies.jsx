import { featuredMovies } from '../data/movies'
import { useMoviesWithPosters } from '../hooks/useMoviesAPIs'
import CardSwap, { Card } from './CardSwap/CardSwap'
import MovieCard from './MovieCard'

function FeaturedMovies() {
  const { movies, loading } = useMoviesWithPosters(featuredMovies)

  if (loading) return <div className="container-main">Updating movie posters...</div>;


  return (
    <div>
    <section id = "description" className = "section">

      <div
        className="overflow-hidden border border-border bg-card m-7"
        style={{ borderRadius: '1.5rem', display: 'flex', alignItems: 'center', minHeight: '600px' }}
      >
        {/* Left Section: title and description */}
        <div style={{ flex: '0 0 60%', padding: '3rem 2.5rem' }}>
          <h1 className="section-title">Get your favourite Movie from Filmoji</h1>
          <p className="section-subtitle">Try the latest recommendation function!</p>
        </div>

        {/* Right Section: CardSwap effect */}
        <div style={{ flex: 1, height: '600px', position: 'relative' }}>
          <CardSwap
            cardDistance={60}
            verticalDistance={70}
            delay={5000}
            pauseOnHover={false}
          >
            <Card>
              <h3></h3>
              <p></p>
            </Card>
            <Card>
              <h3></h3>
              <p></p>
            </Card>
            <Card>
              <h3></h3>
              <p></p>
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