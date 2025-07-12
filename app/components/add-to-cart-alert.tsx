"use client"

import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle, ShoppingBag, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/contexts/cart-context"
import { useState, useEffect } from "react"

interface AddToCartAlertProps {
  product: {
    id: string
    name: string
    price: number
    image: string
  } | null
  onClose: () => void
}

export default function AddToCartAlert({ product, onClose }: AddToCartAlertProps) {
  const { openCart, itemCount } = useCart()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (product) {
      setIsVisible(true)
      const timer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(onClose, 300)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [product, onClose])

  if (!product) return null

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -100 }}
          className="fixed top-4 right-4 z-50 bg-white border border-green-200 rounded-lg shadow-lg p-4 max-w-sm"
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <CheckCircle className="h-6 w-6 text-green-500" />
            </div>
            
            <div className="flex-1">
              <h3 className="font-medium text-sm text-gray-900">
                Added to cart!
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {product.name}
              </p>
              
              <div className="flex gap-2 mt-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    openCart()
                    onClose()
                  }}
                  className="text-xs"
                >
                  <ShoppingBag className="h-3 w-3 mr-1" />
                  View Cart ({itemCount})
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsVisible(false)}
                  className="text-xs"
                >
                  Continue
                </Button>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
              className="h-6 w-6 p-0 flex-shrink-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
