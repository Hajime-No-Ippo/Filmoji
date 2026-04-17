import { useState, useEffect } from 'react'
import Hero from '../components/Hero'
import FeaturedMovies from '../components/movie/FeaturedMovies'
import CategoriesSection from '../components/category/CategoriesSection'


function Home() {
  const [movies, setMovies] = useState([])
  useEffect(() => {
    fetch('/api/movies')
      .then(res => res.json())
      // .then(data => {
      //   setMovies(data)
      //   setLoading(false)
      // })
      .then(data => {
        const mapped = data.map(movie => ({
          ...movie,
          poster: movie.posterUrl || movie.poster || movie.poster_url,
          year: movie.releaseYear || movie.release_year,
          description: movie.synopsis
        }))
        setMovies(mapped)
      })
  }, [])
//   useEffect(() => {
//   fetch('/api/debug')
//     .then(res => res.json())
//     // .then(data => {
//     //   console.log('Debug response from backend:', data)
//     .
//       const mapped = data.map(movie => ({
//         ...movie,
//         poster: movie.poster_url,
//         year: movie.release_year,
//         description: movie.synopsis
//       }))

//       setMovies(mapped)
//     })
// }, [])

  return (
    <>
      <Hero movies={movies}/>
      <FeaturedMovies movies={movies}/>
      <CategoriesSection />
    </>
  )
}

export default Home
