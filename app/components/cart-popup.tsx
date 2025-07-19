"use client"
import { useState } from "react"
import { Plus, Minus, ShoppingBag, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/contexts/cart-context"
import { toast } from "sonner"
import Link from "next/link"
import Image from "next/image"

interface CartPopupProps {
  isOpen: boolean
  onClose: () => void
}

export function CartPopup({ isOpen, onClose }: CartPopupProps) {
  const { state, updateQuantity, removeFromCart, clearCart } = useCart()
  const [isClearing, setIsClearing] = useState(false)

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(id)
    } else {
      updateQuantity(id, newQuantity)
    }
  }

  const handleClearCart = async () => {
    setIsClearing(true)
    try {
      clearCart()
      toast.success("Cart cleared")
    } catch (error) {
      toast.error("Failed to clear cart")
    } finally {
      setIsClearing(false)
    }
  }

  const handleCheckout = () => {
    onClose()
    // Navigate to checkout will be handled by the Link component
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="right" className="w-full sm:w-[400px] flex flex-col" aria-describedby="sheet-description">
        <SheetHeader className="space-y-2.5 pr-6">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Shopping Cart
            {state.itemCount > 0 && (
              <Badge variant="secondary" className="ml-auto">
                {state.itemCount} {state.itemCount === 1 ? "item" : "items"}
              </Badge>
            )}
          </SheetTitle>
          <SheetDescription id="sheet-description">
            {state.items.length === 0 
              ? "Your shopping cart is currently empty. Add products to continue shopping." 
              : `Review and manage the ${state.itemCount} ${state.itemCount === 1 ? 'item' : 'items'} in your cart before checkout.`
            }
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-auto py-4">
          {state.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingBag className="h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
              <p className="text-gray-500 mb-6">Add some products to get started</p>
              <Button onClick={onClose} className="bg-black text-white hover:bg-gray-800">
                Continue Shopping
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {state.items.map((item) => (
                <div key={item.id} className="flex gap-4 p-4 border rounded-lg">
                  <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm text-gray-900 line-clamp-2">{item.name}</h4>
                    {item.size && <p className="text-xs text-gray-500 mt-1">{item.size}</p>}

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">₹{item.price.toLocaleString()}</span>
                        {item.originalPrice && item.originalPrice > item.price && (
                          <span className="text-xs text-gray-400 line-through">
                            ₹{item.originalPrice.toLocaleString()}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6 bg-transparent"
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6 bg-transparent"
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-red-500 hover:text-red-700"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {state.items.length > 1 && (
                <div className="pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearCart}
                    disabled={isClearing}
                    className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 bg-transparent"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {isClearing ? "Clearing..." : "Clear Cart"}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {state.items.length > 0 && (
          <div className="border-t pt-4 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal ({state.itemCount} items)</span>
                <span>₹{state.total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>₹{state.total.toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Button asChild className="w-full bg-black text-white hover:bg-gray-800" onClick={handleCheckout}>
                <Link href="/checkout">Proceed to Checkout</Link>
              </Button>
              <Button variant="outline" onClick={onClose} className="w-full bg-transparent">
                Continue Shopping
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
