# Read the file
with open('/home/ubuntu/fragransia-frontend/fragransia-website/lib/review-service.ts', 'r') as f:
    content = f.read()

# Add null checks for all Firebase operations
replacements = [
    ('async getReviewStats(productId: string): Promise<ReviewStats> {', 
     'async getReviewStats(productId: string): Promise<ReviewStats> {\n    if (!db) {\n      return { averageRating: 0, totalReviews: 0, ratingDistribution: {} }\n    }'),
    ('async getReviews(productId: string, limitCount = 10): Promise<Review[]> {',
     'async getReviews(productId: string, limitCount = 10): Promise<Review[]> {\n    if (!db) {\n      return []\n    }'),
    ('async updateReview(reviewId: string, updates: Partial<Review>): Promise<void> {',
     'async updateReview(reviewId: string, updates: Partial<Review>): Promise<void> {\n    if (!db) {\n      console.warn("Firebase not available, skipping review update")\n      return\n    }'),
    ('async deleteReview(reviewId: string): Promise<void> {',
     'async deleteReview(reviewId: string): Promise<void> {\n    if (!db) {\n      console.warn("Firebase not available, skipping review delete")\n      return\n    }'),
    ('async markReviewHelpful(reviewId: string, userId: string, helpful: boolean): Promise<void> {',
     'async markReviewHelpful(reviewId: string, userId: string, helpful: boolean): Promise<void> {\n    if (!db) {\n      console.warn("Firebase not available, skipping helpful vote")\n      return\n    }'),
]

for old, new in replacements:
    content = content.replace(old, new)

# Write back
with open('/home/ubuntu/fragransia-frontend/fragransia-website/lib/review-service.ts', 'w') as f:
    f.write(content)

print("Review service fixed!")
