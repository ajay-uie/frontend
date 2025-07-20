"use client"

import type React from "react"
import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Star, Heart, ShoppingBag, Eye, Share2 } from "lucide-react"
import { useCart } from "@/contexts/cart-context"
import { useAuth } from "@/contexts/auth-context"
import { useWishlist } from "@/lib/wishlist-service"
import logger from "@/utils/logger"
import { motion } from "framer-motion"
import { toast } from "sonner"

interface Product {
  id: string
  name: string
  price: number
  originalPrice?: number
  image: string
  rating: number
  reviews: number
  discount?: number
  category: string
  brand: string
  description: string
  notes?: {
    top: string[]
    middle: string[]
    base: string[]
  }
}

interface ProductCardProps {
  product: Product
  onAddToCart: () => void
  isAddingToCart?: boolean
  className?: string
}

export default function ProductCard({
  product,
  onAddToCart,
  isAddingToCart = false,
  className = "",
}: ProductCardProps) {
  const { addToCart } = useCart()
  const { user } = useAuth()
  const { wishlist, add: addToWishlist, remove: removeFromWishlist } = useWishlist(user?.id)
  const [isHovered, setIsHovered] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)
  const [imageError, setImageError] = useState(false)

  const isInWishlist = wishlist.some((item) => item.productId === product.id)
  const discountPercentage = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : product.discount || 0

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!user) {
      toast.error("Please login to manage wishlist")
      return
    }

    try {
      if (isInWishlist) {
        await removeFromWishlist(product.id)
        toast.success("Removed from wishlist")
        logger.userAction("wishlist_remove", { productId: product.id }, "ProductCard")
      } else {
        await addToWishlist(product.id)
        toast.success("Added to wishlist")
        logger.userAction("wishlist_add", { productId: product.id }, "ProductCard")
      }
    } catch (error) {
      toast.error("Failed to update wishlist")
      logger.error("Wishlist toggle failed", error, "ProductCard")
    }
  }

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const shareData = {
      title: product.name,
      text: `Check out this amazing fragrance: ${product.name}`,
      url: `${window.location.origin}/product/${product.id}`,
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
        logger.userAction("product_share_native", { productId: product.id }, "ProductCard")
      } else {
        await navigator.clipboard.writeText(shareData.url)
        toast.success("Product link copied to clipboard!")
        logger.userAction("product_share_clipboard", { productId: product.id }, "ProductCard")
      }
    } catch (error) {
      logger.error("Share failed", error, "ProductCard")
    }
  }

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // TODO: Implement quick view modal
    logger.userAction("product_quick_view", { productId: product.id }, "ProductCard")
  }

  return (
    <motion.div
      className={`group ${className}`}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-white">
        <div className="relative">
          {/* Product Image */}
          <div className="aspect-square relative overflow-hidden bg-gray-100">
            <Link href={`/product/${product.id}`}>
              {!imageError ? (
                <Image
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  fill
                  className={`object-cover transition-all duration-500 group-hover:scale-110 ${
                    imageLoading ? "opacity-0" : "opacity-100"
                  }`}
                  onLoad={() => setImageLoading(false)}
                  onError={() => {
                    setImageError(true)
                    setImageLoading(false)
                  }}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                  <div className="text-center text-gray-500">
                    <div className="text-4xl mb-2">🌸</div>
                    <p className="text-sm">Image not available</p>
                  </div>
                </div>
              )}
            </Link>

            {/* Loading Skeleton */}
            {imageLoading && !imageError && <div className="absolute inset-0 bg-gray-200 animate-pulse" />}

            {/* Discount Badge */}
            {discountPercentage > 0 && (
              <Badge className="absolute top-3 left-3 bg-red-500 text-white font-medium">
                {discountPercentage}% OFF
              </Badge>
            )}

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 20 }}
              transition={{ duration: 0.2 }}
              className="absolute top-3 right-3 flex flex-col gap-2"
            >
              <Button
                size="icon"
                variant="secondary"
                className="w-8 h-8 bg-white/90 hover:bg-white shadow-lg"
                onClick={handleWishlistToggle}
                disabled={!user}
              >
                <Heart className={`w-4 h-4 ${isInWishlist ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
              </Button>
              <Button
                size="icon"
                variant="secondary"
                className="w-8 h-8 bg-white/90 hover:bg-white shadow-lg"
                onClick={handleQuickView}
              >
                <Eye className="w-4 h-4 text-gray-600" />
              </Button>
              <Button
                size="icon"
                variant="secondary"
                className="w-8 h-8 bg-white/90 hover:bg-white shadow-lg"
                onClick={handleShare}
              >
                <Share2 className="w-4 h-4 text-gray-600" />
              </Button>
            </motion.div>

            {/* Quick Add to Cart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 20 }}
              transition={{ duration: 0.2, delay: 0.1 }}
              className="absolute bottom-3 left-3 right-3"
            >
              <Button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onAddToCart()
                }}
                disabled={isAddingToCart || !user}
                className="w-full bg-black text-white hover:bg-gray-800 shadow-lg"
                size="sm"
              >
                <ShoppingBag className="w-4 h-4 mr-2" />
                {isAddingToCart ? "Adding..." : "Add to Cart"}
              </Button>
            </motion.div>
          </div>

          {/* Product Info */}
          <CardContent className="p-4 space-y-3">
            {/* Brand & Category */}
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span className="font-medium">{product.brand}</span>
              <span>{product.category}</span>
            </div>

            {/* Product Name */}
            <Link href={`/product/${product.id}`}>
              <h3 className="font-medium text-gray-900 line-clamp-2 hover:text-gray-700 transition-colors">
                {product.name}
              </h3>
            </Link>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${
                      i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">
                {product.rating} ({product.reviews})
              </span>
            </div>

            {/* Fragrance Notes Preview */}
            {product.notes && (
              <div className="text-xs text-gray-500">
                <span className="font-medium">Top:</span> {product.notes.top.slice(0, 2).join(", ")}
                {product.notes.top.length > 2 && "..."}
              </div>
            )}

            {/* Price */}
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-gray-900">₹{product.price.toLocaleString()}</span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-sm text-gray-500 line-through">₹{product.originalPrice.toLocaleString()}</span>
              )}
            </div>

            {/* Mobile Add to Cart Button */}
            <div className="block sm:hidden pt-2">
              <Button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onAddToCart()
                }}
                disabled={isAddingToCart || !user}
                className="w-full bg-black text-white hover:bg-gray-800"
                size="sm"
              >
                <ShoppingBag className="w-4 h-4 mr-2" />
                {isAddingToCart ? "Adding..." : "Add to Cart"}
              </Button>
            </div>
          </CardContent>
        </div>
      </Card>
    </motion.div>
  )
}
