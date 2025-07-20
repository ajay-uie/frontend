"use client"

import { useState, useEffect } from "react"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useAuth } from "@/contexts/auth-context"

interface WishlistButtonProps {
  productId: string
  productName: string
  productBrand?: string
  productPrice: number
  productImage?: string
  productSize?: string
  className?: string
  variant?: "default" | "ghost" | "outline"
  size?: "sm" | "md" | "lg"
  showText?: boolean
}

export function WishlistButton({
  productId,
  productName,
  productBrand,
  productPrice,
  productImage,
  productSize = "100ml",
  className = "",
  variant = "ghost",
  size = "md",
  showText = false,
}: WishlistButtonProps) {
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { user, token } = useAuth()

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://backend-8npy.onrender.com'

  // Check if product is in wishlist on mount
  useEffect(() => {
    if (user && token) {
      checkWishlistStatus()
    }
  }, [user, token, productId])

  const checkWishlistStatus = async () => {
    if (!user || !token) return

    try {
      const response = await fetch(`${API_BASE_URL}/api/wishlist/check/${productId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setIsInWishlist(data.isInWishlist)
        }
      }
    } catch (error) {
      console.error('Error checking wishlist status:', error)
    }
  }

  const addToWishlist = async () => {
    if (!user || !token) {
      toast.error("Please sign in to add items to wishlist")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`${API_BASE_URL}/api/wishlist/add`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setIsInWishlist(true)
        toast.success("Added to wishlist")
      } else {
        toast.error(data.message || "Failed to add to wishlist")
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error)
      toast.error("Failed to add to wishlist")
    } finally {
      setIsLoading(false)
    }
  }

  const removeFromWishlist = async () => {
    if (!user || !token) return

    setIsLoading(true)

    try {
      const response = await fetch(`${API_BASE_URL}/api/wishlist/remove/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setIsInWishlist(false)
        toast.success("Removed from wishlist")
      } else {
        toast.error(data.message || "Failed to remove from wishlist")
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error)
      toast.error("Failed to remove from wishlist")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClick = () => {
    if (isInWishlist) {
      removeFromWishlist()
    } else {
      addToWishlist()
    }
  }

  const getButtonSize = () => {
    switch (size) {
      case "sm":
        return "h-8 w-8"
      case "lg":
        return "h-12 w-12"
      default:
        return "h-10 w-10"
    }
  }

  const getIconSize = () => {
    switch (size) {
      case "sm":
        return "h-4 w-4"
      case "lg":
        return "h-6 w-6"
      default:
        return "h-5 w-5"
    }
  }

  if (showText) {
    return (
      <Button
        variant={variant}
        onClick={handleClick}
        disabled={isLoading}
        className={`${className} ${isInWishlist ? 'text-red-500 hover:text-red-600' : 'text-gray-500 hover:text-red-500'}`}
      >
        <Heart
          className={`${getIconSize()} mr-2 ${isInWishlist ? 'fill-current' : ''}`}
        />
        {isLoading ? 'Loading...' : isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
      </Button>
    )
  }

  return (
    <Button
      variant={variant}
      size="icon"
      onClick={handleClick}
      disabled={isLoading}
      className={`${getButtonSize()} ${className} ${
        isInWishlist ? 'text-red-500 hover:text-red-600' : 'text-gray-500 hover:text-red-500'
      }`}
      title={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <Heart
        className={`${getIconSize()} ${isInWishlist ? 'fill-current' : ''}`}
      />
    </Button>
  )
}

