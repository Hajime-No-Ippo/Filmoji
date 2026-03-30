import { Routes, Route } from "react-router-dom";
import "./App.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { ToastProvider } from "./components/ToastContext";
import Home from "./pages/Home";
import Categories from "./pages/Categories";
import CategoryDetail from "./pages/CategoryDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import UserProfile from "./pages/UserProfile";
import MovieReviews from "./pages/MovieReviews";
import MovieDetail from "./pages/MovieDetail";
import Recommendations from "./pages/Recommendations";
import EmojiRecommendations from "./pages/EmojiRecommendations";
import PersonalPreference from "./pages/PersonalPreference";
import ProtectedRoute from "./components/ProtectedRoute";
import ScrollToTop from "./components/ScrollToTop";

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
            path="/personal-preference"
            element={
              <ProtectedRoute>
                <PersonalPreference />
              </ProtectedRoute>
            }
          />
          <Route path="/recommendations" element={<Recommendations />} />
          <Route path="/emoji-recommendations" element={<EmojiRecommendations />} />
          <Route path="/forget" element={<ForgotPassword />} />
        </Routes>
      </main>
      <Footer />
    </ToastProvider>
  );
}

export default App;
