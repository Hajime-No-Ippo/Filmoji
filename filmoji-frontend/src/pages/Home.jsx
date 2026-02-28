import { useEffect, useState } from "react";
import Hero from "../components/Hero";
import FeaturedMovies from "../components/FeaturedMovies";
import CategoriesSection from "../components/CategoriesSection";
import { fetchMovies } from "../api/movies";

function Home() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchMovies()
      .then((data) => setMovies(data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Hero />

      {/* ✅ Temporary integration check (remove later) */}
      <div style={{ padding: "0 16px", marginTop: 12 }}>
        {loading && <p>Loading movies…</p>}
        {error && <p style={{ color: "crimson" }}>Error: {error}</p>}
        {!loading && !error && <p>Loaded {movies.length} movies ✅</p>}

        {!loading && !error && (
          <details style={{ marginTop: 8 }}>
            <summary>See raw movies JSON</summary>
            <pre style={{ whiteSpace: "pre-wrap" }}>
              {JSON.stringify(movies, null, 2)}
            </pre>
          </details>
        )}
      </div>

      <FeaturedMovies />
      <CategoriesSection />
    </>
  );
}

export default Home;