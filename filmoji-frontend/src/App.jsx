import { Routes, Route } from "react-router-dom";
import "./App.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { ToastProvider } from "./components/toast/ToastContext";
import Home from "./pages/Home";
import Categories from "./pages/movie/Categories";
import CategoryDetail from "./pages/movie/CategoryDetail";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import Dashboard from "./pages/user/Dashboard";
import UserProfile from "./pages/user/UserProfile";
import Ratings from "./pages/user/Ratings";
import Username from "./pages/user/Username";
import MovieReviews from "./pages/movie/MovieReviews";
import MovieDetail from "./pages/movie/MovieDetail";
import Recommendations from "./pages/recommendation/Recommendations";
import EmojiRecommendations from "./pages/recommendation/EmojiRecommendations";
import PersonalPreference from "./pages/user/PersonalPreference";
import ProtectedRoute from "./components/functional/ProtectedRoute";
import ScrollToTop from "./components/functional/ScrollToTop";

function App() {
  return (
    <ToastProvider>
      <ScrollToTop />
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/category/:name" element={<CategoryDetail />} />
          <Route path="/reviews" element={<MovieReviews />} />
          <Route path="/movie/:id" element={<MovieDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/ratings"
            element={
              <ProtectedRoute>
                <Ratings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/username"
            element={
              <ProtectedRoute>
                <Username />
              </ProtectedRoute>
            }
          />
          <Route
            path="/personal-preference"
            element={
              <ProtectedRoute>
                <PersonalPreference />
              </ProtectedRoute>
            }
          />
          <Route path="/recommendations" element={<Recommendations />} />
          <Route
            path="/emoji-recommendations"
            element={<EmojiRecommendations />}
          />
          <Route path="/forget" element={<ForgotPassword />} />
        </Routes>
      </main>
      <Footer />
    </ToastProvider>
  );
}

export default App;
