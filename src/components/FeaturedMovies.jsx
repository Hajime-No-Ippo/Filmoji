import { featuredMovies } from '../data/movies'
import MovieCard from './MovieCard'

function FeaturedMovies() {
  return (
    <section id="featured" className="section">
      <div className="container-main">
        <h2 className="section-title">Featured Movies</h2>
        <p className="section-subtitle">Handpicked recommendations just for you</p>
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
