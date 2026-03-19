import { useEffect } from 'react'
import Hero from '../components/Hero'
import FeaturedMovies from '../components/FeaturedMovies'
import CategoriesSection from '../components/CategoriesSection'

function Home() {
  useEffect(() => {
    fetch('http://localhost:8080/api/debug')
      .then(res => res.json())
      .then(data => console.log('Debug response from backend:', data))
  }, [])

  return (
    <>
      <Hero />
      <FeaturedMovies />
      <CategoriesSection />
    </>
  )
}

export default Home
