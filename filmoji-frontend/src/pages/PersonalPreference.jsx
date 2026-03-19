import { useState, useEffect } from "react";
import { auth, db } from "../../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { categories } from "../data/categories";

const preferenceOptions = [
  { id: "love", text: "Absolutely loved it", color: "bg-green-500" },
  { id: "enjoy", text: "Really enjoyed it", color: "bg-blue-500" },
  { id: "okay", text: "It was okay", color: "bg-yellow-500" },
  { id: "notfunny", text: "Not very funny", color: "bg-orange-500" },
  { id: "dislike", text: "Didn't like it", color: "bg-red-500" },
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-black">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black pt-24 px-4 pb-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8 border border-white/20">
          <h1 className="text-3xl font-bold text-white mb-2">
            Personal Preference
          </h1>
          <p className="text-gray-300">
            Drag and drop your preferences to each movie genre to customize your
            experience
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-blue-500/20 backdrop-blur-lg rounded-xl p-4 mb-6 border border-blue-400/30">
          <p className="text-white text-sm">
            💡 <strong>How to use:</strong> Drag a preference option from below
            and drop it onto a genre card to set your preference for that genre.
          </p>
        </div>

        {/* Section 1: Preference Options */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">
            🎯 Preference Levels
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {preferenceOptions.map((pref) => (
              <div
                key={pref.id}
                draggable
                onDragStart={(e) => handleDragStart(e, pref.id)}
                className={`${pref.color} rounded-xl p-4 cursor-move hover:scale-105 transition-transform shadow-lg border-2 border-white/30`}
              >
                <div className="text-white font-semibold text-center">
                  {pref.text}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Movie Genres */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">
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
                  className={`bg-white/10 backdrop-blur-lg rounded-2xl p-6 border-2 transition-all ${
                    draggedPreference
                      ? "border-yellow-400 border-dashed scale-105"
                      : "border-white/20 hover:border-purple-400/50"
                  }`}
                >
                  <div className="text-center mb-4">
                    <div className="text-5xl mb-2">{genre.emoji}</div>
                    <h3 className="text-xl font-bold text-white">
                      {genre.name}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      {genre.count} movies
                    </p>
                  </div>

                  {/* Drop Zone */}
                  <div className="mt-4 min-h-[80px] rounded-lg border-2 border-dashed border-white/30 flex items-center justify-center p-3">
                    {prefOption ? (
                      <div className="w-full">
                        <div
                          className={`${prefOption.color} rounded-lg p-3 text-white text-sm font-medium text-center`}
                        >
                          {prefOption.text}
                        </div>
                        <button
                          onClick={() => handleRemovePreference(genre.id)}
                          className="w-full mt-2 text-xs text-red-400 hover:text-red-300 transition"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm text-center">
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
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-8 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105 shadow-lg"
          >
            💾 Save Preferences
          </button>
          <button
            onClick={handleReset}
            className="bg-white/20 text-white py-3 px-8 rounded-lg font-medium hover:bg-white/30 transition-all border border-white/30"
          >
            🔄 Reset All
          </button>
          <button
            onClick={() => navigate("/profile")}
            className="bg-white/10 text-white py-3 px-8 rounded-lg font-medium hover:bg-white/20 transition-all border border-white/20"
          >
            ← Back to Profile
          </button>
        </div>

        {/* Summary */}
        {Object.keys(genrePreferences).length > 0 && (
          <div className="mt-8 bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <h3 className="text-xl font-bold text-white mb-4">
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
                    className="flex items-center justify-between bg-white/5 rounded-lg p-3"
                  >
                    <span className="text-white">
                      {genre?.emoji} {genre?.name}
                    </span>
                    <span
                      className={`${pref?.color} text-white text-sm px-3 py-1 rounded-full`}
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
