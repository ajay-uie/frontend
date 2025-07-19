"use client"

import { useState } from "react"
import { X, Gift, Sparkles, Truck, Shield } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export default function DiscountBanner() {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="bg-gradient-to-r from-red-600 to-red-700 text-white relative overflow-hidden z-40"
      >
        <div className="relative">
          <div className="flex animate-marquee whitespace-nowrap py-3 text-sm font-medium">
            <span className="mx-8 inline-flex items-center gap-2 flex-shrink-0">
              <Gift className="w-4 h-4 flex-shrink-0" />
              BUY 2 GET 1 FREE™ - Limited Time Offer!
            </span>
            <span className="mx-8 inline-flex items-center gap-2 flex-shrink-0">
              <Sparkles className="w-4 h-4 flex-shrink-0" />
              Only 100ml Available - Premium Collection
            </span>
            <span className="mx-8 inline-flex items-center gap-2 flex-shrink-0">
              <Truck className="w-4 h-4 flex-shrink-0" />
              Free Shipping on Orders Above ₹2999
            </span>
            <span className="mx-8 inline-flex items-center gap-2 flex-shrink-0">
              <Shield className="w-4 h-4 flex-shrink-0" />
              Authentic Luxury Fragrances
            </span>
            <span className="mx-8 inline-flex items-center gap-2 flex-shrink-0">
              <Gift className="w-4 h-4 flex-shrink-0" />
              BUY 2 GET 1 FREE™ - Limited Time Offer!
            </span>
            <span className="mx-8 inline-flex items-center gap-2 flex-shrink-0">
              <Sparkles className="w-4 h-4 flex-shrink-0" />
              Only 100ml Available - Premium Collection
            </span>
            <span className="mx-8 inline-flex items-center gap-2 flex-shrink-0">
              <Truck className="w-4 h-4 flex-shrink-0" />
              Free Shipping on Orders Above ₹2999
            </span>
            <span className="mx-8 inline-flex items-center gap-2 flex-shrink-0">
              <Shield className="w-4 h-4 flex-shrink-0" />
              Authentic Luxury Fragrances
            </span>
          </div>
        </div>

        <button
          onClick={() => setIsVisible(false)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1.5 hover:bg-white/20 rounded-full transition-all duration-200 hover:scale-110 z-50"
          aria-label="Close banner"
        >
          <X size={14} />
        </button>
      </motion.div>
    </AnimatePresence>
  )
}
