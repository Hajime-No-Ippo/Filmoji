import { useSearchParams, Link } from 'react-router-dom'
import { featuredMovies } from '../data/movies'
import MovieCard from '../components/MovieCard'

const moodLabels = {
  happy:       '😊 Happy',
  angry:       '😡 Angry',
  cool:        '😎 Cool',
  festive:     '🥳 Festive',
  sad:         '😢 Sad',
  romantic:    '😍 Romantic',
  excited:     '🤩 Excited',
  bored:       '😴 Bored',
  scared:      '😱 Scared',
  emotional:   '🥺 Emotional',
  mindblown:   '🤯 Mind-blown',
  peaceful:    '😌 Peaceful',
  laughing:    '😂 Laughing',
  curious:     '🤔 Curious',
  tense:       '😤 Tense',
  overwhelmed: '🫠 Overwhelmed',
}

function Recommendations() {
  const [searchParams] = useSearchParams()
  const mood = searchParams.get('mood') || ''
  const label = moodLabels[mood] || mood

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="container-main">
        <Link to="/" className="accent-link text-sm mb-8 inline-block">← Back</Link>

        <h1 className="text-3xl font-bold text-white mb-2">
          {label ? `Feeling ${label}?` : 'Recommendations'}
        </h1>
        <p className="section-subtitle mb-10">
          Movies picked for your current mood
        </p>

        {/* Placeholder — replace with real recommendation logic */}
        <div className="grid-movies">
          {featuredMovies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default Recommendations
