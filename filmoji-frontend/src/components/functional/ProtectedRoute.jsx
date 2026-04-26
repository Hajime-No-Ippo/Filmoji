import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { auth } from "../../../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { authFetch } from "../../utils/api";

const ProtectedRoute = ({ children }) => {
  const [user, setUser] = useState(undefined);
  const [onboardingComplete, setOnboardingComplete] = useState(undefined);
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setOnboardingComplete(undefined);
        return;
      }
      try {
        const res = await authFetch('/api/users/me');
        if (res.ok) {
          const data = await res.json();
          setOnboardingComplete(Boolean(data.onboardingComplete));
        } else {
          setOnboardingComplete(false);
        }
      } catch (_) {
        setOnboardingComplete(false);
      }
    });
    return () => unsubscribe();
  }, []);

  if (user === undefined) return null;
  if (!user) return <Navigate to="/" />;
  if (onboardingComplete === undefined) return null;
  if (!onboardingComplete && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
};

export default ProtectedRoute;
