import { useState, useEffect } from "react";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase";
import { useNavigate } from "react-router-dom";
import MoodInput from "../components/MoodInput";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  return (
    <div className="min-h-screen pt-24 bg-dark">
      <div className="container-main px-6">
        <div className="flex items-center justify-between py-4 border-b border-border">
          <span className="text-white font-[Inter] text-sm">
            {user?.email}
          </span>
          <button onClick={handleLogout} className="btn-outline">
            Logout
          </button>
        </div>

        <div className="flex flex-col items-center justify-center mt-32">
          <h2 className="section-title text-white mb-8">
            How are you feeling today?
          </h2>
          <MoodInput />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
