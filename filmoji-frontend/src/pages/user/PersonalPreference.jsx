import { useState, useEffect } from "react";
import { auth, db } from "../../../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { categories } from "../../data/categories";

const preferenceOptions = [
  { id: "love", text: "Absolutely loved it", color: "#27AE60" },
  { id: "enjoy", text: "Really enjoyed it", color: "#3498DB" },
  { id: "okay", text: "It was okay", color: "#F5C519" },
  { id: "notfunny", text: "Not very funny", color: "#E67E22" },
  { id: "dislike", text: "Didn't like it", color: "#E74C3C" },
];

function PersonalPreference() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [genrePreferences, setGenrePreferences] = useState({});
  const [draggedPreference, setDraggedPreference] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        loadPreferences(currentUser.uid);
      } else {
        navigate("/login");
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const loadPreferences = async (userId) => {
    try {
      const preferenceRef = doc(db, "userPreferences", userId);
      const snapshot = await getDoc(preferenceRef);
      if (snapshot.exists()) {
        const data = snapshot.data();
        setGenrePreferences(data.genrePreferences || {});
      }
    } catch (error) {
      console.error("Error loading preferences:", error);
      alert("Failed to load preferences");
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async (preferences) => {
    if (user) {
      try {
        const preferenceRef = doc(db, "userPreferences", user.uid);
        await setDoc(
          preferenceRef,
          {
            userId: user.uid,
            userEmail: user.email,
            genrePreferences: preferences,
            updatedAt: serverTimestamp(),
          },
          { merge: true },
        );
        alert("Preferences saved successfully!");
      } catch (error) {
        console.error("Error saving preferences:", error);
        alert("Failed to save preferences");
      }
    }
  };

  const handleDragStart = (e, preferenceId) => {
    setDraggedPreference(preferenceId);
    e.dataTransfer.effectAllowed = "copy";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  const handleDrop = (e, genreId) => {
    e.preventDefault();
    if (draggedPreference) {
      const newPreferences = {
        ...genrePreferences,
        [genreId]: draggedPreference,
      };
      setGenrePreferences(newPreferences);
      setDraggedPreference(null);
    }
  };

  const handleRemovePreference = (genreId) => {
    const newPreferences = { ...genrePreferences };
    delete newPreferences[genreId];
    setGenrePreferences(newPreferences);
  };

  const getPreferenceById = (prefId) => {
    return preferenceOptions.find((p) => p.id === prefId);
  };

  const handleSave = async () => {
    await savePreferences(genrePreferences);
  };

  const handleReset = () => {
    if (confirm("Are you sure you want to reset all preferences?")) {
      setGenrePreferences({});
    }
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
      className="min-h-screen pt-24 px-4 pb-12"
      style={{ backgroundColor: "var(--color-dark)" }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div
          className="rounded-2xl p-6 mb-8 border-2"
          style={{
            backgroundColor: "var(--color-card)",
            borderColor: "var(--color-border)",
          }}
        >
          <h1
            className="text-3xl font-bold mb-2"
            style={{ color: "var(--color-ink)" }}
          >
            Personal Preference
          </h1>
          <p style={{ color: "var(--color-muted)" }}>
            Drag and drop your preferences to each movie genre to customize your
            experience
          </p>
        </div>

        {/* Instructions */}
        <div
          className="rounded-xl p-4 mb-6 border-2"
          style={{
            backgroundColor: "var(--color-card-hover)",
            borderColor: "var(--color-accent)",
          }}
        >
          <p className="text-sm" style={{ color: "var(--color-ink)" }}>
            💡 <strong>How to use:</strong> Drag a preference option from below
            and drop it onto a genre card to set your preference for that genre.
          </p>
        </div>

        {/* Section 1: Preference Options */}
        <div className="mb-8">
          <h2
            className="text-2xl font-bold mb-4"
            style={{ color: "var(--color-ink)" }}
          >
            🎯 Preference Levels
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {preferenceOptions.map((pref) => (
              <div
                key={pref.id}
                draggable
                onDragStart={(e) => handleDragStart(e, pref.id)}
                className="rounded-xl p-4 cursor-move hover:scale-105 transition-transform shadow-lg border-2"
                style={{
                  backgroundColor: pref.color,
                  borderColor: "rgba(255, 255, 255, 0.3)",
                }}
              >
                <div
                  className="font-semibold text-center"
                  style={{ color: "white" }}
                >
                  {pref.text}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Movie Genres */}
        <div className="mb-8">
          <h2
            className="text-2xl font-bold mb-4"
            style={{ color: "var(--color-ink)" }}
          >
            🎬 Movie Genres
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((genre) => {
              const assignedPref = genrePreferences[genre.id];
              const prefOption = assignedPref
                ? getPreferenceById(assignedPref)
                : null;

              return (
                <div
                  key={genre.id}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, genre.id)}
                  className="rounded-2xl p-6 border-2 transition-all"
                  style={{
                    backgroundColor: "var(--color-card)",
                    borderColor: draggedPreference
                      ? "var(--color-accent)"
                      : "var(--color-border)",
                    borderStyle: draggedPreference ? "dashed" : "solid",
                    transform: draggedPreference ? "scale(1.05)" : "scale(1)",
                  }}
                >
                  <div className="text-center mb-4">
                    <div className="text-5xl mb-2">{genre.emoji}</div>
                    <h3
                      className="text-xl font-bold"
                      style={{ color: "var(--color-ink)" }}
                    >
                      {genre.name}
                    </h3>
                    <p
                      className="text-sm"
                      style={{ color: "var(--color-muted)" }}
                    >
                      {genre.count} movies
                    </p>
                  </div>

                  {/* Drop Zone */}
                  <div
                    className="mt-4 min-h-[80px] rounded-lg border-2 border-dashed flex items-center justify-center p-3"
                    style={{ borderColor: "var(--color-border)" }}
                  >
                    {prefOption ? (
                      <div className="w-full">
                        <div
                          className="rounded-lg p-3 text-sm font-medium text-center"
                          style={{
                            backgroundColor: prefOption.color,
                            color: "white",
                          }}
                        >
                          {prefOption.text}
                        </div>
                        <button
                          onClick={() => handleRemovePreference(genre.id)}
                          className="w-full mt-2 text-xs transition font-medium"
                          style={{ color: "#E74C3C" }}
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <p
                        className="text-sm text-center"
                        style={{ color: "var(--color-muted)" }}
                      >
                        Drop preference here
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={handleSave}
            className="py-3 px-8 rounded-lg font-medium transition-all transform hover:scale-105 shadow-lg"
            style={{
              backgroundColor: "var(--color-accent)",
              color: "var(--color-ink)",
            }}
          >
            💾 Save Preferences
          </button>
          <button
            onClick={handleReset}
            className="py-3 px-8 rounded-lg font-medium transition-all border-2"
            style={{
              backgroundColor: "var(--color-card-hover)",
              color: "var(--color-ink)",
              borderColor: "var(--color-border)",
            }}
          >
            🔄 Reset All
          </button>
          <button
            onClick={() => navigate("/profile")}
            className="py-3 px-8 rounded-lg font-medium transition-all border-2"
            style={{
              backgroundColor: "var(--color-card)",
              color: "var(--color-ink)",
              borderColor: "var(--color-border)",
            }}
          >
            ← Back to Profile
          </button>
        </div>

        {/* Summary */}
        {Object.keys(genrePreferences).length > 0 && (
          <div
            className="mt-8 rounded-2xl p-6 border-2"
            style={{
              backgroundColor: "var(--color-card)",
              borderColor: "var(--color-border)",
            }}
          >
            <h3
              className="text-xl font-bold mb-4"
              style={{ color: "var(--color-ink)" }}
            >
              📊 Your Preferences Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(genrePreferences).map(([genreId, prefId]) => {
                const genre = categories.find(
                  (g) => g.id === parseInt(genreId),
                );
                const pref = getPreferenceById(prefId);
                return (
                  <div
                    key={genreId}
                    className="flex items-center justify-between rounded-lg p-3"
                    style={{ backgroundColor: "var(--color-dark-light)" }}
                  >
                    <span style={{ color: "var(--color-ink)" }}>
                      {genre?.emoji} {genre?.name}
                    </span>
                    <span
                      className="text-sm px-3 py-1 rounded-full"
                      style={{
                        backgroundColor: pref?.color,
                        color: "white",
                      }}
                    >
                      {pref?.text}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PersonalPreference;
