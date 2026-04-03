import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { db } from "../../../firebase";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { ReviewsWall } from "../../components/effects/ReviewsColumn/ReviewsColumn";

function MovieReviews() {
  const [searchParams] = useSearchParams()
  const [selectedMovie, setSelectedMovie] = useState(searchParams.get('movieId'));
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [averageRating, setAverageRating] = useState(0);
  const [allReviews, setAllReviews] = useState([]);
  const [allMovies, setAllMovies] = useState([]);

  useEffect(() => {
    fetch('/api/movies')
      .then((res) => res.json())
      .then((data) => setAllMovies(data))
      .catch(() => {})
  }, [])

  // Fetch all recent reviews for the wall
  useEffect(() => {
    const q = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'), limit(30))
    getDocs(q).then((snap) => {
      setAllReviews(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    })
  }, []);

  useEffect(() => {
    if (selectedMovie) {
      loadMovieReviews(parseInt(selectedMovie));
    }
  }, [selectedMovie]);

  const loadMovieReviews = async (movieId) => {
    setLoading(true);
    try {
      const reviewsRef = collection(db, "reviews");
      const q = query(
        reviewsRef,
        where("movieId", "==", movieId),
        orderBy("createdAt", "desc"),
      );
      const querySnapshot = await getDocs(q);
      const reviewsList = [];
      let totalRating = 0;

      querySnapshot.forEach((doc) => {
        const reviewData = doc.data();
        reviewsList.push({
          id: doc.id,
          ...reviewData,
        });
        totalRating += reviewData.rating;
      });

      setReviews(reviewsList);
      setAverageRating(
        reviewsList.length > 0
          ? (totalRating / reviewsList.length).toFixed(1)
          : 0,
      );
    } catch (error) {
      console.error("Error loading reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const selectedMovieData = selectedMovie
    ? allMovies.find((m) => m.id === parseInt(selectedMovie))
    : null;
  const enrichedReviews = allReviews.map((r) => ({
    ...r,
    movieTitle: allMovies.find((m) => m.id === r.movieId)?.title,
  }))

  return (
    <div
      style={{ backgroundColor: "var(--color-dark)" }}
      className="min-h-screen pb-12"
    >
      {/* ── Reviews wall hero ── */}
      {allReviews.length > 0 && (
        <div className="relative pt-24 pb-16 px-4 overflow-hidden">
          <div className="text-center mb-10">
            <h1 style={{ color: 'var(--color-ink)' }} className="text-4xl md:text-5xl font-bold mb-3">
              What People Are Saying
            </h1>
            <p style={{ color: 'var(--color-muted)' }} className="text-lg">
              Real reviews from Filmoji users
            </p>
          </div>
          <div className="relative">
            <ReviewsWall reviews={enrichedReviews} className="max-h-[480px]" />
            {/* fade in top */}
            <div className="absolute top-0 left-0 right-0 h-16 pointer-events-none"
              style={{ background: 'linear-gradient(to bottom, var(--color-dark) 0%, transparent 100%)' }}
            />
            {/* fade out bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"
              style={{ background: 'linear-gradient(to bottom, transparent 0%, var(--color-dark) 100%)' }}
            />
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 mt-80">
        {/* Header */}
        <div className="text-center mb-12">
          <h1
            style={{ color: "var(--color-ink)" }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            Check by Movies
          </h1>
          <p style={{ color: "var(--color-muted)" }} className="text-lg">
            See what other users think about movies
          </p>
        </div>

        <section className="description"></section>

        {/* Movie Selection */}
        <div
          style={{
            backgroundColor: "var(--color-card)",
            borderColor: "var(--color-border)",
          }}
          className="backdrop-blur-lg rounded-2xl p-6 mb-8 border"
        >
          <label
            style={{ color: "var(--color-ink)" }}
            className="block font-medium mb-3 text-lg"
          >
            Select a movie to view reviews
          </label>
          <select
            value={selectedMovie || ""}
            onChange={(e) => setSelectedMovie(e.target.value)}
            style={{
              backgroundColor: "var(--color-card)",
              borderColor: "var(--color-border)",
              color: "var(--color-ink)",
            }}
            className="w-full px-4 py-3 rounded-lg border text-lg focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="" disabled>
              -- Please select a movie --
            </option>
            {allMovies.map((movie) => (
              <option
                key={movie.id}
                value={movie.id}
                style={{
                  backgroundColor: "var(--color-card)",
                  color: "var(--color-ink)",
                }}
              >
                {movie.title} ({movie.releaseYear}) - IMDb: {movie.rating}
              </option>
            ))}
          </select>
        </div>

        {/* Movie Info and Stats */}
        {selectedMovieData && (
          <div
            style={{
              backgroundColor: "var(--color-card)",
              borderColor: "var(--color-border)",
            }}
            className="backdrop-blur-lg rounded-2xl p-6 mb-8 border"
          >
            <div className="flex flex-col md:flex-row gap-6">
              <img
                src={selectedMovieData.posterUrl}
                alt={selectedMovieData.title}
                className="w-full md:w-48 h-72 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h2
                  style={{ color: "var(--color-ink)" }}
                  className="text-3xl font-bold mb-2"
                >
                  {selectedMovieData.title}
                </h2>
                <p style={{ color: "var(--color-muted)" }} className="mb-4">
                  {selectedMovieData.releaseYear} •{" "}
                  {Array.isArray(selectedMovieData.genres) ? selectedMovieData.genres.join(", ") : selectedMovieData.genres}
                </p>
                <div className="flex items-center space-x-6">
                  <div>
                    <p
                      style={{ color: "var(--color-muted)" }}
                      className="text-sm"
                    >
                      IMDb Rating
                    </p>
                    <p
                      style={{ color: "var(--color-accent)" }}
                      className="text-3xl font-bold"
                    >
                      {selectedMovieData.rating}
                    </p>
                  </div>
                  <div>
                    <p
                      style={{ color: "var(--color-muted)" }}
                      className="text-sm"
                    >
                      User Average
                    </p>
                    <p
                      style={{ color: "var(--color-accent)" }}
                      className="text-3xl font-bold"
                    >
                      {averageRating > 0 ? averageRating : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p
                      style={{ color: "var(--color-muted)" }}
                      className="text-sm"
                    >
                      Total Reviews
                    </p>
                    <p
                      style={{ color: "var(--color-accent)" }}
                      className="text-3xl font-bold"
                    >
                      {reviews.length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reviews List */}
        {loading ? (
          <div
            style={{ color: "var(--color-ink)" }}
            className="text-center text-xl py-12"
          >
            Loading...
          </div>
        ) : selectedMovie ? (
          <div className="space-y-4">
            <h3
              style={{ color: "var(--color-ink)" }}
              className="text-2xl font-bold mb-4"
            >
              User Reviews ({reviews.length})
            </h3>
            {reviews.length === 0 ? (
              <div
                style={{
                  backgroundColor: "var(--color-card)",
                  borderColor: "var(--color-border)",
                }}
                className="backdrop-blur-lg rounded-2xl p-12 border text-center"
              >
                <p style={{ color: "var(--color-muted)" }} className="text-lg">
                  No reviews yet for this movie. Be the first to review it!
                </p>
              </div>
            ) : (
              reviews.map((review) => (
                <div
                  key={review.id}
                  style={{
                    backgroundColor: "var(--color-card)",
                    borderColor: "var(--color-border)",
                  }}
                  className="backdrop-blur-lg rounded-2xl p-6 border hover:shadow-lg transition"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <div
                          style={{ backgroundColor: "var(--color-accent)" }}
                          className="w-10 h-10 rounded-full flex items-center justify-center text-ink font-bold"
                        >
                          {review.userEmail?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p
                            style={{ color: "var(--color-ink)" }}
                            className="font-medium"
                          >
                            {review.userEmail}
                          </p>
                          <p
                            style={{ color: "var(--color-muted)" }}
                            className="text-sm"
                          >
                            {review.createdAt
                              ?.toDate()
                              .toLocaleDateString("en-EN", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        style={{
                          backgroundColor: "var(--color-accent)",
                          color: "var(--color-ink)",
                        }}
                        className="text-2xl font-bold px-4 py-2 rounded-lg"
                      >
                        {review.rating}/10
                      </span>
                    </div>
                  </div>
                  <p
                    style={{ color: "var(--color-ink)" }}
                    className="leading-relaxed pl-13"
                  >
                    {review.comment}
                  </p>
                </div>
              ))
            )}
          </div>
        ) : (
          <div
            style={{
              backgroundColor: "var(--color-card)",
              borderColor: "var(--color-border)",
            }}
            className="backdrop-blur-lg rounded-2xl p-12 border text-center"
          >
            <p style={{ color: "var(--color-muted)" }} className="text-lg">
              Please select a movie to view reviews
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default MovieReviews;
