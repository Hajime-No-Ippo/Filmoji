//import { featuredMovies } from '../data/movies'
// import { useState, useEffect } from 'react'
// import { useMoviesWithPosters } from '../hooks/useMoviesAPIs'
import CardSwap, { Card } from '../effects/CardSwap/CardSwap'
import MovieCard from './MovieCard'

function FeaturedMovies({ movies }) {

    // const [movies, setMovies] = useState([])
   // const [loading, setLoading] = useState(true)

  // useEffect(() => {
  //   fetch('/api/movies')
  //     .then(res => res.json())
  //     // .then(data => {
  //     //   setMovies(data)
  //     //   setLoading(false)
  //     // })
  //     .then(data => {
  //       const mapped = data.map(movie => ({
  //         ...movie,
  //         poster: movie.poster_url,
  //         year: movie.release_year,
  //         description: movie.synopsis
  //       }))
  //       setMovies(mapped)
  //     })
  // }, [])

  //if (loading) return <div className="container-main">Updating movie posters...</div>;
// for (let i = 0; i < 10; i++) {
//   const movie = movies[i];
//   return <div>Feature{movie.title}</div>
// }

  return (
    <div>
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