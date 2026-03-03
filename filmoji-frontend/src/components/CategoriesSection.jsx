import { categories } from '../data/categories'
import CategoryCard from './CategoryCard'
import ScrollReveal from './ScrollReveal'

function CategoriesSection() {
  return (
    <section id="categories" className="section">
      <div className="container-main">
        <ScrollReveal textClassName="text-ink font-bold text-3xl">Top Categories</ScrollReveal>
        <ScrollReveal textClassName="section-subtitle" baseRotation={0} enableBlur={false}>Browse movies by your favorite genres</ScrollReveal>
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
