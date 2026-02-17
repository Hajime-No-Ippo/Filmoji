import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'

function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const isHome = location.pathname === '/'

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const showBg = scrolled || !isHome

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${showBg ? 'bg-dark/95 backdrop-blur-sm shadow-lg' : 'bg-transparent'}`}>
      <div className="container-main px-6 py-4 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold tracking-widest text-white no-underline">
          FILMOJI
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          <a href={isHome ? '#featured' : '/'} className="nav-link">
            Featured
          </a>
          <a href={isHome ? '#categories' : '/categories'} className="nav-link">
            Top Categories
          </a>
          <Link to="/categories" className="nav-link">
            All Categories
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-4">
          <Link to="/login" className="text-sm font-semibold text-white no-underline hover:text-white/80 transition-colors">
            LOGIN
          </Link>
          <Link to="/register" className="btn-outline">
            REGISTER
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col gap-1.5 bg-transparent border-none cursor-pointer p-1"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span className={`block w-6 h-0.5 bg-white transition-transform ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block w-6 h-0.5 bg-white transition-opacity ${menuOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-6 h-0.5 bg-white transition-transform ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-dark/95 backdrop-blur-sm border-t border-white/10 px-6 py-4 flex flex-col gap-4">
          <a href={isHome ? '#featured' : '/'} className="nav-link" onClick={() => setMenuOpen(false)}>Featured</a>
          <a href={isHome ? '#categories' : '/categories'} className="nav-link" onClick={() => setMenuOpen(false)}>Top Categories</a>
          <Link to="/categories" className="nav-link" onClick={() => setMenuOpen(false)}>All Categories</Link>

          <hr className="border-white/10" />
          <Link to="/login" className="text-white no-underline font-semibold" onClick={() => setMenuOpen(false)}>LOGIN</Link>
          <Link to="/register" className="text-white no-underline" onClick={() => setMenuOpen(false)}>REGISTER</Link>
        </div>
      )}
    </nav>
  )
}

export default Navbar
