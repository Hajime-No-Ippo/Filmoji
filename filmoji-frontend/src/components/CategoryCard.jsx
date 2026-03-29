import { Link } from "react-router-dom";

function CategoryCard({ category }) {
  return (
    <Link to={`/category/${encodeURIComponent(category.name)}`}>
      <div className="card-base card-hover p-6 text-center cursor-pointer hover:bg-card-hover hover:border-accent/60 transition-all duration-300 h-full">
        <span className="text-4xl block mb-3">{category.emoji}</span>
        <h3 className="text-ink font-semibold mb-1">{category.name}</h3>
        <p className="text-muted text-sm">{category.count} movies</p>
      </div>
    </Link>
  );
}

export default CategoryCard;
