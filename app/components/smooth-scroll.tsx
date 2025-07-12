"use client"

import { useEffect } from "react"

export default function SmoothScroll() {
  useEffect(() => {
    // Enhanced smooth scrolling with performance optimizations
    const smoothScrollStyle = document.createElement("style")
    smoothScrollStyle.textContent = `
      html {
        scroll-behavior: smooth;
        scroll-padding-top: 80px;
      }
      
      * {
        scroll-behavior: smooth;
      }
      
      /* Enhanced scrolling for webkit browsers */
      ::-webkit-scrollbar {
        width: 8px;
        height: 8px;
      }
      
      ::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 4px;
      }
      
      ::-webkit-scrollbar-thumb {
        background: #c1c1c1;
        border-radius: 4px;
        transition: background 0.3s ease;
      }
      
      ::-webkit-scrollbar-thumb:hover {
        background: #a1a1a1;
      }
      
      /* Smooth momentum scrolling for iOS */
      body {
        -webkit-overflow-scrolling: touch;
        overscroll-behavior: smooth;
        /* Prevent horizontal scroll */
        overflow-x: hidden;
      }
      
      /* Enhanced smooth scrolling for all elements */
      .smooth-scroll {
        scroll-behavior: smooth;
        -webkit-overflow-scrolling: touch;
      }
      
      /* Performance optimizations */
      .gpu-accelerated {
        transform: translateZ(0);
        backface-visibility: hidden;
        perspective: 1000px;
      }
      
      /* Mobile optimizations */
      @media (max-width: 768px) {
        body {
          -webkit-overflow-scrolling: touch;
          overscroll-behavior-y: contain;
          /* Prevent bounce scrolling on iOS */
          position: relative;
        }
        
        /* Optimize touch interactions */
        * {
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
        }
      }
      
      /* Desktop optimizations */
      @media (min-width: 769px) {
        .gpu-accelerated {
          transform: translate3d(0, 0, 0);
        }
      }
    `

    document.head.appendChild(smoothScrollStyle)

    // Add smooth scrolling class to body
    document.body.classList.add("smooth-scroll")

    // Enhanced scroll performance with throttling
    let ticking = false
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          ticking = false
        })
        ticking = true
      }
    }

    // Passive event listeners for better performance
    window.addEventListener("scroll", handleScroll, { passive: true })

    // Intersection Observer for performance
    const observerOptions = {
      root: null,
      rootMargin: "50px",
      threshold: 0.1,
    }

    // Preload critical resources
    const preloadCriticalImages = () => {
      const criticalImages = ["/images/hero-perfume.jpeg"]

      criticalImages.forEach((src) => {
        const link = document.createElement("link")
        link.rel = "preload"
        link.as = "image"
        link.href = src
        document.head.appendChild(link)
      })
    }

    preloadCriticalImages()

    return () => {
      document.head.removeChild(smoothScrollStyle)
      document.body.classList.remove("smooth-scroll")
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  return null
}
