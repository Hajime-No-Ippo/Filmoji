import { featuredMovies } from '../data/movies'
import MovieCard from './MovieCard'
import ScrollReveal from './ScrollReveal'

function FeaturedMovies() {
  return (
    <section id="featured" className="section">
      <div className="container-main">
        <ScrollReveal textClassName="text-ink font-bold text-3xl">Featured Movies</ScrollReveal>
        <ScrollReveal textClassName="section-subtitle" baseRotation={0} enableBlur={false}>Handpicked recommendations just for you</ScrollReveal>
        <div className="grid-movies">
          {featuredMovies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default FeaturedMovies
