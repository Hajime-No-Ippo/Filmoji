import { useState, useEffect } from 'react'

const API_KEY = import.meta.env.VITE_OMDB_API_KEY
const CACHE_KEY = 'omdb_cache'
const CACHE_TTL = 24 * 60 * 60 * 1000 // 24 hours

function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function writeCache(cache) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
  } catch {
    // storage full — silently skip
  }
}

async function fetchWithCache(title) {
  const cache = readCache()
  const entry = cache[title]

  if (entry && Date.now() - entry.ts < CACHE_TTL) {
    return entry.data
  }

  const res = await fetch(
    `https://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=${API_KEY}`
  )
  const data = await res.json()

  if (data.Response !== 'False') {
    writeCache({ ...readCache(), [title]: { ts: Date.now(), data } })
  }

  return data
}

export function useMoviesWithPosters(localMovies) {
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  

  useEffect(() => {
    if (!localMovies?.length) {
      setLoading(false)
      return
    }
    
    const fetchMovies = async () => {
      try {
        const results = await Promise.all(
          localMovies.map((movie) => fetchWithCache(movie.title))
        )

        setMovies(
          results.map((data, i) => ({
            ...localMovies[i],
            title:  data.Title                            || localMovies[i].title,
            year:   data.Year                             || localMovies[i].year,
            poster: data.Poster && data.Poster !== 'N/A'  ? data.Poster : localMovies[i].poster,
            rating: data.imdbRating                       || localMovies[i].rating,
            genres: data.Genre ? data.Genre.split(', ')   : localMovies[i].genres,
          }))
        )
      } catch (err) {
        console.error('OMDb fetch failed:', err)
        setMovies(localMovies)
      } finally {
        setLoading(false)
      }
    }

    fetchMovies()
  }, [localMovies])

  return { movies, loading }
}

export function useMoviesTrailer(tmdbId) {
  const [trailerKey, setTrailerKey] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!tmdbId) {
      setTrailerKey(null)
      setLoading(false)
      return
    }

    setLoading(true)

    fetch(`/api/movies/tmdb/${tmdbId}/trailer`)
      .then((res) => res.json())
      .then((data) => setTrailerKey(data.trailerKey ?? null))
      .catch((err) => {
        console.error('Trailer fetch failed:', err)
        setTrailerKey(null)
      })
      .finally(() => setLoading(false))
  }, [tmdbId])

  return { trailerKey, loading }
}
