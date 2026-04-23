export default function MyReviewsTab({
  activeTab,
  editingReview = null,
  selectedMovie = null,
  rating = 5,
  comment = "",
  userReviews,
  allMovies,
  onAddReview,
  onSubmitReview = () => {},
  onSelectedMovieChange = () => {},
  onRatingChange = () => {},
  onCommentChange = () => {},
  onCancelEdit = () => {},
  onEditReview,
  onDeleteReview,
}) {
  const formatReviewDate = (createdAt) => {
    try {
      const date = createdAt?.toDate
        ? createdAt.toDate()
        : createdAt instanceof Date
          ? createdAt
          : null;

      return date ? date.toLocaleDateString("zh-CN") : "";
    } catch {
      return "";
    }
  };

  if (activeTab === "add") {
    return (
      <div
        className="rounded-2xl p-8"
        style={{
          backgroundColor: "var(--color-card)",
        }}
      >
        <h2
          className="text-2xl font-bold mb-6"
          style={{ color: "var(--color-ink)" }}
        >
          {editingReview ? "Edit Movie Review" : "Ratings"}
        </h2>
        <form onSubmit={onSubmitReview} className="space-y-6">
          {/* Movie Selection */}
          <div>
            <label
              className="block font-medium mb-2"
              style={{ color: "var(--color-ink)" }}
            >
              Select Movie *
            </label>
            <select
              value={selectedMovie || ""}
              onChange={onSelectedMovieChange}
              required
              className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2"
              style={{
                backgroundColor: "var(--color-dark-light)",
                color: "var(--color-ink)",
                focusRingColor: "var(--color-accent)",
              }}
            >
              <option value="" disabled>
                -- Please select a movie --
              </option>
              {allMovies.map((movie) => (
                <option key={movie.id} value={movie.id} className="bg-white">
                  {movie.title} ({movie.releaseYear})
                </option>
              ))}
            </select>
          </div>

          {/* Rating */}
          <div>
            <label
              className="block font-medium mb-2"
              style={{ color: "var(--color-ink)" }}
            >
              Rating (1-10) *
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="1"
                max="10"
                value={rating}
                onChange={onRatingChange}
                className="flex-1 h-2 rounded-lg appearance-none cursor-pointer"
                style={{
                  backgroundColor: "var(--color-border)",
                  accentColor: "var(--color-accent)",
                }}
              />
              <span
                className="text-3xl font-bold px-4 py-2 rounded-lg min-w-[60px] text-center"
                style={{
                  backgroundColor: "var(--color-accent)",
                  color: "var(--color-ink)",
                }}
              >
                {rating}
              </span>
            </div>
            <div
              className="flex justify-between text-xs mt-1"
              style={{ color: "var(--color-muted)" }}
            >
              <span>Poor</span>
              <span>Great</span>
            </div>
          </div>

          {/* Comment */}
          <div>
            <label
              className="block font-medium mb-2"
              style={{ color: "var(--color-ink)" }}
            >
              Review *
            </label>
            <textarea
              value={comment}
              onChange={onCommentChange}
              required
              rows="5"
              placeholder="Share your thoughts about this movie..."
              className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2"
              style={{
                backgroundColor: "var(--color-dark-light)",
                color: "var(--color-ink)",
              }}
            />
          </div>

          {/* Submit Button */}
          <div className="flex space-x-4">
            <button
              type="submit"
              className="flex-1 py-3 px-6 rounded-lg font-medium transition"
              style={{
                backgroundColor: "var(--color-accent)",
                color: "var(--color-ink)",
              }}
            >
              {editingReview ? "Update Review" : "Submit Review"}
            </button>
            {editingReview && (
              <button
                type="button"
                onClick={onCancelEdit}
                className="px-6 py-3 rounded-lg font-medium transition"
                style={{
                  backgroundColor: "var(--color-card-hover)",
                  color: "var(--color-ink)",
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {userReviews.length === 0 ? (
        <div
          className="rounded-2xl p-12 text-center"
          style={{
            backgroundColor: "var(--color-card)",
          }}
        >
          <p className="text-lg" style={{ color: "var(--color-muted)" }}>
            You haven't added any reviews yet
          </p>
          <button
            onClick={onAddReview}
            className="mt-4 px-6 py-2 rounded-lg transition font-medium"
            style={{
              backgroundColor: "var(--color-accent)",
              color: "var(--color-ink)",
            }}
          >
            Add your first review
          </button>
        </div>
      ) : (
        userReviews.map((review) => {
          const findMovieById = (id) => {
            const n = Number(id);
            return allMovies.find(
              (m) => m.id === id || m.tmdbId === id || m.id === n || m.tmdbId === n,
            );
          };

          const movieTitle = findMovieById(review.movieId)?.title ?? "Unknown Movie";

          return (
            <div
              key={review.id}
              className="rounded-2xl p-6 transition"
              style={{
                backgroundColor: "var(--color-card)",
              }}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3
                    className="text-xl font-bold"
                    style={{ color: "var(--color-ink)" }}
                  >
                    {movieTitle}
                  </h3>
                  <p
                    className="text-sm"
                    style={{ color: "var(--color-muted)" }}
                  >
                    {formatReviewDate(review.createdAt)}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <span
                    className="text-2xl font-bold px-3 py-1 rounded-lg"
                    style={{
                      backgroundColor: "var(--color-accent)",
                      color: "var(--color-ink)",
                    }}
                  >
                    {review.rating}/10
                  </span>
                </div>
              </div>
              <p
                className="mb-4 leading-relaxed"
                style={{ color: "var(--color-ink)" }}
              >
                {review.comment}
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => onEditReview(review)}
                  className="px-4 py-2 text-white rounded-lg text-sm transition font-medium"
                  style={{
                    backgroundColor: "var(--color-accent)",
                    color: "var(--color-ink)",
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={() => onDeleteReview(review.id)}
                  className="px-4 py-2 text-white rounded-lg text-sm transition font-medium"
                  style={{ backgroundColor: "#E74C3C", color: "white" }}
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
