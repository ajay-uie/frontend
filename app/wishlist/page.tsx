"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Heart,
  ShoppingCart,
  Trash2,
  ArrowLeft,
  AlertCircle,
  Package,
  TrendingUp,
  TrendingDown,
  Star,
} from "lucide-react"
import Navigation from "../components/navigation"
import Footer from "../components/footer"
import { useAuth } from "@/contexts/auth-context"
import { useCart } from "@/contexts/cart-context"
import { toast } from "sonner"
import Link from "next/link"
import { AuthModal } from "@/components/auth/auth-modal"

interface WishlistItem {
  id: string
  wishlistId: string
  productId: string
  productName: string
  productBrand: string
  productPrice: number
  originalPrice: number
  productImage: string
  productSize: string
  isAvailable: boolean
  priceChanged: boolean
  addedAt: Date
}

export default function WishlistPage() {
  const router = useRouter()
  const { user, token } = useAuth()
  const { addItem } = useCart()

  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [removingItems, setRemovingItems] = useState<Set<string>>(new Set())
  const [movingToCart, setMovingToCart] = useState<Set<string>>(new Set())

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://backend-8npy.onrender.com'

  useEffect(() => {
    if (!user) {
      setShowAuthModal(true)
      setIsLoading(false)
      return
    }

    loadWishlist()
  }, [user, token])

  const loadWishlist = async () => {
    if (!user || !token) return

    setIsLoading(true)

    try {
      const response = await fetch(`${API_BASE_URL}/api/wishlist/list`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          const items = data.wishlist.map((item: any) => ({
            ...item,
            addedAt: new Date(item.addedAt),
          }))
          setWishlistItems(items)
        } else {
          toast.error(data.message || 'Failed to load wishlist')
        }
      } else {
        toast.error('Failed to load wishlist')
      }
    } catch (error) {
      console.error('Error loading wishlist:', error)
      toast.error('Failed to load wishlist')
    } finally {
      setIsLoading(false)
    }
  }

  const removeFromWishlist = async (productId: string) => {
    if (!user || !token) return

    setRemovingItems(prev => new Set(prev).add(productId))

    try {
      const response = await fetch(`${API_BASE_URL}/api/wishlist/remove/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setWishlistItems(prev => prev.filter(item => item.productId !== productId))
          toast.success('Removed from wishlist')
        } else {
          toast.error(data.message || 'Failed to remove from wishlist')
        }
      } else {
        toast.error('Failed to remove from wishlist')
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error)
      toast.error('Failed to remove from wishlist')
    } finally {
      setRemovingItems(prev => {
        const newSet = new Set(prev)
        newSet.delete(productId)
        return newSet
      })
    }
  }

  const moveToCart = async (item: WishlistItem) => {
    if (!user || !token) return

    setMovingToCart(prev => new Set(prev).add(item.productId))

    try {
      // Add to cart
      await addItem({
        id: item.productId,
        productId: item.productId,
        name: item.productName,
        brand: item.productBrand,
        price: item.productPrice,
        size: item.productSize,
        image: item.productImage,
        quantity: 1,
      })

      // Remove from wishlist
      await removeFromWishlist(item.productId)
    } catch (error) {
      console.error('Error moving to cart:', error)
      toast.error('Failed to move to cart')
    } finally {
      setMovingToCart(prev => {
        const newSet = new Set(prev)
        newSet.delete(item.productId)
        return newSet
      })
    }
  }

  const clearWishlist = async () => {
    if (!user || !token) return

    try {
      const response = await fetch(`${API_BASE_URL}/api/wishlist/clear`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setWishlistItems([])
          toast.success('Wishlist cleared')
        } else {
          toast.error(data.message || 'Failed to clear wishlist')
        }
      } else {
        toast.error('Failed to clear wishlist')
      }
    } catch (error) {
      console.error('Error clearing wishlist:', error)
      toast.error('Failed to clear wishlist')
    }
  }

  const handleAuthSuccess = () => {
    setShowAuthModal(false)
    // Reload page to fetch wishlist
    window.location.reload()
  }

  // Authentication required
  if (!user) {
    return (
      <>
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <div className="pt-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="text-center">
                <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Sign In Required</h1>
                <p className="text-gray-600 mb-6">Please sign in to view your wishlist.</p>
                <Button onClick={() => setShowAuthModal(true)} className="bg-black text-white hover:bg-gray-800">
                  Sign In to Continue
                </Button>
              </div>
            </div>
          </div>
        </div>
        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} onSuccess={handleAuthSuccess} />
      </>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Link href="/products">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Continue Shopping
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-light text-gray-900">My Wishlist</h1>
                <p className="text-sm text-gray-600">
                  {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved
                </p>
              </div>
            </div>

            {wishlistItems.length > 0 && (
              <Button
                variant="outline"
                onClick={clearWishlist}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            )}
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your wishlist...</p>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && wishlistItems.length === 0 && (
            <div className="text-center py-12">
              <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-medium text-gray-900 mb-2">Your wishlist is empty</h2>
              <p className="text-gray-600 mb-6">Save items you love to buy them later</p>
              <Link href="/products">
                <Button className="bg-black text-white hover:bg-gray-800">
                  <Package className="w-4 h-4 mr-2" />
                  Explore Products
                </Button>
              </Link>
            </div>
          )}

          {/* Wishlist Items */}
          {!isLoading && wishlistItems.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {wishlistItems.map((item) => (
                <Card key={item.id} className="group hover:shadow-lg transition-shadow duration-200">
                  <CardContent className="p-4">
                    {/* Product Image */}
                    <div className="relative mb-4">
                      <Link href={`/products/${item.productId}`}>
                        <img
                          src={item.productImage || '/placeholder.svg'}
                          alt={item.productName}
                          className="w-full h-48 object-cover rounded-lg cursor-pointer"
                        />
                      </Link>

                      {/* Availability Badge */}
                      <div className="absolute top-2 left-2">
                        {item.isAvailable ? (
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            In Stock
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-red-100 text-red-800">
                            Out of Stock
                          </Badge>
                        )}
                      </div>

                      {/* Price Change Indicator */}
                      {item.priceChanged && (
                        <div className="absolute top-2 right-2">
                          {item.productPrice < item.originalPrice ? (
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              <TrendingDown className="w-3 h-3 mr-1" />
                              Price Drop
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                              <TrendingUp className="w-3 h-3 mr-1" />
                              Price Rise
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Remove Button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFromWishlist(item.productId)}
                        disabled={removingItems.has(item.productId)}
                        className="absolute bottom-2 right-2 bg-white/80 hover:bg-white text-red-500 hover:text-red-600"
                      >
                        {removingItems.has(item.productId) ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                        ) : (
                          <Heart className="w-4 h-4 fill-current" />
                        )}
                      </Button>
                    </div>

                    {/* Product Info */}
                    <div className="space-y-2">
                      <Link href={`/products/${item.productId}`}>
                        <h3 className="font-medium text-gray-900 hover:text-gray-700 cursor-pointer line-clamp-2">
                          {item.productName}
                        </h3>
                      </Link>

                      {item.productBrand && (
                        <p className="text-sm text-gray-600">{item.productBrand}</p>
                      )}

                      <p className="text-xs text-gray-500">{item.productSize}</p>

                      {/* Price */}
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-semibold text-gray-900">
                          ₹{item.productPrice.toLocaleString()}
                        </span>
                        {item.priceChanged && item.originalPrice !== item.productPrice && (
                          <span className="text-sm text-gray-500 line-through">
                            ₹{item.originalPrice.toLocaleString()}
                          </span>
                        )}
                      </div>

                      {/* Added Date */}
                      <p className="text-xs text-gray-500">
                        Added {item.addedAt.toLocaleDateString()}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="mt-4 space-y-2">
                      {item.isAvailable ? (
                        <Button
                          onClick={() => moveToCart(item)}
                          disabled={movingToCart.has(item.productId)}
                          className="w-full bg-black text-white hover:bg-gray-800"
                        >
                          {movingToCart.has(item.productId) ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Moving to Cart...
                            </>
                          ) : (
                            <>
                              <ShoppingCart className="w-4 h-4 mr-2" />
                              Move to Cart
                            </>
                          )}
                        </Button>
                      ) : (
                        <Button disabled className="w-full">
                          <AlertCircle className="w-4 h-4 mr-2" />
                          Out of Stock
                        </Button>
                      )}
                    </div>

                    {/* Price Change Alert */}
                    {item.priceChanged && (
                      <Alert className="mt-3">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-xs">
                          {item.productPrice < item.originalPrice
                            ? `Price dropped by ₹${(item.originalPrice - item.productPrice).toLocaleString()}`
                            : `Price increased by ₹${(item.productPrice - item.originalPrice).toLocaleString()}`}
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Recommendations */}
          {!isLoading && wishlistItems.length > 0 && (
            <div className="mt-12">
              <h2 className="text-xl font-medium text-gray-900 mb-6">You might also like</h2>
              <div className="text-center py-8 text-gray-500">
                <Star className="w-8 h-8 mx-auto mb-2" />
                <p>Personalized recommendations coming soon</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}

