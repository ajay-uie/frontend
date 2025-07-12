"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ProductGalleryProps {
  images: string[]
  productName: string
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Ensure we have at least one image
  const galleryImages = images.length > 0 ? images : ["/placeholder.svg"]

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length)
  }

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-50">
        <Image
          src={galleryImages[currentImageIndex] || "/placeholder.svg"}
          alt={`${productName} - Image ${currentImageIndex + 1}`}
          fill
          className="object-cover"
          priority
        />

        {/* Navigation Arrows */}
        {galleryImages.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
              onClick={prevImage}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
              onClick={nextImage}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>

      {/* Thumbnail Images */}
      {galleryImages.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {galleryImages.map((image, index) => (
            <button
              key={index}
              className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                currentImageIndex === index ? "border-black" : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => setCurrentImageIndex(index)}
            >
              <Image
                src={image || "/placeholder.svg"}
                alt={`${productName} - Thumbnail ${index + 1}`}
                width={100}
                height={100}
                className="object-cover w-full h-full"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
