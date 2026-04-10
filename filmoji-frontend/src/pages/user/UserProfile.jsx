import { useState, useEffect } from "react";
import { auth, db } from "../../../firebase";
import Interests from "./Interests";
import Watchlist from "./Watchlist";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  deleteDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";

function UserProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allMovies, setAllMovies] = useState([]);
  const [userReviews, setUserReviews] = useState([]);
  const [profile, setProfile] = useState({ username: "", bio: "" });
  const navigate = useNavigate();

  const ratedCount = new Set(userReviews.map((r) => r.movieId)).size;
  const reviewedCount = ratedCount;

  const previewReviews = userReviews.slice(0, 3);

  const ratedMovies = userReviews
    .map((review) => {
      const movie = allMovies.find((m) => m.id === review.movieId);
      return { review, movie };
    })
    .filter(({ movie }) => Boolean(movie));

  useEffect(() => {
    fetch("/api/movies")
      .then((res) => res.json())
      .then((data) => setAllMovies(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        loadUserReviews(currentUser.uid);
        loadUserProfile(currentUser);
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
      } catch {
        // Fallback when Firestore index/ordering is unavailable.
        const fallbackQuery = query(reviewsRef, where("userId", "==", userId));
        querySnapshot = await getDocs(fallbackQuery);
      }

      const reviews = [];
      querySnapshot.forEach((doc) => {
        const reviewData = doc.data();
        reviews.push({ id: doc.id, ...reviewData });
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

  const loadUserProfile = async (currentUser) => {
    try {
      const profileRef = doc(db, "userProfiles", currentUser.uid);
      const snapshot = await getDoc(profileRef);

      if (snapshot.exists()) {
        const data = snapshot.data();
        setProfile({
          username: data.username || "",
          bio: data.bio || "",
        });
        return;
      }

      setProfile({
        username: currentUser.displayName || "",
        bio: "",
      });
    } catch (error) {
      console.error("Error loading user profile:", error);
      setProfile({ username: "", bio: "" });
    }
  };

  const handleEditReview = (review) => {
    navigate("/profile/ratings", { state: { review } });
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
      className="min-h-screen pt-24 px-4 lg:px-10"
      style={{ backgroundColor: "var(--color-dark)" }}
    >
      <div className="max-w-6xl mx-auto">
        {/* User Info Header */}
        <div
          className="rounded-2xl p-6 mb-8 shadow-lg "
          style={{
            backgroundColor: "var(--color-card)",
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
            <div className="flex-1">
              <div className="flex items-center justify-between gap-4">
                <h1
                  className="text-2xl font-bold"
                  style={{ color: "var(--color-ink)" }}
                >
                  My Profile
                </h1>
                <button
                  onClick={() => navigate("/profile/username")}
                  className="font-medium transition hover:underline"
                  style={{ color: "var(--color-mood-blue)" }}
                  type="button"
                >
                  Edit
                </button>
              </div>

              <p
                className="mt-1 text-lg font-semibold"
                style={{ color: "var(--color-accent)" }}
              >
                {profile.username || "Set your username"}
              </p>
              {profile.bio ? (
                <p className="mt-1" style={{ color: "var(--color-muted)" }}>
                  {profile.bio}
                </p>
              ) : null}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Personal Preference */}
          <div
            className="rounded-2xl p-6 shadow-lg"
            style={{
              backgroundColor: "var(--color-card)",
            }}
          >
            <div className="flex items-center justify-between">
              <h2
                className="text-2xl font-bold"
                style={{ color: "var(--color-ink)" }}
              >
                Personal Preference
              </h2>
              <button
                onClick={() => navigate("/personal-preference")}
                className="font-medium transition hover:underline"
                style={{ color: "var(--color-mood-blue)" }}
              >
                Edit
              </button>
            </div>
          </div>

          {/* Ratings (link to rate/review page) */}
          <div
            className="rounded-2xl p-6 shadow-lg"
            style={{
              backgroundColor: "var(--color-card)",
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h2
                  className="text-2xl font-bold"
                  style={{ color: "var(--color-ink)" }}
                >
                  Ratings
                </h2>
                <span
                  className="text-sm font-semibold"
                  style={{ color: "var(--color-muted)" }}
                >
                  {ratedCount}
                </span>
              </div>
              <button
                onClick={() => navigate("/profile/ratings")}
                className="font-medium transition hover:underline"
                style={{ color: "var(--color-mood-blue)" }}
              >
                Edit
              </button>
            </div>
            <p className="mt-2" style={{ color: "var(--color-muted)" }}>
              My Ratings.
            </p>

            {ratedMovies.length > 0 && (
              <div className="mt-6 overflow-x-auto">
                <div className="flex gap-6 pb-2">
                  {ratedMovies.map(({ review, movie }) => {
                    const poster =
                      movie?.posterUrl ||
                      movie?.poster ||
                      movie?.posterPath ||
                      movie?.poster_path ||
                      "";

                    return (
                      <div
                        key={review.id}
                        className="shrink-0 w-64 rounded-2xl shadow-lg overflow-hidden"
                        style={{ backgroundColor: "var(--color-card)" }}
                      >
                        <Link to={`/movie/${movie.id}`} className="block">
                          {poster ? (
                            <img
                              src={poster}
                              alt={movie.title}
                              className="aspect-[2/3] w-full object-cover"
                            />
                          ) : (
                            <div
                              className="aspect-[2/3] w-full flex items-center justify-center"
                              style={{
                                backgroundColor: "var(--color-card-hover)",
                              }}
                            >
                              <span style={{ color: "var(--color-muted)" }}>
                                No poster
                              </span>
                            </div>
                          )}
                        </Link>

                        <div className="p-4">
                          <div className="flex items-center gap-2">
                            <span style={{ color: "var(--color-accent)" }}>
                              ★
                            </span>
                            <span
                              className="font-semibold"
                              style={{ color: "var(--color-ink)" }}
                            >
                              {review.rating}
                            </span>
                            <span style={{ color: "var(--color-muted)" }}>
                              /10
                            </span>
                          </div>
                          <div
                            className="mt-2 text-lg font-semibold leading-snug"
                            style={{ color: "var(--color-ink)" }}
                          >
                            {movie.title}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* My Reviews (preview) */}
          <div
            className="rounded-2xl p-6 shadow-lg"
            style={{ backgroundColor: "var(--color-card)" }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h2
                  className="text-2xl font-bold"
                  style={{ color: "var(--color-ink)" }}
                >
                  Reviews
                </h2>
                <span
                  className="text-sm font-semibold"
                  style={{ color: "var(--color-muted)" }}
                >
                  {reviewedCount}
                </span>
              </div>
            </div>

            <p className="mt-2" style={{ color: "var(--color-muted)" }}>
              My Ratings.
            </p>

            <div className="mt-5 space-y-4">
              {previewReviews.map((review) => {
                const movie = allMovies.find((m) => m.id === review.movieId);
                const createdDate =
                  review.createdAt?.toDate?.() ||
                  (typeof review.createdAt?.seconds === "number"
                    ? new Date(review.createdAt.seconds * 1000)
                    : null);
                const formattedDate = createdDate
                  ? new Intl.DateTimeFormat("en-CA", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                    }).format(createdDate)
                  : "";
                const poster =
                  movie?.posterUrl ||
                  movie?.poster ||
                  movie?.posterPath ||
                  movie?.poster_path ||
                  "";

                return (
                  <button
                    key={review.id}
                    type="button"
                    onClick={() => handleEditReview(review)}
                    className="w-full text-left rounded-xl p-4 transition shadow-md hover:shadow-lg"
                    style={{ backgroundColor: "var(--color-card)" }}
                  >
                    <div className="flex gap-4">
                      <div className="shrink-0">
                        {poster ? (
                          <img
                            src={poster}
                            alt={movie?.title || "Movie poster"}
                            className="w-14 h-20 object-cover rounded-lg"
                          />
                        ) : (
                          <div
                            className="w-14 h-20 rounded-lg flex items-center justify-center text-xs"
                            style={{
                              backgroundColor: "var(--color-dark-light)",
                              color: "var(--color-muted)",
                            }}
                          >
                            No
                            <br />
                            poster
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div
                            className="text-lg font-semibold leading-snug truncate"
                            style={{ color: "var(--color-ink)" }}
                            title={movie?.title || `Movie #${review.movieId}`}
                          >
                            {movie?.title || `Movie #${review.movieId}`}
                          </div>

                          <div className="shrink-0 flex items-center gap-2">
                            <span style={{ color: "var(--color-accent)" }}>
                              ★
                            </span>
                            <span
                              className="font-semibold"
                              style={{ color: "var(--color-ink)" }}
                            >
                              {review.rating}
                            </span>
                            <span style={{ color: "var(--color-muted)" }}>
                              /10
                            </span>
                          </div>
                        </div>

                        {review.comment ? (
                          <div
                            className="mt-3 text-sm leading-relaxed"
                            style={{ color: "var(--color-muted)" }}
                          >
                            {review.comment}
                          </div>
                        ) : null}

                        {formattedDate ? (
                          <div
                            className={`${review.comment ? "mt-2" : "mt-3"} text-xs text-right`}
                            style={{ color: "var(--color-muted)" }}
                          >
                            {formattedDate}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <Interests reviews={previewReviews} allMovies={allMovies} />
          <Watchlist allMovies={allMovies} />
        </div>
      </div>
    </div>
  );
}

export default UserProfile;
