import React from 'react'
import { motion } from 'motion/react'

const ReviewCard = ({ comment, userEmail, rating, movieTitle }) => (
  <div className="p-6 rounded-3xl border border-border shadow-lg shadow-accent/10 bg-card w-72 md:w-80 flex-shrink-0">
    <p className="text-ink/70 text-sm leading-relaxed mb-5 whitespace-pre-wrap" style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 400 }}>
      {comment?.length > 120 ? comment.substring(0, 120) + '…' : comment}
    </p>
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <img
          src={`https://i.pravatar.cc/40?u=${userEmail}`}
          alt={userEmail}
          className="w-9 h-9 rounded-full flex-shrink-0 object-cover"
        />
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-medium text-ink truncate max-w-[140px]">{userEmail}</span>
          {movieTitle && <span className="text-xs text-muted truncate max-w-[140px]">{movieTitle}</span>}
        </div>
      </div>
      <span className="text-xs font-bold text-yellow-500 flex-shrink-0">★ {rating}/10</span>
    </div>
  </div>
)

// Single scrolling column
export const ReviewsColumn = ({ reviews = [], duration = 15, className = '' }) => {
  if (!reviews.length) return null
  return (
    <div className={`overflow-hidden ${className}`}>
      <motion.div
        animate={{ translateY: '-50%' }}
        transition={{ duration, repeat: Infinity, ease: 'linear', repeatType: 'loop' }}
        className="flex flex-col gap-6 pb-6"
      >
        {[...Array(2)].map((_, dupIdx) => (
          <React.Fragment key={dupIdx}>
            {reviews.map((review, i) => (
              <ReviewCard key={`${dupIdx}-${i}`} {...review} />
            ))}
          </React.Fragment>
        ))}
      </motion.div>
    </div>
  )
}

// Multi-column wall — splits reviews across N columns, responsive
export const ReviewsWall = ({ reviews = [], className = '' }) => {
  if (!reviews.length) return null

  const durations = [18, 14, 20]

  return (
    <div className={`flex justify-center gap-6 ${className}`}>
      {/* Mobile: 1 col, Tablet: 2 cols, Desktop: 3 cols */}
      {[0, 1, 2].map((i) => {
        const colReviews = reviews.filter((_, idx) => idx % 3 === i)
        const colClass = i === 0 ? 'flex' : i === 1 ? 'hidden md:flex' : 'hidden lg:flex'
        return (
          <ReviewsColumn
            key={i}
            reviews={colReviews}
            duration={durations[i]}
            className={colClass}
          />
        )
      })}
    </div>
  )
}

export default ReviewsColumn
