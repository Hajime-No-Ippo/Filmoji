import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../../firebase";

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState({ email: "test@user.com" });
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === "/";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // TODO: uncomment when Firebase auth is connected
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

  const showBg = scrolled || !isHome;
  // Hero is dark (emoji blocks) → white text when transparent.
  // Scrolled / other pages use light cream bg → dark ink text.
  const tc  = showBg ? "text-[#1C1600]"    : "text-white";
  const tcF = showBg ? "text-[#1C1600]/70" : "text-white/80";
  const bar = showBg ? "bg-[#1C1600]"      : "bg-white";

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${showBg ? "bg-dark/95 backdrop-blur-sm shadow-lg shadow-black/10" : "bg-transparent"}`}
    >
      <div className="container-main px-6 py-4 flex items-center justify-between">
        <Link
          to="/"
          className={`text-xl font-bold tracking-widest no-underline transition-colors ${tc}`}
        >
          FILMOJI
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          <a href={isHome ? "#featured" : "/"} className={`nav-link transition-colors ${tcF}`}>
            Featured
          </a>
          <Link to="/categories" className={`nav-link transition-colors ${tcF}`}>
            Top Categories
          </Link>
          <Link to="/reviews" className={`nav-link transition-colors ${tcF}`}>
            Reviews
          </Link>
          <Link to="/emoji-recommendations" className={`nav-link transition-colors ${tcF}`}>
            Recommend
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <>
              <Link
                to="/profile"
                className={`text-sm no-underline transition-colors ${tcF}`}
              >
                {user.email}
              </Link>
              <button
                onClick={handleLogout}
                className={`text-sm px-5 py-2 border rounded-full no-underline transition-colors cursor-pointer bg-transparent ${showBg ? "border-[#1C1600]/30 text-[#1C1600] hover:bg-[#1C1600]/10" : "border-white/40 text-white hover:bg-white/10"}`}
              >
                LOGOUT
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className={`text-sm font-semibold no-underline transition-colors ${tc}`}
              >
                LOGIN
              </Link>
              <Link
                to="/register"
                className={`text-sm px-5 py-2 border rounded-full no-underline transition-colors ${showBg ? "border-[#1C1600]/30 text-[#1C1600] hover:bg-[#1C1600]/10" : "border-white/40 text-white hover:bg-white/10"}`}
              >
                REGISTER
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col gap-1.5 bg-transparent border-none cursor-pointer p-1"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span className={`block w-6 h-0.5 transition-transform ${bar} ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
          <span className={`block w-6 h-0.5 transition-opacity ${bar} ${menuOpen ? "opacity-0" : ""}`} />
          <span className={`block w-6 h-0.5 transition-transform ${bar} ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-dark/98 backdrop-blur-sm border-t border-border px-6 py-4 flex flex-col gap-4">
          <a
            href={isHome ? "#featured" : "/"}
            className="nav-link text-[#1C1600]/70"
            onClick={() => setMenuOpen(false)}
          >
            Featured
          </a>
          
          <Link
            to="/categories"
            className="nav-link text-[#1C1600]/70"
            onClick={() => setMenuOpen(false)}
          >
            All Categories
          </Link>
          <Link
            to="/reviews"
            className="nav-link text-[#1C1600]/70"
            onClick={() => setMenuOpen(false)}
          >
            Reviews
          </Link>
          <Link
            to="/emoji-recommendations"
            className="nav-link text-[#1C1600]/70"
            onClick={() => setMenuOpen(false)}
          >
            Recommend
          </Link>

          <hr className="border-border" />
          {user ? (
            <>
              <Link
                to="/profile"
                className="text-[#1C1600]/70 no-underline text-sm"
                onClick={() => setMenuOpen(false)}
              >
                {user.email}
              </Link>
              <button
                onClick={() => { handleLogout(); setMenuOpen(false); }}
                className="text-[#1C1600] no-underline font-semibold bg-transparent border-none cursor-pointer text-left p-0 text-base"
              >
                LOGOUT
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-[#1C1600] no-underline font-semibold"
                onClick={() => setMenuOpen(false)}
              >
                LOGIN
              </Link>
              <Link
                to="/register"
                className="text-[#1C1600] no-underline"
                onClick={() => setMenuOpen(false)}
              >
                REGISTER
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;
