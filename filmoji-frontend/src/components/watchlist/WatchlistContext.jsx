import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { onAuthStateChanged } from "firebase/auth";
import {
  doc,
  onSnapshot,
  setDoc,
  arrayRemove,
  arrayUnion,
} from "firebase/firestore";
import { auth, db } from "../../../firebase";

const WatchlistContext = createContext(null);

export function WatchlistProvider({ children }) {
  const [user, setUser] = useState(null);
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser || null);
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) {
      setWatchlist([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const profileRef = doc(db, "userProfiles", user.uid);

    const unsubscribeProfile = onSnapshot(
      profileRef,
      (snap) => {
        const data = snap.data();
        const ids = Array.isArray(data?.watchlist) ? data.watchlist : [];
        setWatchlist(ids);
        setLoading(false);
      },
      () => {
        setWatchlist([]);
        setLoading(false);
      },
    );

    return () => unsubscribeProfile();
  }, [user]);

  const isInWatchlist = useCallback(
    (movieId) => {
      if (movieId === undefined || movieId === null) return false;
      return watchlist.includes(movieId);
    },
    [watchlist],
  );

  const toggleWatchlist = useCallback(
    async (movieId) => {
      if (!user) return;
      if (movieId === undefined || movieId === null) return;

      const profileRef = doc(db, "userProfiles", user.uid);
      const inList = watchlist.includes(movieId);

      await setDoc(
        profileRef,
        {
          watchlist: inList ? arrayRemove(movieId) : arrayUnion(movieId),
        },
        { merge: true },
      );
    },
    [user, watchlist],
  );

  const value = useMemo(
    () => ({ user, watchlist, loading, isInWatchlist, toggleWatchlist }),
    [user, watchlist, loading, isInWatchlist, toggleWatchlist],
  );

  return (
    <WatchlistContext.Provider value={value}>
      {children}
    </WatchlistContext.Provider>
  );
}

export function useWatchlist() {
  const ctx = useContext(WatchlistContext);
  if (!ctx) {
    throw new Error("useWatchlist must be used within a WatchlistProvider");
  }
  return ctx;
}
