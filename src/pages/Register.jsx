import { useState } from 'react'
import { Link } from 'react-router-dom'

function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [accepted, setAccepted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Register:', { name, email, password, confirm, accepted })
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-5xl rounded-2xl overflow-hidden shadow-2xl shadow-black/50 flex flex-col md:flex-row">

        {/* Left decorative panel */}
        <div className="relative md:w-5/12 bg-gradient-to-br from-panel via-panel/80 to-panel-end p-10 flex flex-col justify-between overflow-hidden min-h-[200px] md:min-h-[600px]">

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
            <h2 className="text-white text-2xl md:text-3xl font-bold mb-2">Welcome! 😄</h2>
            <p className="text-white/70 text-sm font-[Inter]">Register to save your personalised recommendations</p>
          </div>
        </div>

        {/* Right form panel */}
        <div className="md:w-7/12 bg-card p-8 md:p-12 flex flex-col justify-center">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-white">Register</h1>
            <Link to="/login" className="accent-link flex items-center gap-1 font-[Inter]">
              <span>&rarr;</span> Already have account?
            </Link>
          </div>

          {/* Social login
          <div className="flex gap-3 mb-6">
            <button className="btn-social bg-[#3b5998] hover:bg-[#344e86]">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              FACEBOOK
            </button>
            <button className="btn-social bg-[#1da1f2] hover:bg-[#1a91da]">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
              TWITTER
            </button>
            <button className="btn-social bg-[#db4437] hover:bg-[#c53d31]">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/></svg>
              GOOGLE
            </button>
          </div> */}

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="divider"></div>
            <span className="divider-text">Or register with email</span>
            <div className="divider"></div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
              className="input-field"
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="input-field"
            />
            <div className="flex gap-3">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="input-field flex-1"
              />
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Repeat Password"
                className="input-field flex-1"
              />
            </div>

            {/* Terms + Submit */}
            <div className="flex items-center justify-between gap-4 pt-2">
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={accepted}
                  onChange={(e) => setAccepted(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded accent-accent shrink-0"
                />
                <span className="text-white/60 text-xs leading-relaxed font-[Inter]">
                  I have read and accept the{' '}
                  <a href="#" className="accent-link">Terms of Service & Privacy Policy</a> *
                </span>
              </label>
              <button
                type="submit"
                className="btn-primary px-8 shrink-0"
              >
                Continue
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Register
