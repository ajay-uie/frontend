"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Truck, Tag } from "lucide-react"

export default function BannerBar() {
  const [currentBanner, setCurrentBanner] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  const banners = [
    {
      id: 1,
      icon: <Truck className="w-4 h-4" />,
      text: "FREE DELIVERY ON ORDERS ABOVE ₹1099",
      bgColor: "bg-black",
      textColor: "text-white",
    },
    {
      id: 2,
      icon: <Tag className="w-4 h-4" />,
      text: "FLAT 15% OFF ON FIRST ORDER - USE CODE: FIRST15",
      bgColor: "bg-gray-800",
      textColor: "text-white",
    },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [banners.length])

  if (!isVisible) return null

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentBanner}
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -50, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className={`${banners[currentBanner].bgColor} ${banners[currentBanner].textColor} py-2 px-4 relative overflow-hidden bg-grain-dark`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-center relative">
          <div className="flex items-center gap-2 text-sm font-medium tracking-wide">
            {banners[currentBanner].icon}
            <span>{banners[currentBanner].text}</span>
          </div>

          <button
            onClick={() => setIsVisible(false)}
            className="absolute right-0 p-1 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress indicator */}
        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-white/20">
          <motion.div
            className="h-full bg-white"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 4, ease: "linear" }}
          />
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
