import { useParams, Link } from "react-router-dom";
import { featuredMovies } from "../data/movies";
import { categories } from "../data/categories";

function CategoryDetail() {
  const { name } = useParams();
  const decodedName = decodeURIComponent(name);
  const category = categories.find((c) => c.name === decodedName);

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white pt-20">
        <div className="text-center">
          <p className="text-xl mb-4">Category not found.</p>
          <Link to="/categories" className="accent-link">
            ← Back to Categories
          </Link>
        </div>
      </div>
    );
  }

  // Get all movies in this category, sorted by rating from high to low, take top 5
  const topMovies = featuredMovies
    .filter((movie) => movie.genres.includes(decodedName))
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 5);

  return (
    <div className="bg-dark min-h-screen pt-20 pb-20">
      <div className="container-main px-4">
        {/* Back button */}
        <Link
          to="/categories"
          className="nav-link flex items-center gap-2 text-sm mb-8 inline-block"
        >
          ← Back to Categories
        </Link>

        {/* Category title */}
        <h1 className="text-ink font-bold text-3xl md:text-4xl mb-2">
          {category.emoji} {decodedName}
        </h1>
        <p className="section-subtitle mb-4">
          Top 5 Highest Rated {decodedName} Movies
        </p>

        {/* Ranking list */}
        {topMovies.length > 0 ? (
          <div className="space-y-4 max-w-2xl">
            {topMovies.map((movie, index) => (
              <Link
                key={movie.id}
                to={`/movie/${movie.id}`}
                className="group card-base card-hover p-6 flex items-center gap-6 hover:bg-card-hover hover:border-accent/60 transition-all duration-300"
              >
                {/* Ranking */}
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent via-accent to-accent/70 flex items-center justify-center">
                    <span className="text-ink font-bold text-lg">
                      #{index + 1}
                    </span>
                  </div>
                </div>

                {/* Movie info */}
                <div className="flex-grow">
                  <h3 className="text-ink font-semibold text-lg group-hover:text-accent transition-colors">
                    {movie.title}
                  </h3>
                  <p className="text-muted text-sm">{movie.year}</p>
                </div>

                {/* Rating */}
                <div className="flex-shrink-0 text-right">
                  <div className="flex items-center gap-2 justify-end mb-2">
                    <span className="text-yellow-500 text-xl">★</span>
                    <span className="text-ink font-bold text-2xl">
                      {movie.rating}
                    </span>
                  </div>
                  <p className="text-muted text-xs">/10 IMDb</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted text-lg">
              No movies found in the {decodedName} category.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default CategoryDetail;
