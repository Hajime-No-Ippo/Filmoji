import { useNavigate } from 'react-router-dom'

function ReviewSnippetCard({ review, movieId }) {
  const navigate = useNavigate()

  return (
    <div
      onClick={() => navigate(`/reviews?movieId=${movieId}`)}
      className="card-base p-4 flex gap-4 cursor-pointer hover:shadow-lg hover:border-accent/40 transition-all duration-200"
    >
      {/* Avatar */}
      <div
        className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-ink font-bold text-sm"
        style={{ backgroundColor: 'var(--color-accent)' }}
      >
        {review.userEmail?.charAt(0).toUpperCase()}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <p className="text-sm font-semibold text-ink truncate">{review.userEmail}</p>
          <span className="text-xs font-bold text-accent flex-shrink-0">{review.rating}/10</span>
        </div>
        <p className="text-sm text-muted line-clamp-2 leading-relaxed">
          {review.comment}
        </p>
      </div>
    </div>
  )
}

export default ReviewSnippetCard
