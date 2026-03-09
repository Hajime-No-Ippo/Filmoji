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
      const q = query(
        reviewsRef,
        where("userId", "==", userId),
        orderBy("createdAt", "desc"),
      );
      const querySnapshot = await getDocs(q);
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-black">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black pt-24 px-4">
      <div className="max-w-4xl mx-auto">
        {/* User Info Header */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8 border border-white/20">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">My Profile</h1>
              <p className="text-gray-300">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Overview - Main Selection Page */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
              Choose an option to continue
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Preference Card */}
              <div
                onClick={() => navigate("/personal-preference")}
                className="group bg-gradient-to-br from-pink-600/30 to-purple-600/30 backdrop-blur-lg rounded-2xl p-8 border-2 border-pink-400/50 hover:border-pink-400 cursor-pointer transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-pink-500/50"
              >
                <div className="text-center">
                  <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">
                    ⭐
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">
                    Personal Preference
                  </h3>
                  <p className="text-gray-200 mb-4 leading-relaxed">
                    Set your movie genre preferences and customize your
                    experience
                  </p>
                  <div className="inline-flex items-center text-pink-300 font-medium group-hover:text-pink-200">
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
                className="group bg-gradient-to-br from-blue-600/30 to-purple-600/30 backdrop-blur-lg rounded-2xl p-8 border-2 border-blue-400/50 hover:border-blue-400 cursor-pointer transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-blue-500/50"
              >
                <div className="text-center">
                  <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">
                    📝
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">
                    My Reviews
                  </h3>
                  <p className="text-gray-200 mb-4 leading-relaxed">
                    View, add, edit, and manage all your movie reviews
                  </p>
                  <div className="inline-flex items-center text-blue-300 font-medium group-hover:text-blue-200">
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
              className="px-6 py-3 rounded-lg font-medium transition bg-white/10 text-gray-300 hover:bg-white/20"
            >
              ← Back
            </button>
            <button
              onClick={() => setActiveTab("add")}
              className={`px-6 py-3 rounded-lg font-medium transition ${
                activeTab === "add"
                  ? "bg-purple-600 text-white"
                  : "bg-white/10 text-gray-300 hover:bg-white/20"
              }`}
            >
              {editingReview ? "Edit Review" : "Add Review"}
            </button>
            <button
              onClick={() => {
                setActiveTab("my-reviews");
                cancelEdit();
              }}
              className={`px-6 py-3 rounded-lg font-medium transition ${
                activeTab === "my-reviews"
                  ? "bg-purple-600 text-white"
                  : "bg-white/10 text-gray-300 hover:bg-white/20"
              }`}
            >
              My Reviews ({userReviews.length})
            </button>
          </div>
        )}

        {/* Add/Edit Review Tab */}
        {activeTab === "add" && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6">
              {editingReview ? "Edit Movie Review" : "Rate a Movie"}
            </h2>
            <form onSubmit={handleSubmitReview} className="space-y-6">
              {/* Movie Selection */}
              <div>
                <label className="block text-white font-medium mb-2">
                  Select Movie *
                </label>
                <select
                  value={selectedMovie || ""}
                  onChange={(e) => setSelectedMovie(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="" disabled>
                    -- Please select a movie --
                  </option>
                  {featuredMovies.map((movie) => (
                    <option
                      key={movie.id}
                      value={movie.id}
                      className="bg-gray-800"
                    >
                      {movie.title} ({movie.year})
                    </option>
                  ))}
                </select>
              </div>

              {/* Rating */}
              <div>
                <label className="block text-white font-medium mb-2">
                  Rating (1-10) *
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                    className="flex-1 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-3xl font-bold text-white bg-purple-600 px-4 py-2 rounded-lg min-w-[60px] text-center">
                    {rating}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>Poor</span>
                  <span>Great</span>
                </div>
              </div>

              {/* Comment */}
              <div>
                <label className="block text-white font-medium mb-2">
                  Review *
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  required
                  rows="5"
                  placeholder="Share your thoughts about this movie..."
                  className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Submit Button */}
              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition"
                >
                  {editingReview ? "Update Review" : "Submit Review"}
                </button>
                {editingReview && (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="px-6 py-3 bg-white/20 text-white rounded-lg font-medium hover:bg-white/30 transition"
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
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-12 border border-white/20 text-center">
                <p className="text-gray-300 text-lg">
                  You haven't added any reviews yet
                </p>
                <button
                  onClick={() => setActiveTab("add")}
                  className="mt-4 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition"
                >
                  Add your first review
                </button>
              </div>
            ) : (
              userReviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-purple-400/50 transition"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        {review.movieTitle}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        {review.createdAt?.toDate().toLocaleDateString("zh-CN")}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl font-bold text-white bg-purple-600 px-3 py-1 rounded-lg">
                        {review.rating}/10
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-200 mb-4 leading-relaxed">
                    {review.comment}
                  </p>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleEditReview(review)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteReview(review.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition"
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
