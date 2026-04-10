import { useEffect, useState } from "react";
import { auth, db } from "../../../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

function Username() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        navigate("/login");
        return;
      }

      setUser(currentUser);

      try {
        const profileRef = doc(db, "userProfiles", currentUser.uid);
        const snapshot = await getDoc(profileRef);

        if (snapshot.exists()) {
          const data = snapshot.data();
          setUsername(data.username || "");
          setBio(data.bio || "");
        } else {
          setUsername(currentUser.displayName || "");
          setBio("");
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleSave = async () => {
    const trimmedUsername = username.trim();

    if (!trimmedUsername) {
      alert("Username is required");
      return;
    }

    if (!user) return;

    setSaving(true);
    try {
      const profileRef = doc(db, "userProfiles", user.uid);
      await setDoc(
        profileRef,
        {
          userId: user.uid,
          userEmail: user.email || "",
          username: trimmedUsername,
          bio: bio.trim(),
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );

      navigate("/profile");
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Failed to save, please try again");
    } finally {
      setSaving(false);
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
      className="min-h-screen pt-24 px-4 lg:px-10 pb-12"
      style={{ backgroundColor: "var(--color-dark)" }}
    >
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => navigate("/profile")}
          className="mb-6 font-medium transition hover:underline"
          style={{ color: "var(--color-ink)" }}
          type="button"
        >
          ← Back
        </button>

        <div
          className="rounded-2xl p-6 shadow-lg"
          style={{ backgroundColor: "var(--color-card)" }}
        >
          <div className="mb-8">
            <div className="text-sm" style={{ color: "var(--color-muted)" }}>
              Account settings
            </div>
            <h1
              className="text-4xl font-bold mt-1"
              style={{ color: "var(--color-ink)" }}
            >
              Edit profile
            </h1>
          </div>

          <div className="space-y-6">
            <div>
              <label
                className="block text-sm font-semibold mb-2"
                style={{ color: "var(--color-ink)" }}
              >
                Username
              </label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Your nickname"
                maxLength={32}
                className="w-full py-3 px-4 rounded-lg outline-none"
                style={{
                  backgroundColor: "var(--color-card-hover)",
                  color: "var(--color-ink)",
                }}
              />
              <div
                className="mt-2 text-xs"
                style={{ color: "var(--color-muted)" }}
              >
                This name will show under "My Profile".
              </div>
            </div>

            <div>
              <label
                className="block text-sm font-semibold mb-2"
                style={{ color: "var(--color-ink)" }}
              >
                Bio
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Write a short intro..."
                rows={4}
                maxLength={200}
                className="w-full py-3 px-4 rounded-lg outline-none resize-none"
                style={{
                  backgroundColor: "var(--color-card-hover)",
                  color: "var(--color-ink)",
                }}
              />
              <div
                className="mt-2 text-xs"
                style={{ color: "var(--color-muted)" }}
              >
                {bio.length}/200
              </div>
            </div>
          </div>

          <div className="mt-8 flex gap-3 justify-end">
            <button
              onClick={() => navigate("/profile")}
              className="py-3 px-6 rounded-lg font-medium transition"
              style={{
                backgroundColor: "var(--color-card-hover)",
                color: "var(--color-ink)",
              }}
              disabled={saving}
              type="button"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="py-3 px-6 rounded-lg font-medium transition shadow-lg"
              style={{
                backgroundColor: "var(--color-accent)",
                color: "var(--color-ink)",
                opacity: saving ? 0.7 : 1,
              }}
              disabled={saving}
              type="button"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Username;
