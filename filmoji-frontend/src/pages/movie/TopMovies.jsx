import React from 'react';
import MovieCard from '../../components/movie/MovieCard'

function TopMovies({ movies }) {

  return (
    <div>
    <section id="featured" className="section">
      <div className="container-main">
        <h2 className="section-title"
        style ={{}}>
          Top 10 for you</h2>
        <p className="section-subtitle">Handpicked recommendations just for you</p>
        <div>
          <div className="overflow-x-auto pb-4 snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex gap-6 px-2">
              {movies.map((movie, index) => (
                // Gradient Overlay 
                <div key={movie.id} className="relative shrink-0 snap-center"
                style={{ width: 'clamp(140px, 30vw, 250px)' }}>
                  <MovieCard movie={movie} rank={index + 1}/>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
    </div>
  );
};

export default TopMovies;