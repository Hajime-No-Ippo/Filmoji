import { useState, useEffect } from "react";
import { db } from "../../firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { featuredMovies } from "../data/movies";

function MovieReviews() {
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [averageRating, setAverageRating] = useState(0);

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
    ? featuredMovies.find((m) => m.id === parseInt(selectedMovie))
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black pt-24 pb-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Movie Reviews
          </h1>
          <p className="text-gray-300 text-lg">
            See what other users think about movies
          </p>
        </div>

        {/* Movie Selection */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8 border border-white/20">
          <label className="block text-white font-medium mb-3 text-lg">
            Select a movie to view reviews
          </label>
          <select
            value={selectedMovie || ""}
            onChange={(e) => setSelectedMovie(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-lg"
          >
            <option value="" disabled>
              -- Please select a movie --
            </option>
            {featuredMovies.map((movie) => (
              <option key={movie.id} value={movie.id} className="bg-gray-800">
                {movie.title} ({movie.year}) - IMDb: {movie.rating}
              </option>
            ))}
          </select>
        </div>

        {/* Movie Info and Stats */}
        {selectedMovieData && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8 border border-white/20">
            <div className="flex flex-col md:flex-row gap-6">
              <img
                src={selectedMovieData.poster}
                alt={selectedMovieData.title}
                className="w-full md:w-48 h-72 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-white mb-2">
                  {selectedMovieData.title}
                </h2>
                <p className="text-gray-300 mb-4">
                  {selectedMovieData.year} •{" "}
                  {selectedMovieData.genres.join(", ")}
                </p>
                <div className="flex items-center space-x-6">
                  <div>
                    <p className="text-gray-400 text-sm">IMDb Rating</p>
                    <p className="text-3xl font-bold text-yellow-400">
                      {selectedMovieData.rating}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">User Average</p>
                    <p className="text-3xl font-bold text-purple-400">
                      {averageRating > 0 ? averageRating : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Total Reviews</p>
                    <p className="text-3xl font-bold text-blue-400">
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
          <div className="text-center text-white text-xl py-12">Loading...</div>
        ) : selectedMovie ? (
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-white mb-4">
              User Reviews ({reviews.length})
            </h3>
            {reviews.length === 0 ? (
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-12 border border-white/20 text-center">
                <p className="text-gray-300 text-lg">
                  No reviews yet for this movie. Be the first to review it!
                </p>
              </div>
            ) : (
              reviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-purple-400/50 transition"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center text-white font-bold">
                          {review.userEmail?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-white font-medium">
                            {review.userEmail}
                          </p>
                          <p className="text-gray-400 text-sm">
                            {review.createdAt
                              ?.toDate()
                              .toLocaleDateString("zh-CN", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold text-white bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2 rounded-lg">
                        {review.rating}/10
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-200 leading-relaxed pl-13">
                    {review.comment}
                  </p>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-12 border border-white/20 text-center">
            <p className="text-gray-300 text-lg">
              Please select a movie to view reviews
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default MovieReviews;
