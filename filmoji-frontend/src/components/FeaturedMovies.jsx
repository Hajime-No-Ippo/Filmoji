import { useState, useEffect } from 'react';
import { featuredMovies } from '../data/movies'
import MovieCard from './MovieCard'

function FeaturedMovies() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  // Replace 'YOUR_API_KEY' with your actual OMDb key
  const API_KEY = '5194e81b'; 
  // const query = 'Space'; 

  useEffect(() => {
    const fetchSpecificMovies = async () => {
      try {
        // Create an array of fetch promises based on your movies.js titles
        const moviePromises = featuredMovies.map(movie =>
          fetch(`https://www.omdbapi.com/?t=${encodeURIComponent(movie.title)}&apikey=${API_KEY}`)
            .then(res => res.json())
        );

        // Wait for all movies to come back from the API
        const results = await Promise.all(moviePromises);

        // Format the OMDb data to match your component's needs
        const formattedMovies = results.map((data, index) => ({
          id: data.imdbID || index,
          title: data.Title || featuredMovies[index].title,
          year: data.Year || featuredMovies[index].year,
          // Use OMDb poster, fallback to your local one if "N/A"
          poster: data.Poster !== "N/A" ? data.Poster : featuredMovies[index].poster,
          rating: data.imdbRating || "N/A",
          genres: data.Genre ? data.Genre.split(", ") : []
        }));

        setMovies(formattedMovies);
      } catch (error) {
        console.error("Error fetching movies:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSpecificMovies();
  }, []);

  if (loading) return <div className="container-main">Updating movie posters...</div>;


  return (
    <section id="featured" className="section">
      <div className="container-main">
        <h2 className="section-title">Featured Movies</h2>
        <p className="section-subtitle">Handpicked recommendations just for you</p>
        <div className="grid-movies">
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default FeaturedMovies
