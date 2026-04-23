import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { categories } from "../../data/categories";

function CategoryDetail() {
  const { name } = useParams();
  const decodedName = decodeURIComponent(name);
  const category = categories.find((c) => c.name === decodedName);

  const [topMovies, setTopMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/movies")
      .then((res) => res.json())
      .then((data) => {
        const filtered = data
          .filter((m) => {
            // Handle genres as array of objects [{id, name}, ...]
            if (Array.isArray(m.genres)) {
              return m.genres.some(
                (g) => g.name?.toLowerCase() === decodedName.toLowerCase(),
              );
            }
            // Fallback for string format
            return m.genres?.toLowerCase().includes(decodedName.toLowerCase());
          })
          .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
          .slice(0, 5);
        setTopMovies(filtered);
      })
      .catch(() => setTopMovies([]))
      .finally(() => setLoading(false));
  }, [decodedName]);

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

  return (
    <div className="bg-dark min-h-screen pt-20 pb-20">
      <div className="container-main px-4">
        <Link
          to="/categories"
          className="nav-link flex items-center gap-2 text-sm mb-8 inline-block"
        >
          ← Back to Categories
        </Link>

        <h1 className="text-ink font-bold text-3xl md:text-4xl mb-2">
          {category.emoji} {decodedName}
        </h1>
        <p className="section-subtitle mb-4">
          Top 5 Highest Rated {decodedName} Movies
        </p>

        {loading ? (
          <p className="text-muted">Loading...</p>
        ) : topMovies.length > 0 ? (
          <div className="space-y-4 max-w-2xl">
            {topMovies.map((movie, index) => (
              <Link
                key={movie.id}
                to={`/movie/${movie.id}`}
                className="group card-base card-hover p-6 flex items-center gap-6 hover:bg-card-hover hover:border-accent/60 transition-all duration-300"
              >
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent via-accent to-accent/70 flex items-center justify-center">
                    <span className="text-ink font-bold text-lg">
                      #{index + 1}
                    </span>
                  </div>
                </div>
                <div className="flex-grow">
                  <h3 className="text-ink font-semibold text-lg group-hover:text-accent transition-colors">
                    {movie.title}
                  </h3>
                  <p className="text-muted text-sm">{movie.releaseYear}</p>
                </div>
                <div className="flex-shrink-0 text-right">
                  <div className="flex items-center gap-2 justify-end mb-2">
                    <span className="text-yellow-500 text-xl">★</span>
                    <span className="text-ink font-bold text-2xl">
                      {movie.rating?.toFixed(1)}
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
