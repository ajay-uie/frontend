"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { newBackendApi } from "@/lib/new-backend-api"
import type { Wishlist, WishlistStats } from "@/lib/api-types"
import { useAuth } from "./new-auth-context"

interface WishlistContextType {
  wishlist: Wishlist | null
  loading: boolean
  error: string | null

  // Wishlist actions
  addToWishlist: (productId: string) => Promise<{ success: boolean; error?: string }>
  removeFromWishlist: (productId: string) => Promise<{ success: boolean; error?: string }>
  clearWishlist: () => Promise<{ success: boolean; error?: string }>
  moveToCart: (productId: string, quantity?: number) => Promise<{ success: boolean; error?: string }>
  checkWishlist: (productId: string) => Promise<{ isInWishlist: boolean; addedAt: Date | null }>

  // Wishlist utilities
  isInWishlist: (productId: string) => boolean
  getWishlistItemCount: () => number
  getWishlistValue: () => number
  refreshWishlist: () => Promise<void>
  getWishlistStats: () => Promise<WishlistStats | null>
  clearError: () => void
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlist, setWishlist] = useState<Wishlist | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { isAuthenticated, user } = useAuth()

  // Initialize wishlist when user authentication changes
  useEffect(() => {
    const initializeWishlist = async () => {
      if (isAuthenticated && user) {
        await fetchWishlist()
      } else {
        // Clear wishlist when user logs out
        setWishlist(null)
        setError(null)
      }
    }

    initializeWishlist()
  }, [isAuthenticated, user])

  // Clear error function
  const clearError = () => {
    setError(null)
  }

  // Fetch wishlist from backend
  const fetchWishlist = async (): Promise<void> => {
    if (!isAuthenticated) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      console.log("❤️ Fetching wishlist...")
      const response = await newBackendApi.getWishlist()

      if (response.success) {
        setWishlist(response.data?.wishlist || null)
        console.log("✅ Wishlist fetched successfully")
      } else {
        const errorMessage = response.error || "Failed to fetch wishlist"
        setError(errorMessage)
        console.log("❌ Failed to fetch wishlist:", errorMessage)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch wishlist"
      setError(errorMessage)
      console.error("❌ Wishlist fetch error:", err)
    } finally {
      setLoading(false)
    }
  }

  // Add item to wishlist
  const addToWishlist = async (productId: string): Promise<{ success: boolean; error?: string }> => {
    if (!isAuthenticated) {
      return { success: false, error: "Please sign in to add items to wishlist" }
    }

    setLoading(true)
    setError(null)

    try {
      console.log("❤️ Adding to wishlist:", productId)
      const response = await newBackendApi.addToWishlist(productId)

      if (response.success && response.data?.wishlist) {
        setWishlist(response.data.wishlist)
        console.log("✅ Item added to wishlist successfully")
        return { success: true }
      } else {
        const errorMessage = response.error || "Failed to add item to wishlist"
        setError(errorMessage)
        console.log("❌ Failed to add to wishlist:", errorMessage)
        return { success: false, error: errorMessage }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to add item to wishlist"
      setError(errorMessage)
      console.error("❌ Add to wishlist error:", err)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Remove item from wishlist
  const removeFromWishlist = async (productId: string): Promise<{ success: boolean; error?: string }> => {
    if (!isAuthenticated) {
      return { success: false, error: "Please sign in to remove items from wishlist" }
    }

    setLoading(true)
    setError(null)

    try {
      console.log("❤️ Removing from wishlist:", productId)
      const response = await newBackendApi.removeFromWishlist(productId)

      if (response.success) {
        // Refresh wishlist after removal
        await fetchWishlist()
        console.log("✅ Item removed from wishlist successfully")
        return { success: true }
      } else {
        const errorMessage = response.error || "Failed to remove item from wishlist"
        setError(errorMessage)
        console.log("❌ Failed to remove from wishlist:", errorMessage)
        return { success: false, error: errorMessage }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to remove item from wishlist"
      setError(errorMessage)
      console.error("❌ Remove from wishlist error:", err)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Clear entire wishlist
  const clearWishlist = async (): Promise<{ success: boolean; error?: string }> => {
    if (!isAuthenticated) {
      return { success: false, error: "Please sign in to clear wishlist" }
    }

    setLoading(true)
    setError(null)

    try {
      console.log("❤️ Clearing wishlist...")
      const response = await newBackendApi.clearWishlist()

      if (response.success) {
        setWishlist(null)
        console.log("✅ Wishlist cleared successfully")
        return { success: true }
      } else {
        const errorMessage = response.error || "Failed to clear wishlist"
        setError(errorMessage)
        console.log("❌ Failed to clear wishlist:", errorMessage)
        return { success: false, error: errorMessage }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to clear wishlist"
      setError(errorMessage)
      console.error("❌ Clear wishlist error:", err)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Move wishlist item to cart
  const moveToCart = async (productId: string, quantity = 1): Promise<{ success: boolean; error?: string }> => {
    if (!isAuthenticated) {
      return { success: false, error: "Please sign in to move items to cart" }
    }

    setLoading(true)
    setError(null)

    try {
      console.log("❤️ Moving wishlist item to cart:", { productId, quantity })
      const response = await newBackendApi.moveWishlistItemToCart(productId, quantity)

      if (response.success) {
        // Refresh wishlist after moving item
        await fetchWishlist()
        console.log("✅ Item moved to cart successfully")
        return { success: true }
      } else {
        const errorMessage = response.error || "Failed to move item to cart"
        setError(errorMessage)
        console.log("❌ Failed to move to cart:", errorMessage)
        return { success: false, error: errorMessage }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to move item to cart"
      setError(errorMessage)
      console.error("❌ Move to cart error:", err)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Check if product is in wishlist
  const checkWishlist = async (productId: string): Promise<{ isInWishlist: boolean; addedAt: Date | null }> => {
    if (!isAuthenticated) {
      return { isInWishlist: false, addedAt: null }
    }

    try {
      console.log("❤️ Checking wishlist for product:", productId)
      const response = await newBackendApi.checkWishlist(productId)

      if (response.success && response.data) {
        return {
          isInWishlist: response.data.isInWishlist,
          addedAt: response.data.addedAt,
        }
      } else {
        console.log("❌ Failed to check wishlist:", response.error)
        return { isInWishlist: false, addedAt: null }
      }
    } catch (err) {
      console.error("❌ Check wishlist error:", err)
      return { isInWishlist: false, addedAt: null }
    }
  }

  // Check if product is in wishlist (local check)
  const isInWishlist = (productId: string): boolean => {
    if (!wishlist || !wishlist.items) {
      return false
    }
    return wishlist.items.some((item) => item.productId === productId)
  }

  // Get total number of items in wishlist
  const getWishlistItemCount = (): number => {
    if (!wishlist || !wishlist.items) {
      return 0
    }
    return wishlist.items.length
  }

  // Get total value of wishlist
  const getWishlistValue = (): number => {
    if (!wishlist || !wishlist.items) {
      return 0
    }
    return wishlist.items.reduce((total, item) => total + item.price, 0)
  }

  // Refresh wishlist data
  const refreshWishlist = async (): Promise<void> => {
    await fetchWishlist()
  }

  // Get wishlist statistics
  const getWishlistStats = async (): Promise<WishlistStats | null> => {
    if (!isAuthenticated) {
      return null
    }

    try {
      console.log("❤️ Fetching wishlist stats...")
      const response = await newBackendApi.getWishlistStats()

      if (response.success && response.data?.stats) {
        console.log("✅ Wishlist stats fetched successfully")
        return response.data.stats
      } else {
        console.log("❌ Failed to fetch wishlist stats:", response.error)
        return null
      }
    } catch (err) {
      console.error("❌ Wishlist stats error:", err)
      return null
    }
  }

  const contextValue: WishlistContextType = {
    wishlist,
    loading,
    error,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    moveToCart,
    checkWishlist,
    isInWishlist,
    getWishlistItemCount,
    getWishlistValue,
    refreshWishlist,
    getWishlistStats,
    clearError,
  }

  return <WishlistContext.Provider value={contextValue}>{children}</WishlistContext.Provider>
}

// Custom hook to use the wishlist context
export function useWishlist(): WishlistContextType {
  const context = useContext(WishlistContext)
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider")
  }
  return context
}

// Export the context for advanced usage
export { WishlistContext }
