import { Link } from 'react-router-dom'

function Footer() {
  return (
    <footer className="border-t border-border py-12 px-6">
      <div className="container-main">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-bold tracking-widest text-white mb-4">FILMOJI</h3>
            <p className="text-muted text-sm leading-relaxed">
              AI-powered movie recommendations based on your mood and preferences.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Browse</h4>
            <div className="flex flex-col gap-2">
              <Link to="/" className="footer-link">Home</Link>
              <Link to="/categories" className="footer-link">Categories</Link>
              <a href="#featured" className="footer-link">Featured</a>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Account</h4>
            <div className="flex flex-col gap-2">
              <Link to="/login" className="footer-link">Login</Link>
              <Link to="/register" className="footer-link">Register</Link>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Legal</h4>
            <div className="flex flex-col gap-2">
              <a href="#" className="footer-link">Privacy Policy</a>
              <a href="#" className="footer-link">Terms of Service</a>
            </div>
          </div>
        </div>
        <div className="border-t border-border pt-6 text-center">
          <p className="text-muted text-sm">&copy; 2026 Filmoji. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
