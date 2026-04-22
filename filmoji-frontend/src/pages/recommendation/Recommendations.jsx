import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import MovieCard from "../../components/movie/MovieCard";

const moodLabels = {
  happy: "😊 Happy",
  angry: "😡 Angry",
  cool: "😎 Cool",
  festive: "🥳 Festive",
  sad: "😢 Sad",
  romantic: "😍 Romantic",
  excited: "🤩 Excited",
  bored: "🥱 Bored",
  scared: "😱 Scared",
  emotional: "🥺 Emotional",
  mindblown: "🤯 Mind-blown",
  peaceful: "😌 Peaceful",
  laughing: "😂 Laughing",
  thoughtful: "🤔 Thoughtful",
  tense: "😤 Tense",
  overwhelmed: "🫠 Overwhelmed",
};

function Recommendations() {
  const [searchParams] = useSearchParams();
  const mood = searchParams.get("mood") || "";
  const label = moodLabels[mood] || mood;
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/movies")
      .then((res) => res.json())
      .then((data) =>
        setMovies(
          data.map((m) => ({
            id: m.id,
            title: m.title,
            poster: m.posterUrl || "",
            year: m.releaseYear,
            rating: m.rating,
            genres: Array.isArray(m.genres) ? m.genres : (m.genres?.split(",") ?? []),
          })),
        ),
      )
      .catch(() => setMovies([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="container-main">
        <Link to="/" className="accent-link text-sm mb-8 inline-block">
          ← Back
        </Link>

        <h1 className="text-3xl font-bold text-ink mb-2">
          {label ? `Feeling ${label}?` : "Recommendations"}
        </h1>
        <p className="section-subtitle mb-10">
          Movies picked for your current mood
        </p>

        {loading ? (
          <div className="text-muted">Loading movies...</div>
        ) : (
          <div className="grid-movies">
            {movies.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                showWatchlistButton={false}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Recommendations;
