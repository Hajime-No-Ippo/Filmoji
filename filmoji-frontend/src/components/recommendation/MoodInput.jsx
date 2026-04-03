import { useState } from 'react'

function MoodInput() {
  const [mood, setMood] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (mood.trim()) {
      console.log('Mood submitted:', mood)
      // Will connect to backend later
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-lg mx-auto relative">
      <input
        type="text"
        value={mood}
        onChange={(e) => setMood(e.target.value)}
        placeholder="Which emoji do you want to feel like today?"
        className="w-full py-3.5 pl-6 pr-14 rounded-full bg-white/15 backdrop-blur-md border border-white/30 text-white placeholder-white/50 text-sm outline-none focus:border-white/60 transition-colors"
      />
      <button
        type="submit"
        className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 border-none flex items-center justify-center cursor-pointer transition-colors"
        aria-label="Submit mood"
      >
        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z" />
        </svg>
      </button>
    </form>
  )
}

export default MoodInput
