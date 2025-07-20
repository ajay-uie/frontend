"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

export function LuxuryPreloader() {
  const [progress, setProgress] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer)
          setTimeout(() => setIsVisible(false), 500)
          return 100
        }
        return prev + Math.random() * 15
      })
    }, 100)

    return () => clearInterval(timer)
  }, [])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
      <div className="text-center">
        {/* Logo */}
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto mb-4 bg-black rounded-full flex items-center justify-center">
            <span className="text-white text-2xl font-bold">F</span>
          </div>
          <h1 className="text-2xl font-bold text-black">Fragransia™</h1>
          <p className="text-gray-600 text-sm">Premium Fragrances</p>
        </div>

        {/* Loading Animation */}
        <div className="relative w-64 h-1 bg-gray-200 rounded-full overflow-hidden mx-auto mb-4">
          <div
            className={cn("absolute top-0 left-0 h-full bg-black rounded-full transition-all duration-300 ease-out")}
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Loading Text */}
        <p className="text-gray-500 text-sm">
          {progress < 30 && "Initializing..."}
          {progress >= 30 && progress < 60 && "Loading products..."}
          {progress >= 60 && progress < 90 && "Setting up your experience..."}
          {progress >= 90 && "Almost ready..."}
        </p>

        {/* Elegant dots animation */}
        <div className="flex justify-center space-x-1 mt-4">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={cn("w-2 h-2 bg-black rounded-full animate-pulse")}
              style={{
                animationDelay: `${i * 0.2}s`,
                animationDuration: "1s",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
