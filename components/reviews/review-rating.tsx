"use client"

import { Star } from "lucide-react"

interface ReviewRatingProps {
  rating: number
  totalReviews?: number
  size?: "sm" | "md" | "lg"
  showText?: boolean
  className?: string
}

export function ReviewRating({
  rating,
  totalReviews,
  size = "sm",
  showText = true,
  className = "",
}: ReviewRatingProps) {
  const getStarSize = () => {
    switch (size) {
      case "sm":
        return "w-3 h-3"
      case "md":
        return "w-4 h-4"
      case "lg":
        return "w-5 h-5"
      default:
        return "w-4 h-4"
    }
  }

  const getTextSize = () => {
    switch (size) {
      case "sm":
        return "text-xs"
      case "md":
        return "text-sm"
      case "lg":
        return "text-base"
      default:
        return "text-sm"
    }
  }

  const renderStars = () => {
    const starSize = getStarSize()
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)

    return (
      <div className="flex items-center">
        {/* Full stars */}
        {Array.from({ length: fullStars }).map((_, index) => (
          <Star
            key={`full-${index}`}
            className={`${starSize} fill-yellow-400 text-yellow-400`}
          />
        ))}

        {/* Half star */}
        {hasHalfStar && (
          <div className="relative">
            <Star className={`${starSize} text-gray-300`} />
            <div className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
              <Star className={`${starSize} fill-yellow-400 text-yellow-400`} />
            </div>
          </div>
        )}

        {/* Empty stars */}
        {Array.from({ length: emptyStars }).map((_, index) => (
          <Star
            key={`empty-${index}`}
            className={`${starSize} text-gray-300`}
          />
        ))}
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {renderStars()}
      
      {showText && (
        <div className={`${getTextSize()} text-gray-600`}>
          <span className="font-medium">{rating.toFixed(1)}</span>
          {totalReviews !== undefined && (
            <span className="ml-1">
              ({totalReviews} review{totalReviews !== 1 ? 's' : ''})
            </span>
          )}
        </div>
      )}
    </div>
  )
}

