import { useState, useEffect } from "react";
import { auth, db } from "../../firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  orderBy,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { featuredMovies } from "../data/movies";

function UserProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [userReviews, setUserReviews] = useState([]);
  const [activeTab, setActiveTab] = useState("overview"); // "overview", "add" or "my-reviews"
  const [editingReview, setEditingReview] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        loadUserReviews(currentUser.uid);
      } else {
        navigate("/login");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  const loadUserReviews = async (userId) => {
    try {
      const reviewsRef = collection(db, "reviews");
      let querySnapshot;

      try {
        const orderedQuery = query(
          reviewsRef,
          where("userId", "==", userId),
          orderBy("createdAt", "desc"),
        );
        querySnapshot = await getDocs(orderedQuery);
      } catch (orderedQueryError) {
        // Fallback when Firestore index/ordering is unavailable.
        const fallbackQuery = query(reviewsRef, where("userId", "==", userId));
        querySnapshot = await getDocs(fallbackQuery);
      }

      const reviews = [];
      querySnapshot.forEach((doc) => {
        const reviewData = doc.data();
        const movie = featuredMovies.find((m) => m.id === reviewData.movieId);
        reviews.push({
          id: doc.id,
          ...reviewData,
          movieTitle: movie ? movie.title : "Unknown Movie",
        });
      });

      reviews.sort((a, b) => {
        const aTime = a.createdAt?.toMillis?.() || 0;
        const bTime = b.createdAt?.toMillis?.() || 0;
        return bTime - aTime;
      });

      setUserReviews(reviews);
    } catch (error) {
      console.error("Error loading reviews:", error);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!selectedMovie || !user) return;

    try {
      if (editingReview) {
        // Update existing review
        const reviewRef = doc(db, "reviews", editingReview.id);
        await updateDoc(reviewRef, {
          rating: parseInt(rating),
          comment: comment,
          updatedAt: new Date(),
        });
        alert("Review updated!");
        setEditingReview(null);
      } else {
        // Add new review
        await addDoc(collection(db, "reviews"), {
          userId: user.uid,
          userEmail: user.email,
          movieId: parseInt(selectedMovie),
          rating: parseInt(rating),
          comment: comment,
          createdAt: new Date(),
        });
        alert("Review submitted!");
      }

      // Reset form
      setSelectedMovie(null);
      setRating(5);
      setComment("");

      // Reload reviews
      loadUserReviews(user.uid);
      setActiveTab("my-reviews");
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Submission failed, please try again");
    }
  };

  const handleEditReview = (review) => {
    setEditingReview(review);
    setSelectedMovie(review.movieId.toString());
    setRating(review.rating);
    setComment(review.comment);
    setActiveTab("add");
  };

  const handleDeleteReview = async (reviewId) => {
    if (!confirm("Are you sure you want to delete this review?")) return;

    try {
      await deleteDoc(doc(db, "reviews", reviewId));
      alert("Review deleted");
      loadUserReviews(user.uid);
    } catch (error) {
      console.error("Error deleting review:", error);
      alert("Deletion failed, please try again");
    }
  };

  const cancelEdit = () => {
    setEditingReview(null);
    setSelectedMovie(null);
    setRating(5);
    setComment("");
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "var(--color-dark)" }}
      >
        <div className="text-xl" style={{ color: "var(--color-ink)" }}>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen pt-24 px-4"
      style={{ backgroundColor: "var(--color-dark)" }}
    >
      <div className="max-w-4xl mx-auto">
        {/* User Info Header */}
        <div
          className="rounded-2xl p-6 mb-8 border-2"
          style={{
            backgroundColor: "var(--color-card)",
            borderColor: "var(--color-border)",
          }}
        >
          <div className="flex items-center space-x-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold"
              style={{
                backgroundColor: "var(--color-accent)",
                color: "var(--color-ink)",
              }}
            >
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1
                className="text-2xl font-bold"
                style={{ color: "var(--color-ink)" }}
              >
                My Profile
              </h1>
              <p style={{ color: "var(--color-muted)" }}>{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Overview - Main Selection Page */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <h2
              className="text-2xl font-bold mb-6 text-center"
              style={{ color: "var(--color-ink)" }}
            >
              Choose an option to continue
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Preference Card */}
              <div
                onClick={() => navigate("/personal-preference")}
                className="group rounded-2xl p-8 border-2 cursor-pointer transform hover:scale-105 transition-all duration-300 shadow-lg"
                style={{
                  backgroundColor: "var(--color-card)",
                  borderColor: "var(--color-accent)",
                  boxShadow: "0 4px 6px rgba(245, 197, 25, 0.1)",
                }}
              >
                <div className="text-center">
                  <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">
                    ⭐
                  </div>
                  <h3
                    className="text-2xl font-bold mb-3"
                    style={{ color: "var(--color-ink)" }}
                  >
                    Personal Preference
                  </h3>
                  <p
                    className="mb-4 leading-relaxed"
                    style={{ color: "var(--color-muted)" }}
                  >
                    Set your movie genre preferences and customize your
                    experience
                  </p>
                  <div
                    className="inline-flex items-center font-medium group-hover:translate-x-1 transition-transform"
                    style={{ color: "var(--color-accent)" }}
                  >
                    Configure Preferences
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* My Reviews Card */}
              <div
                onClick={() => setActiveTab("my-reviews")}
                className="group rounded-2xl p-8 border-2 cursor-pointer transform hover:scale-105 transition-all duration-300 shadow-lg"
                style={{
                  backgroundColor: "var(--color-card)",
                  borderColor: "var(--color-accent)",
                  boxShadow: "0 4px 6px rgba(245, 197, 25, 0.1)",
                }}
              >
                <div className="text-center">
                  <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">
                    📝
                  </div>
                  <h3
                    className="text-2xl font-bold mb-3"
                    style={{ color: "var(--color-ink)" }}
                  >
                    My Reviews
                  </h3>
                  <p
                    className="mb-4 leading-relaxed"
                    style={{ color: "var(--color-muted)" }}
                  >
                    View, add, edit, and manage all your movie reviews
                  </p>
                  <div
                    className="inline-flex items-center font-medium group-hover:translate-x-1 transition-transform"
                    style={{ color: "var(--color-accent)" }}
                  >
                    Manage Reviews ({userReviews.length})
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs - Only show when not in overview */}
        {activeTab !== "overview" && (
          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => setActiveTab("overview")}
              className="px-6 py-3 rounded-lg font-medium transition"
              style={{
                backgroundColor: "var(--color-card-hover)",
                color: "var(--color-ink)",
                border: `2px solid var(--color-border)`,
              }}
            >
              ← Back
            </button>
            <button
              onClick={() => setActiveTab("add")}
              className="px-6 py-3 rounded-lg font-medium transition"
              style={
                activeTab === "add"
                  ? {
                      backgroundColor: "var(--color-accent)",
                      color: "var(--color-ink)",
                      border: `2px solid var(--color-accent)`,
                    }
                  : {
                      backgroundColor: "var(--color-card-hover)",
                      color: "var(--color-ink)",
                      border: `2px solid var(--color-border)`,
                    }
              }
            >
              {editingReview ? "Edit Review" : "Add Review"}
            </button>
            <button
              onClick={() => {
                setActiveTab("my-reviews");
                cancelEdit();
              }}
              className="px-6 py-3 rounded-lg font-medium transition"
              style={
                activeTab === "my-reviews"
                  ? {
                      backgroundColor: "var(--color-accent)",
                      color: "var(--color-ink)",
                      border: `2px solid var(--color-accent)`,
                    }
                  : {
                      backgroundColor: "var(--color-card-hover)",
                      color: "var(--color-ink)",
                      border: `2px solid var(--color-border)`,
                    }
              }
            >
              My Reviews ({userReviews.length})
            </button>
          </div>
        )}

        {/* Add/Edit Review Tab */}
        {activeTab === "add" && (
          <div
            className="rounded-2xl p-8 border-2"
            style={{
              backgroundColor: "var(--color-card)",
              borderColor: "var(--color-border)",
            }}
          >
            <h2
              className="text-2xl font-bold mb-6"
              style={{ color: "var(--color-ink)" }}
            >
              {editingReview ? "Edit Movie Review" : "Rate a Movie"}
            </h2>
            <form onSubmit={handleSubmitReview} className="space-y-6">
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
                  onChange={(e) => setSelectedMovie(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: "var(--color-dark-light)",
                    borderColor: "var(--color-border)",
                    color: "var(--color-ink)",
                    border: `2px solid var(--color-border)`,
                    focusRingColor: "var(--color-accent)",
                  }}
                >
                  <option value="" disabled>
                    -- Please select a movie --
                  </option>
                  {featuredMovies.map((movie) => (
                    <option
                      key={movie.id}
                      value={movie.id}
                      className="bg-white"
                    >
                      {movie.title} ({movie.year})
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
                    onChange={(e) => setRating(e.target.value)}
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
                  onChange={(e) => setComment(e.target.value)}
                  required
                  rows="5"
                  placeholder="Share your thoughts about this movie..."
                  className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: "var(--color-dark-light)",
                    borderColor: "var(--color-border)",
                    color: "var(--color-ink)",
                    border: `2px solid var(--color-border)`,
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
                    onClick={cancelEdit}
                    className="px-6 py-3 rounded-lg font-medium transition"
                    style={{
                      backgroundColor: "var(--color-card-hover)",
                      color: "var(--color-ink)",
                      border: `2px solid var(--color-border)`,
                    }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        {/* My Reviews Tab */}
        {activeTab === "my-reviews" && (
          <div className="space-y-4">
            {userReviews.length === 0 ? (
              <div
                className="rounded-2xl p-12 border-2 text-center"
                style={{
                  backgroundColor: "var(--color-card)",
                  borderColor: "var(--color-border)",
                }}
              >
                <p className="text-lg" style={{ color: "var(--color-muted)" }}>
                  You haven't added any reviews yet
                </p>
                <button
                  onClick={() => setActiveTab("add")}
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
              userReviews.map((review) => (
                <div
                  key={review.id}
                  className="rounded-2xl p-6 border-2 transition"
                  style={{
                    backgroundColor: "var(--color-card)",
                    borderColor: "var(--color-border)",
                  }}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3
                        className="text-xl font-bold"
                        style={{ color: "var(--color-ink)" }}
                      >
                        {review.movieTitle}
                      </h3>
                      <p
                        className="text-sm"
                        style={{ color: "var(--color-muted)" }}
                      >
                        {review.createdAt?.toDate().toLocaleDateString("zh-CN")}
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
                      onClick={() => handleEditReview(review)}
                      className="px-4 py-2 text-white rounded-lg text-sm transition font-medium"
                      style={{
                        backgroundColor: "var(--color-accent)",
                        color: "var(--color-ink)",
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteReview(review.id)}
                      className="px-4 py-2 text-white rounded-lg text-sm transition font-medium"
                      style={{ backgroundColor: "#E74C3C", color: "white" }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default UserProfile;
