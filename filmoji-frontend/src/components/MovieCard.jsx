function MovieCard({ movie }) {
  return (
    <div className="group card-base overflow-hidden cursor-pointer hover:scale-105 hover:shadow-xl hover:shadow-black/40">
      <div className="aspect-[2/3] overflow-hidden">
        <img
          src={movie.poster}
          alt={movie.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
      </div>
      <div className="p-4">
        <h3 className="text-sm font-semibold text-white truncate">{movie.title}</h3>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-muted">{movie.year}</span>
          <span className="text-xs font-semibold text-yellow-400 flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            {movie.rating}
          </span>
        </div>
        <div className="flex gap-2 mt-2 flex-wrap">
          {movie.genres.map((genre) => (
            <span key={genre} className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/60">
              {genre}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

export default MovieCard
