"use client"

import { useState } from "react"
import Image from "next/image"

interface ImageWithFallbackProps {
  src: string
  alt: string
  className?: string
  width?: number
  height?: number
  fallbackSrc?: string
}

export default function ImageWithFallback({
  src,
  alt,
  className = "",
  width,
  height,
  fallbackSrc = "/placeholder.svg?height=400&width=300",
}: ImageWithFallbackProps) {
  const [imgSrc, setImgSrc] = useState(src)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const handleError = () => {
    console.warn(`Image failed to load: ${imgSrc}`)
    if (imgSrc !== fallbackSrc) {
      setImgSrc(fallbackSrc)
      setHasError(true)
    }
  }

  const handleLoad = () => {
    setIsLoading(false)
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && <div className="absolute inset-0 bg-gray-200 animate-pulse rounded" />}
      <Image
        src={imgSrc || "/placeholder.svg"}
        alt={alt}
        width={width || 400}
        height={height || 300}
        className={`${className} ${isLoading ? "opacity-0" : "opacity-100"} transition-opacity duration-300`}
        onError={handleError}
        onLoad={handleLoad}
        unoptimized={imgSrc.includes("placeholder.svg")}
      />
      {hasError && (
        <div className="absolute bottom-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">Fallback</div>
      )}
    </div>
  )
}
