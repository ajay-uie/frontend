"use client"

import type React from "react"
import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ShoppingCart, Star } from "lucide-react"
import { useCart } from "@/contexts/cart-context"
import { useAuth } from "@/contexts/auth-context"
import { WishlistButton } from "@/components/wishlist/wishlist-button"
import { toast } from "sonner"
import type { Product } from "@/lib/api"

interface ProductCardProps {
  product: Product
  viewMode?: "grid" | "list"
  className?: string
}

export default function ProductCard({ product, viewMode = "grid", className = "" }: ProductCardProps) {
  const { addToCart } = useCart()
  const { user } = useAuth()
  const [isAddingToCart, setIsAddingToCart] = useState(false)

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (product.stock === 0) {
      toast.error("Product is out of stock")
      return
    }

    setIsAddingToCart(true)
    console.log("Attempting to add to cart:", product)
    try {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice,
        image: product.image,
        size: product.size || "100ml",
        quantity: 1,
      })
      toast.success("Added to cart!")
    } catch (error) {
      console.error("Add to cart error:", error)
      toast.error("Failed to add to cart")
    } finally {
      setIsAddingToCart(false)
    }
  }

  const discountPercentage = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : product.discount

  const isOutOfStock = product.stock === 0

  if (viewMode === "list") {
    return (
      <Link href={`/product/${product.id}`}>
        <Card className={`group cursor-pointer transition-all duration-300 hover:shadow-lg ${className}`}>
          <CardContent className="p-4">
            <div className="flex gap-4">
              <div className="relative w-32 h-32 flex-shrink-0 bg-gray-50 rounded-lg overflow-hidden">
                <Image
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="128px"
                />
                {discountPercentage && discountPercentage > 0 && (
                  <Badge className="absolute top-2 left-2 bg-red-500 text-white text-xs">-{discountPercentage}%</Badge>
                )}
                {isOutOfStock && (
                  <Badge className="absolute top-2 right-2 bg-gray-500 text-white text-xs">Out of Stock</Badge>
                )}
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <Badge variant="outline" className="text-xs capitalize mb-2">
                      {product.category}
                    </Badge>
                    <h3 className="font-semibold text-lg text-gray-900 group-hover:text-gray-700">{product.name}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                  </div>
                  <WishlistButton
                    productId={product.id}
                    productName={product.name}
                    productPrice={product.price}
                    productImage={product.image}
                    productCategory={product.category}
                    size="sm"
                  />
                </div>

                {product.rating && (
                  <div className="flex items-center gap-1">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${
                            i < Math.floor(product.rating!) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500">({product.reviews || 0})</span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xl text-gray-900">₹{product.price.toLocaleString()}</span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="text-sm text-gray-500 line-through">
                        ₹{product.originalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <Button onClick={handleAddToCart} disabled={isAddingToCart || isOutOfStock} size="sm">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {isOutOfStock ? "Out of Stock" : isAddingToCart ? "Adding..." : "Add to Cart"}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    )
  }

  return (
    <Link href={`/product/${product.id}`}>
      <Card className={`group cursor-pointer transition-all duration-300 hover:shadow-lg ${className}`}>
        <div className="relative aspect-square overflow-hidden bg-gray-50 rounded-t-lg">
          <Image
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {discountPercentage && discountPercentage > 0 && (
              <Badge className="bg-red-500 text-white text-xs">-{discountPercentage}%</Badge>
            )}
            {isOutOfStock && <Badge className="bg-gray-500 text-white text-xs">Out of Stock</Badge>}
          </div>

          {/* Wishlist Button */}
          <div className="absolute top-2 right-2">
            <WishlistButton
              productId={product.id}
              productName={product.name}
              productPrice={product.price}
              productImage={product.image}
              productCategory={product.category}
              size="sm"
            />
          </div>
        </div>

        <CardContent className="p-4">
          {/* Category */}
          <Badge variant="outline" className="mb-2 text-xs capitalize">
            {product.category}
          </Badge>

          {/* Product Name */}
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-gray-700 transition-colors">
            {product.name}
          </h3>

          {/* Rating */}
          {product.rating && (
            <div className="flex items-center gap-1 mb-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 ${
                      i < Math.floor(product.rating!) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500">({product.reviews || 0})</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-2 mb-3">
            <span className="font-bold text-lg text-gray-900">₹{product.price.toLocaleString()}</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-sm text-gray-500 line-through">₹{product.originalPrice.toLocaleString()}</span>
            )}
          </div>

          {/* Stock Status */}
          {product.stock !== undefined && (
            <div className="text-xs text-gray-500 mb-2">
              {product.stock > 0 ? (
                product.stock < 10 ? (
                  <span className="text-orange-600">Only {product.stock} left</span>
                ) : (
                  <span className="text-green-600">In stock</span>
                )
              ) : (
                <span className="text-red-600">Out of stock</span>
              )}
            </div>
          )}

          {/* Add to Cart Button */}
          <Button
            className="w-full"
            onClick={handleAddToCart}
            disabled={isAddingToCart || isOutOfStock}
            variant={isOutOfStock ? "outline" : "default"}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            {isOutOfStock ? "Out of Stock" : isAddingToCart ? "Adding..." : "Add to Cart"}
          </Button>
        </CardContent>
      </Card>
    </Link>
  )
}
