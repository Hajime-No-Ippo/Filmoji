function CategoryCard({ category }) {
  return (
    <div className="card-base card-hover border border-border p-6 text-center cursor-pointer hover:bg-card-hover hover:border-white/20">
      <span className="text-4xl block mb-3">{category.emoji}</span>
      <h3 className="text-white font-semibold mb-1">{category.name}</h3>
      <p className="text-muted text-sm">{category.count} movies</p>
    </div>
  )
}

export default CategoryCard
