import { useState, useEffect } from 'react'
import MovieCard from './MovieCard'
import DescriptionBrick from './DescriptionBrick'

function FeaturedMovies() {
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/movies')
      .then((res) => res.json())
      .then((data) => setMovies(data))
      .catch(() => setMovies([]))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="container-main">Loading movies...</div>

  return (
    <div>
      <section id="description" className="section">
      </section>

      <section id="featured" className="section">
        <div className="container-main">
          <h2 className="section-title">Featured Movies</h2>
          <p className="section-subtitle">Handpicked recommendations just for you</p>
          <div className="grid-movies">
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={{
                id: movie.id,
                title: movie.title,
                poster: movie.posterUrl,
                year: movie.releaseYear,
                rating: movie.rating,
                genres: movie.genres?.split(',') ?? [],
                tmdbId: movie.tmdbId,
              }} />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default FeaturedMovies
