import { useState, useEffect } from 'react'
import Hero from '../components/Hero'
import FeaturedMovies from '../components/movie/FeaturedMovies'
import CategoriesSection from '../components/category/CategoriesSection'
import DescriptionBrick from '../components/movie/DescriptionBrick'
import TopMovies from './movie/TopMovies'
import { authFetch } from '../utils/api'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../../firebase'

function Home() {
  const [movies, setMovies] = useState([])
  const [topMovies, setTopMovies] = useState([])

  useEffect(() => {
    fetch('/api/movies')
      .then(res => res.json())
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if(!user) return 
      authFetch('/api/users/me/top-movies')
      .then(res => res.json())
      .then(data => {
        const mapped = data.map(topMovies => ({
          ...topMovies,
          poster: topMovies.posterUrl || topMovies.poster || topMovies.poster_url,
          year: topMovies.releaseYear || topMovies.release_year,
          description: topMovies.synopsis
        }))
        setTopMovies(mapped)
      })
      .catch(() => {})
    })
    return () => unsubscribe()
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
      {topMovies.length > 0 && <TopMovies movies={topMovies} />} 
      <DescriptionBrick movies={movies}/>
      <FeaturedMovies movies={movies}/>
      <CategoriesSection />
    </>
  )
}

export default Home
