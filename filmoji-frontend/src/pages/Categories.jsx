import { categories } from '../data/categories'
import CategoryCard from '../components/CategoryCard'

function Categories() {
  return (
    <div className="pt-24 pb-20 px-6 min-h-screen">
      <div className="container-main">
        <h1 className="text-4xl font-bold text-white mb-2">All Categories</h1>
        <p className="section-subtitle">Explore all movie genres</p>
        <div className="grid-categories">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default Categories
