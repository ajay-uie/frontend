"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  ArrowLeft,
  Heart,
  Share2,
  Gift,
  Truck,
  Shield,
  RotateCcw,
  CheckCircle,
  Star,
} from "lucide-react"
import Navigation from "../components/navigation"
import Footer from "../components/footer"
import { useCart } from "@/contexts/cart-context"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"

export default function CartPage() {
  const router = useRouter()
  const { items, updateQuantity, removeFromCart, total, clearCart } = useCart()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [promoCode, setPromoCode] = useState("")
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount: number } | null>(null)

  // Calculate totals
  const subtotal = total
  const discount = appliedPromo?.discount || 0
  const shipping = subtotal > 2000 ? 0 : 99 // Free shipping above ₹2000
  const gst = Math.round(((subtotal - discount) * 18) / 100) // 18% GST
  const finalTotal = subtotal - discount + shipping + gst

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return

    setIsLoading(true)
    try {
      await updateQuantity(itemId, newQuantity)
      toast.success("Cart updated")
    } catch (error) {
      toast.error("Failed to update cart")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveItem = async (itemId: string) => {
    setIsLoading(true)
    try {
      await removeFromCart(itemId)
      toast.success("Item removed from cart")
    } catch (error) {
      toast.error("Failed to remove item")
    } finally {
      setIsLoading(false)
    }
  }

  const handleApplyPromo = async () => {
  if (!promoCode.trim()) {
    toast.error("Please enter a promo code")
    return
  }

  try {
    const response = await fetch("/coupons")
    const data = await response.json()
    const promoCodes: Record<string, number> = data.coupons.reduce((acc: Record<string, number>, coupon: any) => {
      acc[coupon.code.toUpperCase()] = coupon.discountValue
      return acc
    }, {})

    const discountPercent = promoCodes[promoCode.toUpperCase()]
    if (discountPercent) {
      const discountAmount =
        discountPercent <= 100 ? (subtotal * discountPercent) / 100 : discountPercent
      setAppliedPromo({
        code: promoCode.toUpperCase(),
        discount: Math.min(discountAmount, subtotal),
      })
      setPromoCode("")
      toast.success(`Promo code applied! You saved ₹${Math.min(discountAmount, subtotal)}`)
    } else {
      toast.error("Invalid promo code")
    }
  } catch (error) {
    console.error("Error applying promo code:", error)
    toast.error("Failed to apply promo code. Please try again later.")
  }
}

  const handleRemovePromo = () => {
    setAppliedPromo(null)
    toast.success("Promo code removed")
  }

  const handleCheckout = () => {
    if (!user) {
      toast.error("Please sign in to continue")
      router.push("/auth?redirect=/checkout")
      return
    }

    if (items.length === 0) {
      toast.error("Your cart is empty")
      return
    }

    router.push("/checkout")
  }

  const handleContinueShopping = () => {
    router.push("/products")
  }

  const handleClearCart = () => {
    if (window.confirm("Are you sure you want to clear your cart?")) {
      clearCart()
      toast.success("Cart cleared")
    }
  }

  // Empty cart state
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />

        <div className="pt-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-6" />
              <h1 className="text-3xl font-light text-gray-900 mb-4">Your cart is empty</h1>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Looks like you haven't added any items to your cart yet. Start exploring our collection of luxury
                fragrances.
              </p>

              <div className="space-y-4">
                <Button onClick={handleContinueShopping} className="bg-black text-white hover:bg-gray-800 px-8 py-3">
                  Continue Shopping
                </Button>

                <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4" />
                    <span>Free shipping above ₹2000</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    <span>Secure payments</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <RotateCcw className="w-4 h-4" />
                    <span>Easy returns</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-light text-gray-900">Shopping Cart</h1>
              <p className="text-gray-600 mt-1">
                {items.length} item{items.length !== 1 ? "s" : ""} in your cart
              </p>
            </div>

            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={handleContinueShopping}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Continue Shopping
              </Button>
              <Button
                variant="outline"
                onClick={handleClearCart}
                className="text-red-600 hover:text-red-700 bg-transparent"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear Cart
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <Card key={`${item.id}-${item.size}`} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-6">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <img
                          src={item.image || "/placeholder.svg?height=120&width=120"}
                          alt={item.name}
                          className="w-24 h-24 object-cover rounded-lg"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-1">{item.name}</h3>
                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                              <span>Size: {item.size}</span>
                              <Badge variant="secondary">In Stock</Badge>
                            </div>

                            {/* Product Features */}
                            <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                              <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                <span>4.8 (124 reviews)</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Gift className="w-3 h-3" />
                                <span>Gift wrapping available</span>
                              </div>
                            </div>

                            {/* Price */}
                            <div className="flex items-center gap-2 mb-4">
                              <span className="text-xl font-semibold text-gray-900">
                                ₹{item.price.toLocaleString()}
                              </span>
                              {item.originalPrice && item.originalPrice > item.price && (
                                <span className="text-sm text-gray-500 line-through">
                                  ₹{item.originalPrice.toLocaleString()}
                                </span>
                              )}
                            </div>

                            {/* Quantity Controls */}
                            <div className="flex items-center gap-3">
                              <div className="flex items-center border border-gray-300 rounded-lg">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                  disabled={item.quantity <= 1 || isLoading}
                                  className="h-8 w-8 p-0"
                                >
                                  <Minus className="w-3 h-3" />
                                </Button>
                                <span className="px-3 py-1 text-sm font-medium min-w-[2rem] text-center">
                                  {item.quantity}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                  disabled={isLoading}
                                  className="h-8 w-8 p-0"
                                >
                                  <Plus className="w-3 h-3" />
                                </Button>
                              </div>

                              <span className="text-sm text-gray-600">
                                Total: ₹{(item.price * item.quantity).toLocaleString()}
                              </span>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-red-600">
                              <Heart className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-gray-500">
                              <Share2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveItem(item.id)}
                              disabled={isLoading}
                              className="text-gray-500 hover:text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Shipping Info */}
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  {subtotal >= 2000 ? (
                    <span>🎉 Congratulations! You qualify for free shipping.</span>
                  ) : (
                    <span>Add ₹{(2000 - subtotal).toLocaleString()} more to qualify for free shipping.</span>
                  )}
                </AlertDescription>
              </Alert>
            </div>

            {/* Order Summary */}
            <div className="space-y-6">
              {/* Promo Code */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Promo Code</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {appliedPromo ? (
                    <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div>
                        <p className="font-medium text-green-800">{appliedPromo.code}</p>
                        <p className="text-sm text-green-600">-₹{appliedPromo.discount.toLocaleString()}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRemovePromo}
                        className="text-green-600 hover:text-green-800"
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Enter promo code"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                          onKeyPress={(e) => e.key === "Enter" && handleApplyPromo()}
                        />
                        <Button onClick={handleApplyPromo} size="sm">
                          Apply
                        </Button>
                      </div>

                      <div className="text-xs text-gray-500">
                        <p>Apply a valid promo code to get discount.</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Order Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal ({items.length} items)</span>
                      <span>₹{subtotal.toLocaleString()}</span>
                    </div>

                    {discount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Discount</span>
                        <span>-₹{discount.toLocaleString()}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-sm">
                      <span>Shipping</span>
                      <span>{shipping === 0 ? "FREE" : `₹${shipping}`}</span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span>GST (18%)</span>
                      <span>₹{gst.toLocaleString()}</span>
                    </div>

                    <Separator />

                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total</span>
                      <span>₹{finalTotal.toLocaleString()}</span>
                    </div>

                    {discount > 0 && (
                      <div className="text-sm text-green-600 text-center">You saved ₹{discount.toLocaleString()}!</div>
                    )}
                  </div>

                  {/* Checkout Button */}
                  <Button
                    onClick={handleCheckout}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-black to-gray-800 text-white hover:from-gray-800 hover:to-black transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl py-4 text-lg font-medium"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Processing...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="w-5 h-5" />
                        Proceed to Checkout • ₹{finalTotal.toLocaleString()}
                      </div>
                    )}
                  </Button>

                  {/* Security Features */}
                  <div className="space-y-2 pt-4 border-t">
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <Shield className="w-3 h-3" />
                      <span>Secure 256-bit SSL encryption</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <RotateCcw className="w-3 h-3" />
                      <span>30-day return policy</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <Truck className="w-3 h-3" />
                      <span>Free shipping on orders above ₹2000</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Methods */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">We Accept</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <span>💳 Cards</span>
                    <span>📱 UPI</span>
                    <span>🏦 Net Banking</span>
                    <span>💰 COD</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}


