"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Star, Send, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/contexts/auth-context"

interface ReviewFormProps {
  productId: string
  productName: string
  orderId?: string
  onReviewSubmitted?: () => void
  onCancel?: () => void
}

export function ReviewForm({
  productId,
  productName,
  orderId,
  onReviewSubmitted,
  onCancel,
}: ReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [title, setTitle] = useState("")
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const { user, token } = useAuth()
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (rating === 0) {
      newErrors.rating = "Please select a rating"
    }

    if (!title.trim()) {
      newErrors.title = "Please enter a review title"
    } else if (title.length < 3) {
      newErrors.title = "Title must be at least 3 characters long"
    } else if (title.length > 100) {
      newErrors.title = "Title must be less than 100 characters"
    }

    if (!comment.trim()) {
      newErrors.comment = "Please enter your review"
    } else if (comment.length < 10) {
      newErrors.comment = "Review must be at least 10 characters long"
    } else if (comment.length > 1000) {
      newErrors.comment = "Review must be less than 1000 characters"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user || !token) {
      toast.error("Please sign in to submit a review")
      return
    }

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`${API_BASE_URL}/api/reviews/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          rating,
          title: title.trim(),
          comment: comment.trim(),
          orderId,
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        toast.success("Review submitted successfully! It will be visible once approved.")
        
        // Reset form
        setRating(0)
        setTitle("")
        setComment("")
        setErrors({})

        // Notify parent component
        if (onReviewSubmitted) {
          onReviewSubmitted()
        }
      } else {
        toast.error(data.message || "Failed to submit review")
      }
    } catch (error) {
      console.error('Error submitting review:', error)
      toast.error("Failed to submit review")
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStars = () => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
            className="p-1 hover:scale-110 transition-transform"
          >
            <Star
              className={`w-6 h-6 ${
                star <= (hoveredRating || rating)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
        <span className="ml-2 text-sm text-gray-600">
          {rating > 0 && (
            <>
              {rating} star{rating !== 1 ? 's' : ''}
              {rating === 1 && ' - Poor'}
              {rating === 2 && ' - Fair'}
              {rating === 3 && ' - Good'}
              {rating === 4 && ' - Very Good'}
              {rating === 5 && ' - Excellent'}
            </>
          )}
        </span>
      </div>
    )
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="w-5 h-5" />
          Write a Review
        </CardTitle>
        <p className="text-sm text-gray-600">
          Share your experience with {productName}
        </p>
        {orderId && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This review is for a verified purchase (Order: {orderId})
            </AlertDescription>
          </Alert>
        )}
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating */}
          <div className="space-y-2">
            <Label>Rating *</Label>
            {renderStars()}
            {errors.rating && (
              <p className="text-sm text-red-600">{errors.rating}</p>
            )}
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Review Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Summarize your experience in a few words"
              className={errors.title ? 'border-red-300' : ''}
            />
            <p className="text-xs text-gray-500">
              {title.length}/100 characters
            </p>
            {errors.title && (
              <p className="text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="comment">Your Review *</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell others about your experience with this fragrance. What did you like or dislike? How was the longevity, sillage, and overall quality?"
              rows={6}
              className={errors.comment ? 'border-red-300' : ''}
            />
            <p className="text-xs text-gray-500">
              {comment.length}/1000 characters
            </p>
            {errors.comment && (
              <p className="text-sm text-red-600">{errors.comment}</p>
            )}
          </div>

          {/* Guidelines */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Review Guidelines:</strong>
              <ul className="mt-1 space-y-1 text-xs">
                <li>• Be honest and helpful to other customers</li>
                <li>• Focus on the product quality and your experience</li>
                <li>• Avoid inappropriate language or personal information</li>
                <li>• Reviews are moderated and may take 24-48 hours to appear</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-black text-white hover:bg-gray-800"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit Review
                </>
              )}
            </Button>

            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

