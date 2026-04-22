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