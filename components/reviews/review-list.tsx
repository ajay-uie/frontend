"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Star,
  ThumbsUp,
  Flag,
  User,
  Calendar,
  CheckCircle,
  AlertCircle,
  Filter,
  TrendingUp,
} from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/contexts/auth-context"

interface Review {
  id: string
  reviewId: string
  rating: number
  title: string
  comment: string
  userName: string
  isVerifiedPurchase: boolean
  helpfulCount: number
  createdAt: Date
}

interface ReviewStats {
  totalReviews: number
  averageRating: number
  ratingDistribution: Record<number, number>
}

interface ReviewListProps {
  productId: string
  showWriteReview?: boolean
  onWriteReviewClick?: () => void
}

export function ReviewList({
  productId,
  showWriteReview = false,
  onWriteReviewClick,
}: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [stats, setStats] = useState<ReviewStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [sortBy, setSortBy] = useState("newest")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [helpfulClicks, setHelpfulClicks] = useState<Set<string>>(new Set())
  const [reportedReviews, setReportedReviews] = useState<Set<string>>(new Set())

  const { user, token } = useAuth()
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

  useEffect(() => {
    loadReviews()
  }, [productId, sortBy, currentPage])

  const loadReviews = async () => {
    setIsLoading(true)

    try {
      const params = new URLSearchParams({
        limit: '10',
        page: currentPage.toString(),
        sortBy,
      })

      const response = await fetch(`${API_BASE_URL}/api/reviews/product/${productId}?${params}`)

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          const reviewsData = data.reviews.map((review: any) => ({
            ...review,
            createdAt: new Date(review.createdAt),
          }))
          setReviews(reviewsData)
          setStats(data.statistics)
          setTotalPages(data.pagination.totalPages)
        } else {
          toast.error("Failed to load reviews")
        }
      } else {
        toast.error("Failed to load reviews")
      }
    } catch (error) {
      console.error('Error loading reviews:', error)
      toast.error("Failed to load reviews")
    } finally {
      setIsLoading(false)
    }
  }

  const markHelpful = async (reviewId: string) => {
    if (!user || !token) {
      toast.error("Please sign in to mark reviews as helpful")
      return
    }

    if (helpfulClicks.has(reviewId)) {
      toast.error("You have already marked this review as helpful")
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/reviews/${reviewId}/helpful`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setHelpfulClicks(prev => new Set(prev).add(reviewId))
          // Update the review's helpful count locally
          setReviews(prev => prev.map(review => 
            review.reviewId === reviewId 
              ? { ...review, helpfulCount: review.helpfulCount + 1 }
              : review
          ))
          toast.success("Thank you for your feedback!")
        } else {
          toast.error(data.message || "Failed to mark as helpful")
        }
      } else {
        toast.error("Failed to mark as helpful")
      }
    } catch (error) {
      console.error('Error marking helpful:', error)
      toast.error("Failed to mark as helpful")
    }
  }

  const reportReview = async (reviewId: string) => {
    if (!user || !token) {
      toast.error("Please sign in to report reviews")
      return
    }

    if (reportedReviews.has(reviewId)) {
      toast.error("You have already reported this review")
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/reviews/${reviewId}/report`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reason: 'Inappropriate content',
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setReportedReviews(prev => new Set(prev).add(reviewId))
          toast.success("Review reported successfully")
        } else {
          toast.error(data.message || "Failed to report review")
        }
      } else {
        toast.error("Failed to report review")
      }
    } catch (error) {
      console.error('Error reporting review:', error)
      toast.error("Failed to report review")
    }
  }

  const renderStars = (rating: number, size: "sm" | "md" = "sm") => {
    const starSize = size === "sm" ? "w-4 h-4" : "w-5 h-5"
    
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${starSize} ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    )
  }

  const renderRatingDistribution = () => {
    if (!stats) return null

    return (
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((rating) => {
          const count = stats.ratingDistribution[rating] || 0
          const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0

          return (
            <div key={rating} className="flex items-center gap-2 text-sm">
              <span className="w-8">{rating}</span>
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-400 h-2 rounded-full"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="w-8 text-gray-600">{count}</span>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Review Statistics */}
      {stats && (
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Overall Rating */}
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  {stats.averageRating.toFixed(1)}
                </div>
                {renderStars(Math.round(stats.averageRating), "md")}
                <p className="text-sm text-gray-600 mt-2">
                  Based on {stats.totalReviews} review{stats.totalReviews !== 1 ? 's' : ''}
                </p>
              </div>

              {/* Rating Distribution */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Rating Breakdown</h4>
                {renderRatingDistribution()}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="highest">Highest Rated</SelectItem>
                <SelectItem value="lowest">Lowest Rated</SelectItem>
                <SelectItem value="helpful">Most Helpful</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {showWriteReview && onWriteReviewClick && (
          <Button onClick={onWriteReviewClick} className="bg-black text-white hover:bg-gray-800">
            Write a Review
          </Button>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading reviews...</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && reviews.length === 0 && (
        <div className="text-center py-8">
          <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
          <p className="text-gray-600 mb-4">Be the first to share your experience with this fragrance</p>
          {showWriteReview && onWriteReviewClick && (
            <Button onClick={onWriteReviewClick} className="bg-black text-white hover:bg-gray-800">
              Write the First Review
            </Button>
          )}
        </div>
      )}

      {/* Reviews List */}
      {!isLoading && reviews.length > 0 && (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Review Header */}
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {renderStars(review.rating)}
                        <span className="font-medium text-gray-900">{review.title}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {review.userName}
                        </div>
                        {review.isVerifiedPurchase && (
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Verified Purchase
                          </Badge>
                        )}
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {review.createdAt.toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Review Content */}
                  <div className="text-gray-700 leading-relaxed">
                    {review.comment}
                  </div>

                  {/* Review Actions */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markHelpful(review.reviewId)}
                        disabled={helpfulClicks.has(review.reviewId)}
                        className="text-gray-600 hover:text-gray-800"
                      >
                        <ThumbsUp className="w-4 h-4 mr-1" />
                        Helpful ({review.helpfulCount})
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => reportReview(review.reviewId)}
                        disabled={reportedReviews.has(review.reviewId)}
                        className="text-gray-600 hover:text-red-600"
                      >
                        <Flag className="w-4 h-4 mr-1" />
                        Report
                      </Button>
                    </div>

                    {helpfulClicks.has(review.reviewId) && (
                      <span className="text-sm text-green-600">Thank you for your feedback!</span>
                    )}

                    {reportedReviews.has(review.reviewId) && (
                      <span className="text-sm text-red-600">Reported</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>

              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

