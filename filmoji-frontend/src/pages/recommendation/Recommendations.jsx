import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import MovieCard from "../../components/movie/MovieCard";
import { authFetch } from "../../utils/api";

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

const moodToEmoji = {
  happy: '😊', angry: '😡', cool: '😎', festive: '🥳',
  sad: '😢', romantic: '😍', excited: '🤩', bored: '🥱',
  scared: '😱', emotional: '🥺', mindblown: '🤯', peaceful: '😌',
  laughing: '😂', thoughtful: '🤔', tense: '😤', overwhelmed: '🫠',
};

function Recommendations() {
  const [searchParams] = useSearchParams();
  // Accept ?moods=happy,romantic,adventure (preferred) OR legacy ?mood=happy
  const moodsParam = searchParams.get("moods");
  const moods = moodsParam
    ? moodsParam.split(",").map((m) => m.trim()).filter(Boolean)
    : (searchParams.get("mood") ? [searchParams.get("mood")] : []);

  const labels = moods.map((m) => moodLabels[m] || m);
  const headingLabel = labels.join(" + ");

  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    if (moods.length > 0) {
      const emojiCombo = moods.map((m) => moodToEmoji[m] || m).join("");
      authFetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emojis: emojiCombo }),
      })
        .then((res) => {
          if (!res.ok) throw new Error('No recommendations');
          return res.json();
        })
        .then((data) =>
          setMovies(
            data.map((m) => ({
              id: m.id,
              title: m.title,
              poster: m.posterUrl || "",
              year: m.releaseYear,
              rating: m.rating,
              genres: Array.isArray(m.genres) ? m.genres : (m.genres?.split(",") ?? []),
              description: m.synopsis || m.description || "",
            })),
          ),
        )
        .catch(() => setMovies([]))
        .finally(() => setLoading(false));

      return;
    }

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moodsParam, searchParams.get("mood")]);

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="container-main">
        <Link to="/" className="accent-link text-sm mb-8 inline-block">
          ← Back
        </Link>

        <h1 className="text-3xl font-bold text-ink mb-2">
          {headingLabel ? `Feeling ${headingLabel}?` : "Recommendations"}
        </h1>
        <p className="section-subtitle mb-10">
          {moods.length > 1
            ? `Movies picked for your blended mood (${moods.length} emojis)`
            : "Movies picked for your current mood"}
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
