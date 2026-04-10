import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { addDoc, collection, doc, updateDoc } from "firebase/firestore";
import { auth, db } from "../../../firebase";
import MyReviewsTab from "./MyReviewsTab";

function Ratings() {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(null);
  const [allMovies, setAllMovies] = useState([]);

  const [editingReview, setEditingReview] = useState(null);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

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
      } else {
        navigate("/login");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const reviewFromState = location.state?.review;
    if (reviewFromState) {
      setEditingReview(reviewFromState);
      setSelectedMovie(reviewFromState.movieId?.toString?.() ?? null);
      setRating(reviewFromState.rating ?? 5);
      setComment(reviewFromState.comment ?? "");
    }
  }, [location.state]);

  const resetForm = () => {
    setEditingReview(null);
    setSelectedMovie(null);
    setRating(5);
    setComment("");
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!selectedMovie || !user) return;

    try {
      if (editingReview) {
        const reviewRef = doc(db, "reviews", editingReview.id);
        await updateDoc(reviewRef, {
          rating: parseInt(rating),
          comment: comment,
          updatedAt: new Date(),
        });
        alert("Review updated!");
      } else {
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

      resetForm();
      navigate("/profile");
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Submission failed, please try again");
    }
  };

  return (
    <div
      className="min-h-screen pt-24 px-4"
      style={{ backgroundColor: "var(--color-dark)" }}
    >
      <div className="max-w-4xl mx-auto">
        <MyReviewsTab
          activeTab="add"
          editingReview={editingReview}
          selectedMovie={selectedMovie}
          rating={rating}
          comment={comment}
          userReviews={[]}
          allMovies={allMovies}
          onAddReview={() => {}}
          onSubmitReview={handleSubmitReview}
          onSelectedMovieChange={(e) => setSelectedMovie(e.target.value)}
          onRatingChange={(e) => setRating(e.target.value)}
          onCommentChange={(e) => setComment(e.target.value)}
          onCancelEdit={() => {
            resetForm();
            navigate("/profile");
          }}
          onEditReview={() => {}}
          onDeleteReview={() => {}}
        />
      </div>
    </div>
  );
}

export default Ratings;
