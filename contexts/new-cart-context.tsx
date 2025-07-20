"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { newBackendApi } from "@/lib/new-backend-api"
import type { Cart, CartItem, CartStats } from "@/lib/api-types"
import { useAuth } from "./new-auth-context"

interface CartContextType {
  cart: Cart | null
  loading: boolean
  error: string | null

  // Cart actions
  addToCart: (
    productId: string,
    quantity?: number,
    size?: string,
    variant?: string,
  ) => Promise<{ success: boolean; error?: string }>
  updateCartItem: (itemId: string, quantity: number) => Promise<{ success: boolean; error?: string }>
  removeFromCart: (itemId: string) => Promise<{ success: boolean; error?: string }>
  clearCart: () => Promise<{ success: boolean; error?: string }>
  syncCart: () => Promise<{ success: boolean; error?: string }>

  // Cart utilities
  getCartItemCount: () => number
  getCartTotal: () => number
  getCartSubtotal: () => number
  getCartTax: () => number
  getCartShipping: () => number
  isInCart: (productId: string) => boolean
  getCartItem: (productId: string) => CartItem | null
  refreshCart: () => Promise<void>
  getCartStats: () => Promise<CartStats | null>
  clearError: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { isAuthenticated, user } = useAuth()

  // Initialize cart when user authentication changes
  useEffect(() => {
    const initializeCart = async () => {
      if (isAuthenticated && user) {
        await fetchCart()
      } else {
        // Clear cart when user logs out
        setCart(null)
        setError(null)
      }
    }

    initializeCart()
  }, [isAuthenticated, user])

  // Clear error function
  const clearError = () => {
    setError(null)
  }

  // Fetch cart from backend
  const fetchCart = async (): Promise<void> => {
    if (!isAuthenticated) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      console.log("🛒 Fetching cart...")
      const response = await newBackendApi.getCart()

      if (response.success) {
        setCart(response.data?.cart || null)
        console.log("✅ Cart fetched successfully")
      } else {
        const errorMessage = response.error || "Failed to fetch cart"
        setError(errorMessage)
        console.log("❌ Failed to fetch cart:", errorMessage)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch cart"
      setError(errorMessage)
      console.error("❌ Cart fetch error:", err)
    } finally {
      setLoading(false)
    }
  }

  // Add item to cart
  const addToCart = async (
    productId: string,
    quantity = 1,
    size?: string,
    variant?: string,
  ): Promise<{ success: boolean; error?: string }> => {
    if (!isAuthenticated) {
      return { success: false, error: "Please sign in to add items to cart" }
    }

    setLoading(true)
    setError(null)

    try {
      console.log("🛒 Adding to cart:", { productId, quantity, size, variant })
      const response = await newBackendApi.addToCart(productId, quantity, size, variant)

      if (response.success && response.data?.cartItem) {
        // Refresh cart after adding item
        await fetchCart()
        console.log("✅ Item added to cart successfully")
        return { success: true }
      } else {
        const errorMessage = response.error || "Failed to add item to cart"
        setError(errorMessage)
        console.log("❌ Failed to add to cart:", errorMessage)
        return { success: false, error: errorMessage }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to add item to cart"
      setError(errorMessage)
      console.error("❌ Add to cart error:", err)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Update cart item quantity
  const updateCartItem = async (itemId: string, quantity: number): Promise<{ success: boolean; error?: string }> => {
    if (!isAuthenticated) {
      return { success: false, error: "Please sign in to update cart items" }
    }

    if (quantity < 1) {
      return { success: false, error: "Quantity must be at least 1" }
    }

    setLoading(true)
    setError(null)

    try {
      console.log("🛒 Updating cart item:", { itemId, quantity })
      const response = await newBackendApi.updateCartItem(itemId, quantity)

      if (response.success) {
        // Refresh cart after updating item
        await fetchCart()
        console.log("✅ Cart item updated successfully")
        return { success: true }
      } else {
        const errorMessage = response.error || "Failed to update cart item"
        setError(errorMessage)
        console.log("❌ Failed to update cart item:", errorMessage)
        return { success: false, error: errorMessage }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update cart item"
      setError(errorMessage)
      console.error("❌ Update cart item error:", err)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Remove item from cart
  const removeFromCart = async (itemId: string): Promise<{ success: boolean; error?: string }> => {
    if (!isAuthenticated) {
      return { success: false, error: "Please sign in to remove items from cart" }
    }

    setLoading(true)
    setError(null)

    try {
      console.log("🛒 Removing from cart:", itemId)
      const response = await newBackendApi.removeFromCart(itemId)

      if (response.success) {
        // Refresh cart after removing item
        await fetchCart()
        console.log("✅ Item removed from cart successfully")
        return { success: true }
      } else {
        const errorMessage = response.error || "Failed to remove item from cart"
        setError(errorMessage)
        console.log("❌ Failed to remove from cart:", errorMessage)
        return { success: false, error: errorMessage }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to remove item from cart"
      setError(errorMessage)
      console.error("❌ Remove from cart error:", err)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Clear entire cart
  const clearCart = async (): Promise<{ success: boolean; error?: string }> => {
    if (!isAuthenticated) {
      return { success: false, error: "Please sign in to clear cart" }
    }

    setLoading(true)
    setError(null)

    try {
      console.log("🛒 Clearing cart...")
      const response = await newBackendApi.clearCart()

      if (response.success) {
        setCart(null)
        console.log("✅ Cart cleared successfully")
        return { success: true }
      } else {
        const errorMessage = response.error || "Failed to clear cart"
        setError(errorMessage)
        console.log("❌ Failed to clear cart:", errorMessage)
        return { success: false, error: errorMessage }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to clear cart"
      setError(errorMessage)
      console.error("❌ Clear cart error:", err)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Sync cart with server
  const syncCart = async (): Promise<{ success: boolean; error?: string }> => {
    if (!isAuthenticated) {
      return { success: false, error: "Please sign in to sync cart" }
    }

    setLoading(true)
    setError(null)

    try {
      console.log("🛒 Syncing cart...")
      const response = await newBackendApi.syncCart(cart?.items || [])

      if (response.success) {
        // Refresh cart after syncing
        await fetchCart()
        console.log("✅ Cart synced successfully")
        return { success: true }
      } else {
        const errorMessage = response.error || "Failed to sync cart"
        setError(errorMessage)
        console.log("❌ Failed to sync cart:", errorMessage)
        return { success: false, error: errorMessage }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to sync cart"
      setError(errorMessage)
      console.error("❌ Sync cart error:", err)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Get total number of items in cart
  const getCartItemCount = (): number => {
    if (!cart || !cart.items) {
      return 0
    }
    return cart.items.reduce((total, item) => total + item.quantity, 0)
  }

  // Get cart total (including tax and shipping)
  const getCartTotal = (): number => {
    if (!cart) {
      return 0
    }
    return cart.total || 0
  }

  // Get cart subtotal (before tax and shipping)
  const getCartSubtotal = (): number => {
    if (!cart) {
      return 0
    }
    return cart.subtotal || 0
  }

  // Get cart tax amount
  const getCartTax = (): number => {
    if (!cart) {
      return 0
    }
    return cart.tax || 0
  }

  // Get cart shipping amount
  const getCartShipping = (): number => {
    if (!cart) {
      return 0
    }
    return cart.shipping || 0
  }

  // Check if product is in cart
  const isInCart = (productId: string): boolean => {
    if (!cart || !cart.items) {
      return false
    }
    return cart.items.some((item) => item.productId === productId)
  }

  // Get specific cart item
  const getCartItem = (productId: string): CartItem | null => {
    if (!cart || !cart.items) {
      return null
    }
    return cart.items.find((item) => item.productId === productId) || null
  }

  // Refresh cart data
  const refreshCart = async (): Promise<void> => {
    await fetchCart()
  }

  // Get cart statistics
  const getCartStats = async (): Promise<CartStats | null> => {
    if (!isAuthenticated) {
      return null
    }

    try {
      console.log("🛒 Fetching cart stats...")
      const response = await newBackendApi.getCartStats()

      if (response.success && response.data?.stats) {
        console.log("✅ Cart stats fetched successfully")
        return response.data.stats
      } else {
        console.log("❌ Failed to fetch cart stats:", response.error)
        return null
      }
    } catch (err) {
      console.error("❌ Cart stats error:", err)
      return null
    }
  }

  const contextValue: CartContextType = {
    cart,
    loading,
    error,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    syncCart,
    getCartItemCount,
    getCartTotal,
    getCartSubtotal,
    getCartTax,
    getCartShipping,
    isInCart,
    getCartItem,
    refreshCart,
    getCartStats,
    clearError,
  }

  return <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>
}

// Custom hook to use the cart context
export function useCart(): CartContextType {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}

// Export the context for advanced usage
export { CartContext }
