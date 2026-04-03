import Hero from '../components/Hero'
import FeaturedMovies from '../components/movie/FeaturedMovies'
import CategoriesSection from '../components/category/CategoriesSection'
import DescriptionBrick from '../components/movie/DescriptionBrick'

function Home() {
  return (
    <>
      <Hero />
      <DescriptionBrick />
      <FeaturedMovies />
      <CategoriesSection />
    </>
  )
}

export default Home
