import { useState } from "react"
import { sendPasswordResetEmail } from "firebase/auth"
import { auth } from "../../firebase"
import { Link } from "react-router-dom"

function ForgotPassword() {
  const [email, setEmail] = useState("")

  const handleReset = async (e) => {
    e.preventDefault()

    try {
      await sendPasswordResetEmail(auth, email)
      alert("Password reset email sent.")
    } catch (error) {
      alert(error.message)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-5xl rounded-2xl overflow-hidden shadow-2xl shadow-black/50 flex flex-col md:flex-row">

        {/* Left decorative panel */}
        <div className="relative md:w-5/12 bg-gradient-to-br from-panel via-panel/80 to-panel-end p-10 flex flex-col justify-between overflow-hidden min-h-[200px] md:min-h-[550px]">

          {/* Background video */}
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src="/0217.mp4" type="video/mp4" />
          </video>

          {/* Dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/70" />

          {/* Home link */}
          <Link to="/" className="nav-link relative z-10">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" />
            </svg>
          </Link>

          {/* Branding */}
          <div className="relative z-10">
            <p className="text-white/80 text-xs tracking-widest uppercase mb-4">Filmoji</p>
            <h2 className="text-white text-2xl md:text-3xl font-bold mb-2">Don't worry</h2>
            <p className="text-white/70 text-sm font-[Inter]">We'll help you reset your password</p>
          </div>
        </div>

        {/* Right form panel */}
        <div className="md:w-7/12 bg-card p-8 md:p-12 flex flex-col justify-center">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-white">Reset Password</h1>
            <Link to="/login" className="accent-link flex items-center gap-1 font-[Inter]">
              <span>&rarr;</span> Back to login
            </Link>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="divider"></div>
            <span className="divider-text">Enter your email to reset</span>
            <div className="divider"></div>
          </div>

          {/* Form */}
          <form onSubmit={handleReset} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="input-field"
              required
            />

            <button
              type="submit"
              className="btn-primary w-full"
            >
              Send Reset Link
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
