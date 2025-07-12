"use client"

import { useState, useEffect, useCallback } from "react"
import { firebaseService } from "./firebase-service"

export interface WishlistItem {
  productId: string | number
  name: string
  price: number
  originalPrice?: number
  image: string
  size: string
  category: string
  isAvailable: boolean
  addedAt: string
}

interface WishlistService {
  wishlist: WishlistItem[]
  isLoading: boolean
  add: (item: Omit<WishlistItem, "addedAt">) => Promise<void>
  remove: (productId: string | number) => Promise<void>
  isInWishlist: (productId: string | number) => boolean
  clear: () => Promise<void>
  getCount: () => number
}

export function useWishlist(userId?: string): WishlistService {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const getStorageKey = useCallback(() => {
    return userId ? `wishlist_${userId}` : "wishlist_guest"
  }, [userId])

  // Load wishlist from Firebase or localStorage
  useEffect(() => {
    const loadWishlist = async () => {
      try {
        setIsLoading(true)

        if (userId) {
          // Try to load from Firebase first
          try {
            const userProfile = await firebaseService.getUserProfile(userId)
            if (userProfile?.wishlist) {
              setWishlist(userProfile.wishlist)
              return
            }
          } catch (error) {
            console.warn("Failed to load wishlist from Firebase, using localStorage:", error)
          }
        }

        // Fallback to localStorage
        const stored = localStorage.getItem(getStorageKey())
        if (stored) {
          const parsedWishlist = JSON.parse(stored)
          setWishlist(Array.isArray(parsedWishlist) ? parsedWishlist : [])
        } else {
          setWishlist([])
        }
      } catch (error) {
        console.error("Error loading wishlist:", error)
        setWishlist([])
      } finally {
        setIsLoading(false)
      }
    }

    loadWishlist()
  }, [getStorageKey, userId])

  // Save to Firebase and localStorage whenever wishlist changes
  useEffect(() => {
    if (!isLoading) {
      try {
        // Save to localStorage
        localStorage.setItem(getStorageKey(), JSON.stringify(wishlist))

        // Save to Firebase if user is logged in
        if (userId) {
          firebaseService.updateUserProfile(userId, { wishlist }).catch((error) => {
            console.warn("Failed to save wishlist to Firebase:", error)
          })
        }
      } catch (error) {
        console.error("Error saving wishlist:", error)
      }
    }
  }, [wishlist, isLoading, getStorageKey, userId])

  const add = async (item: Omit<WishlistItem, "addedAt">) => {
    const newItem: WishlistItem = {
      ...item,
      addedAt: new Date().toISOString(),
    }

    setWishlist((prev) => {
      const exists = prev.some((w) => String(w.productId) === String(item.productId))
      if (exists) {
        return prev
      }
      return [...prev, newItem]
    })
  }

  const remove = async (productId: string | number) => {
    setWishlist((prev) => prev.filter((item) => String(item.productId) !== String(productId)))
  }

  const isInWishlist = (productId: string | number): boolean => {
    return wishlist.some((item) => String(item.productId) === String(productId))
  }

  const clear = async () => {
    setWishlist([])
  }

  const getCount = (): number => {
    return wishlist.length
  }

  return {
    wishlist,
    isLoading,
    add,
    remove,
    isInWishlist,
    clear,
    getCount,
  }
}
