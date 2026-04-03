import { featuredMovies } from '../../data/movies'
import { useMoviesWithPosters } from '../../hooks/useMoviesAPIs'
import MovieCard from './MovieCard'
import DescriptionBrick from './DescriptionBrick'

function FeaturedMovies() {
  const { movies, loading } = useMoviesWithPosters(featuredMovies)

  if (loading) return <div className="container-main">Updating movie posters...</div>;

  return (
    <div>
    <section id="description" className="section">
      <DescriptionBrick />
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