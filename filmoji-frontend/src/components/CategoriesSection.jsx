import { categories } from '../data/categories'
import CategoryCard from './CategoryCard'

function CategoriesSection() {
  return (
    <section id="categories" className="section">
      <div className="container-main">
        <h2 className="section-title">Top Categories</h2>
        <p className="section-subtitle">Browse movies by your favorite genres</p>
        <div className="grid-categories">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default CategoriesSection
